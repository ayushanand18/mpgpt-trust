import { createHash, createHmac, randomUUID } from "node:crypto"

const ACCESS_KEY_ID = process.env.SP_S3_KEY_ID
const ACCESS_KEY_SECRET = process.env.SP_S3_KEY_SECRET
const S3_BUCKET = process.env.SP_S3_BUCKET
const S3_REGION = process.env.SP_S3_REGION || "auto"
const S3_ENDPOINT = process.env.SP_S3_ENDPOINT
const PROOF_PREFIX = "payment-proofs"
const SIGNED_URL_TTL_SECONDS = 60 * 60
let ensureBucketPromise: Promise<void> | null = null

function requireEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} environment variable is not set`)
  }

  return value
}

function sha256Hex(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex")
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest()
}

function encodeS3Key(value: string) {
  return value
    .split("/")
    .map((segment) =>
      encodeURIComponent(segment).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
    )
    .join("/")
}

function joinUrlPath(basePath: string, ...parts: string[]) {
  const normalizedBase = basePath.replace(/\/$/, "")
  const suffix = parts
    .filter(Boolean)
    .map((part) => part.replace(/^\/+|\/+$/g, ""))
    .join("/")

  return `${normalizedBase}/${suffix}`
}

function getConfig() {
  return {
    accessKeyId: requireEnv(ACCESS_KEY_ID, "SP_S3_KEY_ID"),
    accessKeySecret: requireEnv(ACCESS_KEY_SECRET, "SP_S3_KEY_SECRET"),
    bucket: requireEnv(S3_BUCKET, "SP_S3_BUCKET"),
    endpoint: requireEnv(S3_ENDPOINT, "SP_S3_ENDPOINT"),
    region: S3_REGION,
  }
}

function getDates(now = new Date()) {
  const iso = now.toISOString().replace(/[:-]|\.\d{3}/g, "")
  return {
    amzDate: iso,
    shortDate: iso.slice(0, 8),
  }
}

function getSigningKey(secret: string, shortDate: string, region: string) {
  const dateKey = hmac(`AWS4${secret}`, shortDate)
  const regionKey = hmac(dateKey, region)
  const serviceKey = hmac(regionKey, "s3")
  return hmac(serviceKey, "aws4_request")
}

function buildObjectUrl(key: string) {
  const { bucket, endpoint } = getConfig()
  const base = new URL(endpoint)
  const encodedKey = encodeS3Key(key)
  return new URL(joinUrlPath(base.pathname, bucket, encodedKey), base.origin)
}

function buildBucketUrl() {
  const { bucket, endpoint } = getConfig()
  const base = new URL(endpoint)
  return new URL(joinUrlPath(base.pathname, bucket), base.origin)
}

async function signedRequest(params: {
  method: "PUT" | "DELETE" | "GET" | "HEAD"
  url: URL
  payload: Buffer | string
  contentType?: string
}) {
  const { accessKeyId, accessKeySecret, region } = getConfig()
  const { amzDate, shortDate } = getDates()
  const payloadBuffer = typeof params.payload === "string" ? Buffer.from(params.payload) : params.payload
  const payloadHash = sha256Hex(payloadBuffer)
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date"
  const canonicalHeaders = `host:${params.url.host}
x-amz-content-sha256:${payloadHash}
x-amz-date:${amzDate}
`
  const { credentialScope, signature } = signRequest({
    method: params.method,
    pathname: params.url.pathname,
    query: params.url.searchParams.toString(),
    canonicalHeaders,
    signedHeaders,
    payloadHash,
    amzDate,
    shortDate,
    region,
    accessKeySecret,
  })
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  const headers: Record<string, string> = {
    authorization,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  }

  if (params.contentType) {
    headers["content-type"] = params.contentType
  }

  if (params.method !== "HEAD") {
    headers["content-length"] = String(payloadBuffer.byteLength)
  }

  return fetch(params.url, {
    method: params.method,
    headers,
    body: params.method === "HEAD" ? undefined : payloadBuffer,
  })
}

async function ensurePaymentProofBucket() {
  if (!ensureBucketPromise) {
    ensureBucketPromise = (async () => {
      const url = buildBucketUrl()
      const headResponse = await signedRequest({ method: "HEAD", url, payload: "" })

      if (headResponse.ok) {
        return
      }

      if (headResponse.status !== 404) {
        throw new Error(`Failed to verify payment proof bucket: ${headResponse.status}`)
      }

      const createResponse = await signedRequest({ method: "PUT", url, payload: "" })
      if (!createResponse.ok && createResponse.status !== 409) {
        throw new Error(`Failed to create payment proof bucket: ${createResponse.status}`)
      }
    })().catch((error) => {
      ensureBucketPromise = null
      throw error
    })
  }

  return ensureBucketPromise
}

function buildCanonicalQuery(params: Record<string, string>) {
  return Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&")
}

function signRequest(params: {
  method: "PUT" | "DELETE" | "GET"
  pathname: string
  query: string
  canonicalHeaders: string
  signedHeaders: string
  payloadHash: string
  amzDate: string
  shortDate: string
  region: string
  accessKeySecret: string
}) {
  const canonicalRequest = [
    params.method,
    params.pathname,
    params.query,
    params.canonicalHeaders,
    params.signedHeaders,
    params.payloadHash,
  ].join("\n")

  const credentialScope = `${params.shortDate}/${params.region}/s3/aws4_request`
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    params.amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n")

  const signature = createHmac(
    "sha256",
    getSigningKey(params.accessKeySecret, params.shortDate, params.region)
  )
    .update(stringToSign)
    .digest("hex")

  return { credentialScope, signature }
}

export function buildPaymentProofKey(userId: string, originalName: string) {
  const safeExtension = originalName.includes(".")
    ? originalName.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() ?? ""
    : ""

  const safeUserId = userId.replace(/[^a-zA-Z0-9-_]/g, "")
  return `${PROOF_PREFIX}/${safeUserId}/${Date.now()}-${randomUUID()}${safeExtension ? `.${safeExtension}` : ""}`
}

export function assertPaymentProofKeyOwnership(key: string, userId: string) {
  const expectedPrefix = `${PROOF_PREFIX}/${userId}/`
  if (!key.startsWith(expectedPrefix)) {
    throw new Error("Invalid payment proof key prefix")
  }
}

export async function uploadPaymentProof(key: string, file: File) {
  const { accessKeyId, accessKeySecret, region } = getConfig()
  const url = buildObjectUrl(key)
  const { amzDate, shortDate } = getDates()
  const payload = Buffer.from(await file.arrayBuffer())
  const payloadHash = sha256Hex(payload)
  const canonicalHeaders = `host:${url.host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date"
  const { credentialScope, signature } = signRequest({
    method: "PUT",
    pathname: url.pathname,
    query: "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
    amzDate,
    shortDate,
    region,
    accessKeySecret,
  })
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      authorization,
      "content-length": String(payload.byteLength),
      "content-type": file.type || "application/octet-stream",
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    },
    body: payload,
  })

  if (!response.ok) {
    throw new Error(`Failed to upload payment proof: ${response.status}`)
  }
}

export async function deletePaymentProof(key: string) {
  const { accessKeyId, accessKeySecret, region } = getConfig()
  const url = buildObjectUrl(key)
  const { amzDate, shortDate } = getDates()
  const payloadHash = sha256Hex("")
  const canonicalHeaders = `host:${url.host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date"
  const { credentialScope, signature } = signRequest({
    method: "DELETE",
    pathname: url.pathname,
    query: "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
    amzDate,
    shortDate,
    region,
    accessKeySecret,
  })
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      authorization,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    },
  })

  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to delete payment proof: ${response.status}`)
  }
}

export function createPaymentProofSignedUrl(key: string, expiresInSeconds = SIGNED_URL_TTL_SECONDS) {
  const { accessKeyId, accessKeySecret, region } = getConfig()
  const url = buildObjectUrl(key)
  const { amzDate, shortDate } = getDates()
  const signedHeaders = "host"
  const query = buildCanonicalQuery({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${accessKeyId}/${shortDate}/${region}/s3/aws4_request`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresInSeconds),
    "X-Amz-SignedHeaders": signedHeaders,
  })
  const canonicalHeaders = `host:${url.host}\n`
  const { signature } = signRequest({
    method: "GET",
    pathname: url.pathname,
    query,
    canonicalHeaders,
    signedHeaders,
    payloadHash: "UNSIGNED-PAYLOAD",
    amzDate,
    shortDate,
    region,
    accessKeySecret,
  })

  url.search = `${query}&X-Amz-Signature=${signature}`
  return url.toString()
}

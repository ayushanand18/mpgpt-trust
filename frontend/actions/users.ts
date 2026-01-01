import { createClient } from "@/lib/supabase/client"

export async function getUser(accessToken?: string, id?: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${id}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch user: ${res.status}`)
  }

  const respJson = await res.json()

  return respJson.Data
}

export async function createUser() {
    const supabase = createClient()
    const { data: sessionData } = await supabase.auth.getSession()
    const { session } = sessionData

    if (!session) {
        throw new Error('No active session found')
    }

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
                Name: session.user.user_metadata.full_name || "Library User",
                Email: session.user.email,
                PhoneNumber: session.user.user_metadata.phone || "",
                Id: session.user.id,
                UserName: session.user.email || "",
                Role: "student",
            })
        },
    )

    if (!res.ok) {
        throw new Error(`Failed to create user: ${res.status}`)
    }

    const respJson = await res.json()
    return respJson.Data
}
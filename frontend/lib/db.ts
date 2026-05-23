import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL environment variable is not set. Use the Supabase session pooler URL.'
  )
}

export const sql = postgres(databaseUrl, {
  ssl: 'require',
})

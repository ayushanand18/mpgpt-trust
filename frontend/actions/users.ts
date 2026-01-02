import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

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

export async function editUser(editData: any) {
  const { data: { session }, error } = await supabase.auth.getSession()

  if (!session || error) {
    throw new Error('No active session found')
  }


  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${session.user.id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        Name: editData.name ?? "Library User",
        Email: editData.email ?? "",
        PhoneNumber: editData.phone ?? "",
        Id: editData.id ?? session.user.id,
        MemberId: editData.memberId ?? "",
      })
    },
  )

  if (!res.ok) {
    throw new Error(`Failed to create user: ${res.status}`)
  }

  const respJson = await res.json()
  return respJson.Data
}

export async function searchUsers(searchType: string, searchValue: string) {
  const { data: { session }, error } = await supabase.auth.getSession()

  if (!session || error) {
    throw new Error('No active session found')
  }

  let searchQuery: any = {}
  switch (searchType) {
    case 'memberId':
      searchQuery['MemberIds'] = [searchValue]
      break
    case 'email':
      searchQuery['Emails'] = [searchValue]
      break
    case 'phoneNumber':
      searchQuery['PhoneNumbers'] = [searchValue]
      break
    default:
      throw new Error(`Invalid search type: ${searchType}`)
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/users`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(searchQuery)
    }
  )

  if (!res.ok) {
    throw new Error(`Failed to search users: ${res.status}`)
  }

  const respJson = await res.json()
  return respJson.Data
}
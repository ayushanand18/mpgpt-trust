import { createClient } from "@/lib/supabase/client"
import type { User } from "@/types"

const supabase = createClient()

export async function getUser(accessToken?: string, id?: string) {
  const res = await fetch(
    `/api/user/${id}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
    `/api/user`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Name: session.user.user_metadata.full_name || "Library User",
        Email: session.user.email,
        PhoneNumber: session.user.user_metadata.phone || "",
        Id: session.user.id,
        UserName: session.user.email || "",
        Role: "member",
      })
    },
  )

  if (!res.ok) {
    throw new Error(`Failed to create user: ${res.status}`)
  }

  const respJson = await res.json()
  return respJson.Data
}

export async function editUser(editData: Partial<User>) {
  const { data: { session }, error } = await supabase.auth.getSession()

  if (!session || error) {
    throw new Error('No active session found')
  }

  const res = await fetch(
    `/api/user/${session.user.id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Name: editData.Name ?? "Library User",
        Email: editData.Email ?? "",
        PhoneNumber: editData.PhoneNumber ?? "",
        Id: editData.Id ?? session.user.id,
        MemberId: editData.MemberId ?? "",
        Role: editData.Role ?? "member",
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

  const searchQuery: { [key: string]: string[] } = {};
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
    `/api/users`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
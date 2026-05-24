// Database types matching the schema from migrations

export interface User {
  id: string
  name: string
  username: string
  role: string
  member_id: string | null
  email: string | null
  phone_number: string | null
  created_at: Date
  updated_at: Date | null
}

export interface Library {
  id: number
  name: string
  latitude: number
  longitude: number
  address: string
  remarks: number
  status: string
}

export interface Booking {
  id: number
  library_id: number
  member_id: string
  start_time: Date
  end_time: Date
  status: string
  purpose: string | null
  created_at: Date
}

export interface Credit {
  id: number
  entity_id: string
  entity_type: string
  value: number
  created_at: Date
  updated_at: Date | null
  created_by: string | null
  updated_by: string | null
  created_by_type: string | null
  updated_by_type: string | null
}

export interface CreditHistory {
  id: number
  entity_id: string
  entity_type: string
  value: number
  comments: string
  reason: string
  created_at: Date
}

export interface AdminLibraryMapping {
  id: number
  library_id: number
  member_id: string
}

export interface Counter {
  id: number
  name: string
  value: bigint
}

export interface Payment {
  id: string
  student_user_id: string
  student_member_id: string
  amount_paid: number
  utr_number: string
  payment_date: string
  file_path: string
  status: string
  student_note: string | null
  review_comment: string | null
  credits_to_add: number
  reviewed_by: string | null
  reviewed_at: Date | null
  created_at: Date
  updated_at: Date
}

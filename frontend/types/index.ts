export interface User {
  Id: string
  MemberId: string
  Name: string
  Email: string
  PhoneNumber: string
  CreatedAt: string
  Credits: number
  Role: string
}

export interface Library {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
  admins: any[]
}

export interface Booking {
  id: string
  memberId: string
  libraryId: number
  userName: string
  startTime: string
  endTime: string
  status: "active" | "completed" | "cancelled"
}

export interface UserData {
  id: string
  email: string
  phone: string
  name: string
  memberId: string
  address: string
  city: string
  zipCode: string
}

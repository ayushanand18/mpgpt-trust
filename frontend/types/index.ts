export interface User {
  Id: string
  MemberId: string
  Name: string
  Email: string
  PhoneNumber: string
}

export interface Library {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  capacity: number
  openingHours: string
  adminUsers: string[]
}

export interface Booking {
  id: string
  userId: string
  libraryId: string
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


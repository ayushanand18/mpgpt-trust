export interface User {
  id: string
  memberId: string
  name: string
  email: string
  phoneNumber: string
  credits: number
  joinedDate: string
  status: "active" | "inactive"
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

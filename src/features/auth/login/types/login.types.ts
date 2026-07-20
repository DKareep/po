type UserRole = 'admin' | 'driver'

export type LoginUser = {
  id: string
  username: string
  role: UserRole
  driverId: string
  name: string
}

export type LoginRequest = {
  username: string
  password: string
}

export type LoginResponse = {
  token: string
  user: LoginUser
}

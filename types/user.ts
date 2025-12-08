export interface User {
  username: string
  token?: string
}

export interface JwtPayload {
  username: string
  exp: number
  iat?: number
}


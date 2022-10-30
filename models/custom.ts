import jwt from 'jsonwebtoken'
import { GraphQLError } from 'graphql'
import { Request } from 'express'

// Extend GraphQLError to include more details
export interface ServerError extends GraphQLError {
    statusCode?: number
    data?: Array<string>
}

// Extend Request for auth and userId needs
export interface ReqPlus extends Request {
    userId?: string
    isAuth?: boolean
}

// Used for auth check after jwt verfies incoming tokens
// Used to save userId to req
export type DecodedToken = {
    token: jwt.JwtPayload | string
    userId: string
}

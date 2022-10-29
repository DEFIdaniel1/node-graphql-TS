import { GraphQLError } from 'graphql'
import { Request } from 'express'

export interface ServerError extends GraphQLError {
    statusCode?: number
    data?: Array<string>
}

export interface ReqPlus extends Request {
    userId?: string
    isAuth?: boolean
}

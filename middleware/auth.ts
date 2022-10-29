import jwt from 'jsonwebtoken'
import { Response, NextFunction } from 'express'

import { jwtSecret } from '../config'
import { ReqPlus } from '../models/custom'

type decodedToken = {
    token: jwt.JwtPayload | string
    userId: string
}

const auth = (req: ReqPlus, res: Response, next: NextFunction) => {
    /* 
        JWT token authentication middleware
        Adds userId and isAuth value to req object if authenticated
     */
    const authHeader = req.get('Authorization')
    if (!authHeader) {
        req.isAuth = false
        return next()
    }
    // Check if tokens match
    const token = authHeader.split(' ')[1]
    const decodedToken: decodedToken = {
        token: '',
        userId: '',
    }
    try {
        decodedToken.token = jwt.verify(token, `${jwtSecret}`)
    } catch (err) {
        req.isAuth = false
        return next()
    }
    if (!decodedToken) {
        req.isAuth = false
        return next()
    }

    req.userId = decodedToken.userId
    req.isAuth = true
    next()
}
export default auth

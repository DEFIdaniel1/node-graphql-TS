require('dotenv').config()

export const jwtSecret = process.env.JWT_SECRET as string
export const mongoDbPassword = process.env.MONGO_DB_PASSWORD as string
export const mongoUser = process.env.MONGO_USER as string
export const port = process.env.PORT

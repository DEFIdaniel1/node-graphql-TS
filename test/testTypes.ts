export type NewUserResponse = {
    data: {
        createUser: {
            _id?: string
            email: string
        }
    }
}
export type NewUserInput = {
    name: string
    password: string
    email: string
}

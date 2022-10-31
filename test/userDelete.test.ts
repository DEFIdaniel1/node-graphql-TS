import request from 'supertest'
import app from '../app'
import { Token } from '../models/custom'
import { NewUserInput } from './testTypes'

describe('Delete User', () => {
    // Setup. Create new user and login for auth token.
    const newUser: NewUserInput = {
        name: 'delete billy',
        password: 'sometypeofpassword',
        email: 'deleteBilly@test.com',
    }
    let newUserResponse: any
    let newUserId: string

    const loginQuery = {
        query: `{
        login(email: "${newUser.email}", password: "${newUser.password}") {
            userId
            token
        }
      }`,
    }
    let loginResponse: any
    let authToken: Token
    let loginUserId: string

    let deleteResponse: any

    beforeAll(async () => {
        const createUserQuery = {
            query: `	
          mutation {	
            createUser(userInput: {email: "${newUser.email}", name:"${newUser.name}", password:"${newUser.password}"}) {	
                _id	
                email
                name
                status	
              }	
            }	
        `,
        }

        // Create new user
        newUserResponse = await request(app)
            .post('/graphql')
            .send(JSON.stringify(createUserQuery))
            .set('Content-Type', 'application/json')
        newUserId = newUserResponse.body.data.createUser._id

        // Login that new user
        loginResponse = await request(app)
            .post('/graphql')
            .send(JSON.stringify(loginQuery))
            .set('Content-Type', 'application/json')
        authToken = loginResponse.body.data.login.token
        loginUserId = loginResponse.body.data.login.userId
    })
    describe('User is successfully deleted', () => {
        beforeAll(async () => {
            // Delete new user
            const deleteUserQuery = {
                query: `
                    mutation {
                      deleteUser(id: "${loginUserId}")
                    }
                  `,
            }
            deleteResponse = await request(app)
                .post('/graphql')
                .send(JSON.stringify(deleteUserQuery))
                .set('Authorization', `Bearer ${authToken}`)
                .set('Content-Type', 'application/json')
        })
        it('deleteUser request returns true', () => {
            expect(deleteResponse.body.data.deleteUser).toBe(true)
        })
        it('Should get "user not found" from database login check', async () => {
            // Try to login when user is deleted.
            loginResponse = await request(app)
                .post('/graphql')
                .send(JSON.stringify(loginQuery))
                .set('Content-Type', 'application/json')
            expect(loginResponse.error.text).toContain('User not found.')
        })
    })
})

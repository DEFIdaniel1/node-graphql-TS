import request from 'supertest'
import app from '../app'
import { Token } from '../models/custom'
import { NewUserInput } from './testTypes'

describe.skip('Delete User', () => {
    const newUser: NewUserInput = {
        name: 'delete billy',
        password: 'sometypeofpassword',
        email: 'deleteBilly@test.com',
    }
    let newUserResponse: any
    let newUserId: string
    let loginResponse: any
    let authToken: Token
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
        const loginQuery = {
            query: `{
              login(email: "${newUser.email}", password: "${newUser.password}") {
                  userId
                  token
              }
            }`,
        }
        newUserResponse = await request(app)
            .post('/graphql')
            .send(JSON.stringify(createUserQuery))
            .set('Content-Type', 'application/json')
        newUserId = newUserResponse.body.data.createUser._id

        loginResponse = await request(app)
            .post('/graphql')
            .send(JSON.stringify(loginQuery))
            .set('Content-Type', 'application/json')
        authToken = loginResponse.body.data.login.token
    })
    it('deleteUser request returns true', async () => {
        const deleteUserQuery = {
            query: `	
          mutation {	
            deleteUser {	
            }	
          }	
        `,
        }
        expect(
            await request(app)
                .post('/graphql')
                .send(JSON.stringify(deleteUserQuery))
                .set('Authorization', 'application/json')
                .set('Content-Type', 'application/json')
        ).toBe(true)
    })
})

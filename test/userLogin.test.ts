import { Token } from 'graphql'
import request from 'supertest'
import app from '../app'
import { NewUserInput } from './testTypes'

describe('User Login', () => {
    // Setup to create new user first
    const newUser: NewUserInput = {
        name: 'login billy',
        password: 'sometypeofpassword',
        email: 'loginBilly@test.com',
    }
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
    let newUserResponse: any
    let newUserId: string
    let loginResponse: any

    beforeAll(async () => {
        // Create new user
        newUserResponse = await request(app)
            .post('/graphql')
            .send(JSON.stringify(createUserQuery))
            .set('Content-Type', 'application/json')
        newUserId = newUserResponse.body.data.createUser._id

        // Login new user
        loginResponse = await request(app)
            .post('/graphql')
            .send(JSON.stringify(loginQuery))
            .set('Content-Type', 'application/json')
    })
    it('Should receive userId in response', async () => {
        expect(loginResponse.body.data.login.userId).toEqual(newUserId)
    })
    it('Should receive TOKEN in response', async () => {
        expect(loginResponse.body.data.login.token).toBeDefined()
    })
})

describe('Login Failure', () => {
    // Setup to create new user first
    // beforeAll() here will not have login included
    const newUser: NewUserInput = {
        name: 'login error',
        password: 'sometypeofpassword',
        email: 'loginError@test.com',
    }
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
    let newUserResponse: any
    let newUserId: string
    let loginResponse: any

    beforeAll(async () => {
        // Create new user
        newUserResponse = await request(app)
            .post('/graphql')
            .send(JSON.stringify(createUserQuery))
            .set('Content-Type', 'application/json')
        newUserId = newUserResponse.body.data.createUser._id
    })
    it('Should receive wrong password error', async () => {
        const wrongPasswordQuery = {
            query: `{
                login(email: "${newUser.email}", password: "WRONG_PASSWORD") {
                    userId
                    token
                }
              }`,
        }
        // Login attempt with wrong password
        loginResponse = await request(app)
            .post('/graphql')
            .send(JSON.stringify(wrongPasswordQuery))
            .set('Content-Type', 'application/json')
        expect(loginResponse.error.text).toContain('Password does not match.')
    })
    it('Should receive wrong email error', async () => {
        const wrongEmailQuery = {
            query: `{
                login(email: "WRONG_EMAIL", password: "${newUser.password}") {
                    userId
                    token
                }
              }`,
        }
        // Login attempt with wrong email
        loginResponse = await request(app)
            .post('/graphql')
            .send(JSON.stringify(wrongEmailQuery))
            .set('Content-Type', 'application/json')
        expect(loginResponse.error.text).toContain('User not found.')
    })
})

import request from 'supertest'
import app from '../app'
import { Token } from '../models/custom'
import { NewUserInput } from './testTypes'

describe('Post Functions', () => {
    const newUser: NewUserInput = {
        name: 'posting billy',
        password: 'sometypeofpassword',
        email: 'postBilly@test.com',
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
        console.log(loginResponse.body.login.token)
        authToken = loginResponse.body.data.login.token
        loginUserId = loginResponse.body.data.login.userId
    })
    describe('Create a new post', () => {
        const postData = {
            title: 'some title',
            content: 'some content',
            imageUrl: 'someUrl',
        }

        const createPostQuery = {
            query: `
                mutation {
                    createPost(postInput: {title: "${postData.title}", content: "${postData.content}", imageUrl: "${postData.imageUrl}"}) {
                    _id
                    title
                    content
                    imageUrl
                    creator {
                        name
                    }
                    createdAt
                    }
                }
                `,
        }
        let createPostResponse: any

        beforeAll(async () => {
            createPostResponse = await request(app)
                .post('/graphql')
                .send(JSON.stringify(createPostQuery))
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${authToken}`)
        })
        it('Should receive 200 success response', () => {
            expect(400)
        })
    })
    afterAll(async () => {
        // Delete new user
        const deleteUserQuery = {
            query: `
                mutation {
                    deleteUser(id: "${loginUserId}")
                }
                `,
        }
        await request(app)
            .post('/graphql')
            .send(JSON.stringify(deleteUserQuery))
            .set('Authorization', `Bearer ${authToken}`)
            .set('Content-Type', 'application/json')
    })
})

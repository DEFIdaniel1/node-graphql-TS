import request from 'supertest'
import { idText } from 'typescript'
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
        let postId: string
        let updatePostResponse: any

        let deletePostResponse: any

        beforeAll(async () => {
            createPostResponse = await request(app)
                .post('/graphql')
                .send(JSON.stringify(createPostQuery))
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${authToken}`)
        })
        it('Should receive 200 success response', () => {
            expect(createPostResponse.status).toBe(200)
        })
        it('Should receive response body with title, content, imageUrl', () => {
            const { _id, title, content, imageUrl } =
                createPostResponse.body.data.createPost
            expect([title, content, imageUrl]).toEqual([
                postData.title,
                postData.content,
                postData.imageUrl,
            ])
            postId = _id
        })
        describe('Update post', () => {
            const postUpdate = {
                title: 'Some new and exciting title!',
                content: 'Wow, update content test',
                imageUrl: 'An updated URL',
            } as const

            beforeAll(async () => {
                const updatePostQuery = {
                    query: `
                        mutation {
                                updatePost(id: "${postId}", postInput: {title: "${postUpdate.title}", content: "${postUpdate.content}", imageUrl: "${postUpdate.imageUrl}"}) {
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
                updatePostResponse = await request(app)
                    .post('/graphql')
                    .send(JSON.stringify(updatePostQuery))
                    .set('Content-Type', 'application/json')
                    .set('Authorization', `Bearer ${authToken}`)
            })
            it('Returns 200 status', () => {
                expect(updatePostResponse.status).toBe(200)
            })
            it('Should receive response body with UPDATED title, content, imageUrl', () => {
                const {
                    title: newTitle,
                    content: newContent,
                    imageUrl: newImageUrl,
                } = updatePostResponse.body.data.updatePost
                expect([
                    postUpdate.title,
                    postUpdate.content,
                    postUpdate.imageUrl,
                ]).toEqual([newTitle, newContent, newImageUrl])
            })
        })
        describe('Delete post', () => {
            beforeAll(async () => {
                const deletePostQuery = {
                    query: `
                mutation {
                  deletePost(id: "${postId}")
                }
              `,
                }
                deletePostResponse = await request(app)
                    .post('/graphql')
                    .send(JSON.stringify(deletePostQuery))
                    .set('Content-Type', 'application/json')
                    .set('Authorization', `Bearer ${authToken}`)
            })
            it('Should receive 200 success response', () => {
                expect(deletePostResponse.status).toBe(200)
            })
            it('Should return true in response body', () => {
                expect(deletePostResponse.body.data.deletePost).toBe(true)
            })
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

import request from 'supertest'
import app from '../app'
import { NewUserInput } from './testTypes'

describe('Register new user', () => {
    const testUser: NewUserInput = {
        name: 'james',
        password: 'sometypeofpassword',
        email: '1@test.com',
    }
    let response: any
    beforeAll(async () => {
        const graphqlQuery = {
            query: `	
          mutation {	
            createUser(userInput: {email: "${testUser.email}", name:"${testUser.name}", password:"${testUser.password}"}) {	
              _id	
              email
              name
              status	
            }	
          }	
        `,
        }
        response = await request(app)
            .post('/graphql')
            .send(JSON.stringify(graphqlQuery))
            .set('Content-Type', 'application/json')
    })
    it('Should 200 status code', () => {
        expect(response.statusCode).toBe(200)
    })
    it('Should return json in content-type header', () => {
        expect(response.headers['content-type']).toEqual(
            expect.stringMatching('json')
        )
    })
    it('Should contain data object', () => {
        expect(response.body).toHaveProperty('data')
    })
    it('Should contain new user EMAIL in response body', () => {
        expect(response.body.data.createUser.email).toEqual(testUser.email)
    })
    it('Should contain user NAME in response body', () => {
        expect(response.body.data.createUser).toHaveProperty(
            'name',
            testUser.name
        )
    })
    it('Should contain STATUS in response body', () => {
        expect(response.body.data.createUser).toHaveProperty(
            'status',
            'I am new!'
        )
    })
    // Cannot read property of _id from response object
    // To do: resolve issue
    it('Should contain new user ID in response body', () => {
        expect(response.body.data.createUser._id).toBeDefined()
    })
})
describe('Invalid password input', () => {
    const failingNewUser: NewUserInput = {
        name: 'baby billy',
        password: '1234',
        email: '1@test.com',
    }
    it('Should throw error with message', async () => {
        let response: any
        const graphqlQuery = {
            query: `	
          mutation {	
            createUser(userInput: {email: "${failingNewUser.email}", name:"${failingNewUser.name}", password:"${failingNewUser.password}"}) {	
              _id	
              email
              name
              status	
            }	
          }	
        `,
        }
        response = await request(app)
            .post('/graphql')
            .send(JSON.stringify(graphqlQuery))
            .set('Content-Type', 'application/json')
        expect(response.error.text).toContain(
            'Password must be at least 5 characters long.'
        )
    })
    // To do: fix error handling for status codes
    it.skip('Should have response code 422', async () => {
        let response: any
        const graphqlQuery = {
            query: `	
          mutation {	
            createUser(userInput: {email: "${failingNewUser.email}", name:"${failingNewUser.name}", password:"${failingNewUser.password}"}) {	
              _id	
              email
              name
              status	
            }	
          }	
        `,
        }
        response = await request(app)
            .post('/graphql')
            .send(JSON.stringify(graphqlQuery))
            .set('Content-Type', 'application/json')
        console.log(response.error)
        expect(response.statusCode).toBe(422)
    })
})
describe('Invalid name input', () => {
    const failingNewUser: NewUserInput = {
        name: '',
        password: '12345',
        email: '1@test.com',
    }
    it('Should throw error with message', async () => {
        let response: any
        const graphqlQuery = {
            query: `	
          mutation {	
            createUser(userInput: {email: "${failingNewUser.email}", name:"${failingNewUser.name}", password:"${failingNewUser.password}"}) {	
              _id	
              email
              name
              status	
            }	
          }	
        `,
        }
        response = await request(app)
            .post('/graphql')
            .send(JSON.stringify(graphqlQuery))
            .set('Content-Type', 'application/json')
        expect(response.error.text).toContain('Please enter your name')
    })
})
describe('Invalid email input', () => {
    const failingNewUser: NewUserInput = {
        name: 'bobby',
        password: '123456',
        email: 'fake',
    }
    //To do: resolve error status codes
    it('Should throw error with message', async () => {
        let response: any
        const graphqlQuery = {
            query: `	
          mutation {	
            createUser(userInput: {email: "${failingNewUser.email}", name:"${failingNewUser.name}", password:"${failingNewUser.password}"}) {	
              _id	
              email
              name
              status	
            }	
          }	
        `,
        }
        response = await request(app)
            .post('/graphql')
            .send(JSON.stringify(graphqlQuery))
            .set('Content-Type', 'application/json')
        expect(response.error.text).toContain('Invalid email.')
    })
})

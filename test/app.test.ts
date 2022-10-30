import request from 'supertest'
import app from '../app'
import { NewUserInput, NewUserResponse } from './testTypes'

describe('App', () => {
    describe('Test the root path', () => {
        it('Empty GET should provide a 400 response', async () => {
            await request(app).get('/graphql').expect(400)
        })
    })
    describe('Register new user', () => {
        const testUser: NewUserInput = {
            name: 'james',
            password: 'sometypeofpassword',
            email: 'james3@test.com',
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
            console.log(response.body.createUser)
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
                'I am new'
            )
        })
        it('Should contain new user ID in response body', () => {
            expect(response.body.createUser).toHaveProperty('_id')
        })
    })
})

import request from 'supertest'
import app from '../app'

describe('App', () => {
    describe('Test the root path', () => {
        it('Empty GET should provide a 400 response', async () => {
            await request(app).get('/graphql').expect(400)
        })
    })
})

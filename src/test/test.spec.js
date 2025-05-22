const app = require('../app.js');
const supertest = require('supertest');
const { faker } = require('@faker-js/faker');

describe('SERVER /', () => {

    test('deberia responder un codigo de estado 404',async () => {
        const response = await supertest(app).get('/').send();
        expect(response.statusCode).toBe(404);
    });

    test('deberia responder un texto', async () => {
        const response = await supertest(app).get('/logout').send();
        expect(response.body).toBeInstanceOf(Object);
    });

    test('deberia responder con un error', async () => {
        const response = await supertest(app).post('/login').send({
            email: faker.internet.email(),
            password: faker.string.alphanumeric(),
        });
        expect(response.statusCode).toBe(400);
    });
});
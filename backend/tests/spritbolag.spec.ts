var should    = require('chai').should();
var supertest = require('supertest');
var api       = supertest('http://localhost:3000/api');

describe('Spritbolag unit tests:', () => {
    it('Should create a Spritbolag instance', (done: Function) => {
        api.post('/spritbolags').send({}).expect(200, done);
    });
});

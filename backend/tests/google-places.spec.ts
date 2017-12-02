var should    = require('chai').should();
var supertest = require('supertest');
var api       = supertest('http://localhost:3000/api');

describe('GooglePlaces unit tests:', () => {
    it('Should create a GooglePlaces instance', (done: Function) => {
        api.post('/google-places').send({}).expect(200, done);
    });
});

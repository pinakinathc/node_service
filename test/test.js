'use strict'

process.env.NODE_ENV = 'test'

let chai = require('chai')
let chaiHttp = require('chai-http')
chai.should()

chai.use(chaiHttp)

let token = ''

describe('Backend Services', (done) => {
  describe('Login Service', (done) => {
    it('should return a Token on receiving any login and pasword', (done) => {
      let jsonSend = {
        'username': 'test_username',
        'password': 'test_password'
      }
      chai.request('127.0.0.1:3000')
        .post('/login')
        .send(jsonSend)
        .end((err, res) => {
          if (err) {
            done(err)
          }
          res.should.have.status(200)
          res.body.should.have.property('token')
          token = res.body.token
          res.body.token.should.be.a('string')
          done()
        })
    })
  })
  describe('Patch Json Service', (done) => {
    it('the post request will return a modified JSON', (done) => {
      let jsonSend = {
        'token': token,
        'mydoc': {
          'baz': 'qux',
          'foo': 'bar'
        },
        'thepatch': [
          { 'op': 'replace', 'path': '/baz', 'value': 'boo' },
          { 'op': 'add', 'path': '/hello', 'value': ['world'] },
          { 'op': 'remove', 'path': '/foo' }
        ]
      }
      chai.request('127.0.0.1:3000')
        .post('/patch')
        .type('json')
        .send(jsonSend)
        .end((err, res) => {
          if (err) {
            done(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          done()
        })
    })
  })
})

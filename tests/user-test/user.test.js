const request = require("supertest")
const { expect } = require("chai")

const app = require("../../server")
const User = require("../../models/user")
const { sampleUsers, populateUsers } = require("./user-data")

describe("Requests --> User:", () => {
  beforeEach(populateUsers)

  describe("POST '/users/signup'", () => {
    it("should create a new user account", done => {
      const email = "example@yahoo.com"
      const password = "password123"

      request(app)
        .post("/users/signup")
        .send({ email, password })
        .expect(200)
        .expect("Content-Type", /json/)
        .expect(res => {
          expect(res.header["x-auth"]).to.exist
          expect(res.body.userObj._id).to.exist
          expect(res.body.userObj.email).to.equal(email)
        })
        .end(err => {
          err
            ? done(err)
            : User.find({ email })
                .then(user => {
                  expect(user).to.exist
                  expect(user.password).to.not.equal(password)
                  done()
                })
                .catch(err => done(err))
        })
    })

    it("should return validation error if request is invalid", done => {
      const email = "kafil.kiron"
      const password = "0981"

      request(app)
        .post("/users/signup")
        .send({ email, password })
        .expect("Content-Type", /html/)
        .expect(res => {
          expect(res.statusCode).to.equal(400)
          expect(res.body).to.be.an("object").that.is.empty
        })
        .end(done)
    })

    it("should not create a new user if email is in use", done => {
      const email = sampleUsers[1].email
      const password = "0000001"

      request(app)
        .post("/users/signup")
        .send({ email, password })
        .expect("Content-Type", /json/)
        .expect(res => {
          expect(res.statusCode).to.equal(422)
          expect(res.body).to.eql({ message: "Email is in use" })
        })
        .end(err => {
          err
            ? done(err)
            : User.find()
                .then(users => {
                  expect(users.length).to.equal(2)
                  done()
                })
                .catch(err => done(err))
        })
    })
  })

  describe("POST '/users/login'", () => {
    it("should return a token for valid login credentials", done => {
      const { _id, email, password } = sampleUsers[1]

      request(app)
        .post("/users/login")
        .send({ email, password })
        .expect(200)
        .expect("Content-Type", /json/)
        .expect(res => expect(res.header["x-auth"]).to.exist)
        .end((err, res) => {
          err
            ? done(err)
            : User.findById(_id)
                .then(user => {
                  expect(user.tokens[0]).to.include({
                    access: "auth",
                    token: res.header["x-auth"]
                  })
                  done()
                })
                .catch(err => done(err))
        })
    })

    it("should return 400 when invalid login info used", done => {
      const { _id, email } = sampleUsers[1]
      const password = "000009"

      request(app)
        .post("/users/login")
        .send({ email, password })
        .expect("Content-Type", /html/)
        .expect(res => {
          expect(res.statusCode).to.equal(400)
          expect(res.header["x-auth"]).to.be.a("undefined")
        })
        .end(err => {
          err
            ? done(err)
            : User.findById(_id)
                .then(user => {
                  expect(user.tokens.length).to.equal(0)
                  done()
                })
                .catch(err => done(err))
        })
    })
  })

  describe("GET '/users/me'", () => {
    it("should return user if authenticated", done => {
      request(app)
        .get("/users/me")
        .set("x-auth", sampleUsers[0].tokens[0].token)
        .expect(200)
        .expect("Content-Type", /json/)
        .expect(res => {
          expect(res.body._id).to.equal(sampleUsers[0]._id.toHexString())
          expect(res.body.email).to.equal(sampleUsers[0].email)
        })
        .end(done)
    })

    it("should return 401 if user is not authenticated", done => {
      request(app)
        .get("/users/me")
        .expect("Content-Type", /html/)
        .expect(res => {
          expect(res.statusCode).to.equal(401)
          expect(res.body).to.be.an("object").that.is.empty
        })
        .end(done)
    })
  })
})

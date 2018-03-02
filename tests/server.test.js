const request = require("supertest")
const expect = require("expect")
const { ObjectID } = require("mongodb")

const app = require("../server")
const ToDo = require("../models/todo")
const User = require("../models/user")

describe("App", () => {
  describe("Requests --> Todo", () => {
    const sampleToDos = [
      {
        _id: new ObjectID(),
        todo: "Sample todo no. 1"
      },
      {
        _id: new ObjectID(),
        todo: "Sample todo no. 2",
        completed: true
      }
    ]

    beforeEach(function(done) {
      this.timeout(4000)
      ToDo.remove({})
        .then(() => ToDo.insertMany(sampleToDos))
        .then(() => done())
    })

    describe("POST '/todos", () => {
      it("should create a new todo", done => {
        const todo = "New stuff to do"

        request(app)
          .post("/todos")
          .send({ todo })
          .expect(200)
          .expect("Content-Type", /json/)
          .expect(res => expect(res.body.todoItem.todo).toBe(todo))
          .end(err => {
            err
              ? done(err)
              : ToDo.find({ todo })
                  .then(todos => {
                    expect(todos.length).toBe(1)
                    expect(todos[0].todo).toBe(todo)
                    done()
                  })
                  .catch(err => done(err))
          })
      })

      it("should not create a new todo with bad data", done => {
        request(app)
          .post("/todos")
          .send({ todo: "" })
          .expect(400)
          .expect("Content-Type", /html/)
          .end(err => {
            err
              ? done(err)
              : ToDo.find()
                  .then(todos => {
                    expect(todos.length).toBe(sampleToDos.length)
                    done()
                  })
                  .catch(err => done(err))
          })
      })
    })

    describe("GET '/todos'", () => {
      it("should get all the todos", done => {
        request(app)
          .get("/todos")
          .expect(200)
          .expect("Content-Type", /json/)
          .expect(res => expect(res.body.todos.length).toBe(sampleToDos.length))
          .end(done)
      })
    })

    describe("GET '/todos/:id'", () => {
      it("should send a status of 404 for non-object ID", done => {
        request(app)
          .get("/todos/123")
          .expect(res => expect(res.statusCode).toBe(404))
          .end(done)
      })

      it("should send a todo item", done => {
        request(app)
          .get(`/todos/${sampleToDos[0]._id}`)
          .expect(200)
          .expect("content-Type", /json/)
          .expect(res => expect(res.body.todo.todo).toBe(sampleToDos[0].todo))
          .end(done)
      })

      it("should send 400 status for valid ID with no todo", done => {
        request(app)
          .get(`/todos/${new ObjectID().toHexString()}`)
          .expect(res => expect(res.statusCode).toBe(400))
          .end(done)
      })
    })

    describe("DELETE '/todos/:id'", () => {
      it("should delete the todo with valid ID", done => {
        const hexId = sampleToDos[1]._id.toHexString()

        request(app)
          .delete(`/todos/${hexId}`)
          .expect(200)
          .expect(res => expect(res.body.todo.todo).toBe(sampleToDos[1].todo))
          .end(err => {
            err
              ? done(err)
              : ToDo.findById(hexId)
                  .then(todo => {
                    expect(todo).toBeNull()
                    done()
                  })
                  .catch(err => done(err))
          })
      })

      it("should send a status of 404 for non-object ID", done => {
        request(app)
          .delete("/todos/123")
          .expect(res => expect(res.statusCode).toBe(404))
          .end(done)
      })

      it("should send 400 status if todo not found", done => {
        request(app)
          .delete(`/todos/${new ObjectID().toHexString()}`)
          .expect(res => expect(res.statusCode).toBe(400))
          .end(err => {
            err
              ? done(err)
              : ToDo.find()
                  .then(todos => {
                    expect(todos.length).toBe(sampleToDos.length)
                    done()
                  })
                  .catch(err => done(err))
          })
      })
    })

    describe("PATCH '/todos/:id'", () => {
      it("should update the todo", done => {
        const hexId = sampleToDos[0]._id.toHexString()
        const body = { todo: "This todo is done", completed: true }

        request(app)
          .patch(`/todos/${hexId}`)
          .send(body)
          .expect(200)
          .expect("Content-Type", /json/)
          .expect(res => {
            expect(res.body.todo.todo).toBe(body.todo)
            expect(res.body.todo.completed).toBe(true)
            expect(typeof res.body.todo.completedAt).toBe("number")
          })
          .end(done)
      })

      it("should set completedAt to null when todo is not completed", done => {
        const hexId = sampleToDos[1]._id.toHexString()
        const body = { todo: "Finish this todo", completed: false }

        request(app)
          .patch(`/todos/${hexId}`)
          .send(body)
          .expect(200)
          .expect("Content-Type", /json/)
          .expect(res => {
            expect(res.body.todo.todo).toBe(body.todo)
            expect(res.body.todo.completed).toBe(false)
            expect(res.body.todo.completedAt).toBeNull()
          })
          .end(done)
      })
    })
  })

  describe("Requests --> User:", () => {
    beforeEach(done => {
      User.remove({}).then(() => done())
    })

    describe("POST '/users", () => {
      it("should create a new user account", done => {
        const email = "example@yahoo.com"
        const password = "password123"

        request(app)
          .post("/users")
          .send({ email, password })
          .expect(200)
          .expect("Content-Type", /json/)
          .expect(res => expect(res.body.userObj.email).toBe(email))
          .end(err => {
            err
              ? done(err)
              : User.find()
                  .then(users => {
                    expect(users.length).toBe(1)
                    expect(users[0].email).toBe(email)
                    done()
                  })
                  .catch(err => done(err))
          })
      })

      it("should not create a new user without email or password", done => {
        request(app)
          .post("/users")
          .send({})
          .expect(400)
          .expect("Content-Type", /html/)
          .end(err => {
            err
              ? done(err)
              : User.find()
                  .then(users => {
                    expect(users.length).toBe(0)
                    done()
                  })
                  .catch(err => done(err))
          })
      })
    })
  })
})

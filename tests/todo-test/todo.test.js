const request = require("supertest")
const { expect } = require("chai")
const { ObjectID } = require("mongodb")

const app = require("../../server")
const ToDo = require("../../src/models/todo")
const {
  sampleUsers,
  populateUsers,
  sampleToDos,
  populateTodos
} = require("../seed-data")

describe("Requests --> Todo", () => {
  beforeEach(populateUsers)
  beforeEach(populateTodos)

  describe("POST '/todos/addtodo", () => {
    it("should create a new todo", done => {
      const todo = "New stuff to do"

      request(app)
        .post("/todos/addtodo")
        .set("x-auth", sampleUsers[0].tokens[0].token)
        .send({ todo })
        .expect(200)
        .expect("Content-Type", /json/)
        .expect(res => expect(res.body.todoItem.todo).to.equal(todo))
        .end(err => {
          err
            ? done(err)
            : ToDo.find({ todo })
                .then(todos => {
                  expect(todos.length).to.equal(1)
                  expect(todos[0].todo).to.equal(todo)
                  done()
                })
                .catch(err => done(err))
        })
    })

    it("should not create a new todo with bad data", done => {
      request(app)
        .post("/todos/addtodo")
        .set("x-auth", sampleUsers[0].tokens[0].token)
        .send({ todo: "" })
        .expect(400)
        .expect("Content-Type", /html/)
        .end(err => {
          err
            ? done(err)
            : ToDo.find()
                .then(todos => {
                  expect(todos.length).to.equal(sampleToDos.length)
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
        .set("x-auth", sampleUsers[0].tokens[0].token)
        .expect(200)
        .expect("Content-Type", /json/)
        .expect(res => expect(res.body.todos.length).to.equal(1))
        .end(done)
    })
  })

  describe("GET '/todos/:id'", () => {
    it("should send a status of 404 for non-object ID", done => {
      request(app)
        .get("/todos/123")
        .set("x-auth", sampleUsers[1].tokens[0].token)
        .expect(res => expect(res.statusCode).to.equal(404))
        .end(done)
    })

    it("should send a todo item", done => {
      request(app)
        .get(`/todos/${sampleToDos[0]._id}`)
        .set("x-auth", sampleUsers[0].tokens[0].token)
        .expect(200)
        .expect("content-Type", /json/)
        .expect(res => expect(res.body.todo.todo).to.equal(sampleToDos[0].todo))
        .end(done)
    })

    it("should NOT return a todo item created by other user", done => {
      request(app)
        .get(`/todos/${sampleToDos[0]._id}`)
        .set("x-auth", sampleUsers[1].tokens[0].token)
        .expect("content-Type", /json/)
        .expect(res => expect(res.statusCode).to.equal(400))
        .end(done)
    })

    it("should send 400 status for valid ID with no todo", done => {
      request(app)
        .get(`/todos/${new ObjectID().toHexString()}`)
        .set("x-auth", sampleUsers[0].tokens[0].token)
        .expect(res => expect(res.statusCode).to.equal(400))
        .end(done)
    })
  })

  describe("DELETE '/todos/:id'", () => {
    it("should delete the todo with valid ID", done => {
      const hexId = sampleToDos[1]._id.toHexString()

      request(app)
        .delete(`/todos/${hexId}`)
        .set("x-auth", sampleUsers[1].tokens[0].token)
        .expect(200)
        .expect(res => expect(res.body.todo.todo).to.equal(sampleToDos[1].todo))
        .end(err => {
          err
            ? done(err)
            : ToDo.findById(hexId)
                .then(todo => {
                  expect(todo).to.be.a("null")
                  done()
                })
                .catch(err => done(err))
        })
    })

    it("should NOT delete todo of other user", done => {
      const hexId = sampleToDos[0]._id.toHexString()

      request(app)
        .delete(`/todos/${hexId}`)
        .set("x-auth", sampleUsers[1].tokens[0].token)
        .expect("Content-Type", /json/)
        .expect(res => expect(res.statusCode).to.equal(400))
        .end(err => {
          err
            ? done(err)
            : ToDo.findById(hexId)
                .then(todo => {
                  expect(todo.todo).to.equal(sampleToDos[0].todo)
                  done()
                })
                .catch(err => done(err))
        })
    })

    it("should send a status of 404 for non-object ID", done => {
      request(app)
        .delete("/todos/123")
        .set("x-auth", sampleUsers[1].tokens[0].token)
        .expect(res => expect(res.statusCode).to.equal(404))
        .end(done)
    })

    it("should send 400 status if todo not found", done => {
      request(app)
        .delete(`/todos/${new ObjectID().toHexString()}`)
        .set("x-auth", sampleUsers[1].tokens[0].token)
        .expect(res => expect(res.statusCode).to.equal(400))
        .end(err => {
          err
            ? done(err)
            : ToDo.find()
                .then(todos => {
                  expect(todos.length).to.equal(sampleToDos.length)
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
        .set("x-auth", sampleUsers[0].tokens[0].token)
        .send(body)
        .expect(200)
        .expect("Content-Type", /json/)
        .expect(res => {
          expect(res.body.todo.todo).to.equal(body.todo)
          expect(res.body.todo.completed).to.equal(true)
          expect(typeof res.body.todo.completedAt).to.equal("number")
        })
        .end(done)
    })

    it("should NOT update the todo", done => {
      const hexId = sampleToDos[0]._id.toHexString()
      const body = { todo: "This todo is done", completed: true }

      request(app)
        .patch(`/todos/${hexId}`)
        .set("x-auth", sampleUsers[1].tokens[0].token)
        .send(body)
        .expect("Content-Type", /json/)
        .expect(res => expect(res.statusCode).to.equal(400))
        .end(done)
    })

    it("should set completedAt to null when todo is not completed", done => {
      const hexId = sampleToDos[1]._id.toHexString()
      const body = { todo: "Finish this todo", completed: false }

      request(app)
        .patch(`/todos/${hexId}`)
        .set("x-auth", sampleUsers[1].tokens[0].token)
        .send(body)
        .expect(200)
        .expect("Content-Type", /json/)
        .expect(res => {
          expect(res.body.todo.todo).to.equal(body.todo)
          expect(res.body.todo.completed).to.equal(false)
          expect(res.body.todo.completedAt).to.be.a("null")
        })
        .end(done)
    })
  })
})

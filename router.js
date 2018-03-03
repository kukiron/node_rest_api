const todoController = require("./controllers/todo")
const userController = require("./controllers/user")

module.exports = app => {
  app.get("/", (req, res) => {
    res.send("Hi there!")
  })

  // GET requests
  app.get("/todos", todoController.getAllToDos)
  app.get("/users", userController.getAllUsers)
  app.get("/todos/:id", todoController.getToDoById)
  app.get("/users/me", userController.getUserByToken)

  // POST requests
  app.post("/todos/addtodo", todoController.addTodo)
  app.post("/users/signup", userController.signUpUser)
  app.post("/users/login", userController.loginUser)

  // DELETE requests
  app.delete("/todos/:id", todoController.deleteToDo)
  app.delete("/users/:id", userController.deleteUser)

  // PATCH requests
  app.patch("/todos/:id", todoController.updateToDos)
}

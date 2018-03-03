const todoController = require("./controllers/todo")
const userController = require("./controllers/user")
const authenticate = require("./middlewares/authenticate")

module.exports = app => {
  app.get("/", (req, res) => {
    res.send("Hi there!")
  })

  // GET requests
  app.get("/todos", todoController.getAllToDos)
  app.get("/users", userController.getAllUsers)
  app.get("/todos/:id", todoController.getToDoById)
  app.get("/users/me", authenticate, userController.getUserByToken)

  // POST requests
  app.post("/todos/addtodo", todoController.addTodo)
  app.post("/users/signup", userController.signUpUser)
  app.post("/users/login", userController.loginUser)

  // DELETE requests
  app.delete("/todos/:id", todoController.deleteToDo)
  app.delete("/users/:id", userController.deleteUser)
  app.delete("/users/me/token", authenticate, userController.logoutUser)

  // PATCH requests
  app.patch("/todos/:id", todoController.updateToDos)
}

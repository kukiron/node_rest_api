const todoController = require("./controllers/todo")
const userController = require("./controllers/user")
const authenticate = require("./middlewares/authenticate")

module.exports = app => {
  // Sample welcome page
  app.get("/", (req, res) => {
    res.render("index", { title: "Node.js REST API" })
  })

  /** Requests with authentication **/
  app.get("/todos", authenticate, todoController.getAllToDos)
  app.get("/todos/:id", authenticate, todoController.getToDoById)
  app.get("/users/me", authenticate, userController.getUserByToken) // User's account/dashboard route
  app.post("/todos/addtodo", authenticate, todoController.addTodo)
  app.delete("/todos/:id", authenticate, todoController.deleteToDo)
  app.delete("/users/me/logout", authenticate, userController.logoutUser)
  app.patch("/todos/:id", authenticate, todoController.updateToDos)

  /** Routes generating auth token **/
  app.post("/users/signup", userController.signUpUser)
  app.post("/users/login", userController.loginUser)

  /** Routes for test purposes **/
  app.get("/users", userController.getAllUsers)
  app.delete("/users/:id", userController.deleteUser)
}

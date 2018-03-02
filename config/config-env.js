let env = process.env.NODE_ENV || "development"

if (env === "test") {
  process.env.PORT = 3330
  process.env.MONGODB_URI = "mongodb://localhost:27017/ToDoAppTest"
} else if (env === "development") {
  process.env.PORT = 3330
  process.env.MONGODB_URI = "mongodb://localhost:27017/ToDoApp"
}

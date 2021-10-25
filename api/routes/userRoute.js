const { Router } = require("express")
const userRouter = Router()

const { login, logout, createUser } = require("../controllers/userController")

userRouter.route("/login").post(login)
userRouter.route("/logout").post(logout)
userRouter.route("/").post(createUser)




module.exports = {
    userRouter
}
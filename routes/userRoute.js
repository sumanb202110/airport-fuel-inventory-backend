const { Router } = require("express")
const userRouter = Router()

const { login, logout, createUser, refresh } = require("../controllers/userController")

userRouter.route("/login").post(login)
userRouter.route("/logout").post(logout)
userRouter.route("/refresh").post(refresh)
userRouter.route("/").post(createUser)




module.exports = {
    userRouter
}
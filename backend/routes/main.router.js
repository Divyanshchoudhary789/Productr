const express = require('express');
const mainRouter = express.Router();

const userRouter = require("./user.router.js");
const productRouter = require("./product.router.js");


mainRouter.use(userRouter);
mainRouter.use(productRouter);


mainRouter.get("/", (req, res) => {
    res.send("Welcome to Productr!");
});

module.exports = mainRouter;
const express = require('express');
const app = express();

const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mainRouter = require("./routes/main.router.js");

const port = process.env.PORT || 8080;


const mongodb_url = process.env.MONGODB_URL;

mongoose.connect(mongodb_url)
    .then(() => {
        console.log("MongoDB Connected Successfully");
    })
    .catch((err) => {
        console.log(err);
    });


app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "https://productr-rouge.vercel.app/",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        credentials: true,
    })
);


app.use("/", mainRouter);




app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
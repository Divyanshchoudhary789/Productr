const express = require('express');
const app = express();

// Trust the reverse proxy (Render) to allow express-rate-limit to get the correct client IP
app.set('trust proxy', 1);

const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mainRouter = require("./routes/main.router.js");

const port = process.env.PORT || 8080;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongodb_url = process.env.MONGODB_URL;

mongoose.connect(mongodb_url)
    .then(() => {
        console.log("MongoDB Connected Successfully");
    })
    .catch((err) => {
        console.log(err);
    });


app.use(
    cors({
        origin: "https://productr-5edq.onrender.com",
        credentials: true,
    })
);





app.use("/", mainRouter);




app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
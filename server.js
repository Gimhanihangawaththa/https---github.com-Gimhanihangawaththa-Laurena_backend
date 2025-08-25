const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(bodyParser.json());

const URL = process.env.MONGODB_URL;

console.log("MongoDB URL:", process.env.MONGODB_URL);

mongoose.connect(URL, { 
    useNewUrlParser: true,
    useUnifiedTopology: true
    // useCreateIndex: true,
    // useFindAndModify: false  
});

    const connection = mongoose.connection;
    connection.once('open', () => {
        console.log("MongoDB database connection established successfully");
    });

    const userRouter = require('./routes/user.js');
    app.use('/user', userRouter);
    app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
    });
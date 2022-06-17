
const express = require('express');
const dotenv = require('dotenv');


dotenv.config({path: "./config/config.env"});

const PORT = process.env.PORT || 8000;

const app = express();

app.listen(PORT, function () {
    console.log(`Server running in ${process.env.NODE_ENV} mode in port ${PORT}`);
});
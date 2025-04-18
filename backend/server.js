const mongoose = require('mongoose');
const express = require("express")
const app = express()
app.use(express.json())
DB_URL = "mongodb://localhost:27017/db"
mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
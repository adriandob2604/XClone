import pg from 'pg';
const { Client } = pg;
const client = new Client();
const app = require('express')();

app.get("/:username", (req, res) => {
    req.params.username
})

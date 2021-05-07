const express = require('express')
require('mongoose')

const app = express()

app.use(express.json())

module.exports = app
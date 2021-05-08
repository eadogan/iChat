const express = require('express')
const path = require('path')

const publicDirectoryPath = path.join(__dirname, '../public')

const app = express()


app.use(express.json())
app.use(express.static(publicDirectoryPath))

module.exports = app
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const nunjucks = require('nunjucks')

const indexRouter = require('./routes/index')
const uploadRouter = require('./routes/upload')
const downloadRouter = require('./routes/download')

var app = express();

app.set('view engine', 'njk')
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/upload', uploadRouter)
app.use('/download', downloadRouter)

module.exports = app

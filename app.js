const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const nunjucks = require('nunjucks')

const indexRouter = require('./routes/index')
const comparisonRouter = require('./routes/comparison')
const convertRouter = require('./routes/convert')
const compareRouter = require('./routes/compare')
const downloadRouter = require('./routes/download')
const harmonizedRouter = require('./routes/harmonized')
const convertHarmonizedRouter = require('./routes/convert-harmonized')

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
app.use('/comparison', comparisonRouter)
app.use('/convert', convertRouter)
app.use('/compare', compareRouter)
app.use('/download', downloadRouter)
app.use('/harmonized', harmonizedRouter)
app.use('/convert-harmonized', convertHarmonizedRouter)

module.exports = app

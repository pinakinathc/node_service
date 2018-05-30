'use strict'

var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

// var indexRouter = require('./routes/index')
// var usersRouter = require('./routes/users')

var cors = require('cors')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

var jwt = require('jsonwebtoken')
var jsonpatch = require('jsonpatch')
var jimp = require('jimp')
app.use(cors())

app.options('*', function (req, res) {
  res.set({
    'Access-Control-Allow-Origin': '*', // req.header('origin'),
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,HEAD,DELETE',
    'Access-Control-Allow-Headers': 'Authorization,Content-Type,Accept,Accept-Language,Content-Encoding,X-Requested-With'
  })
  // return next()
  return res.json(200)
})

app.get('/login', (req, res) => {
  console.log('this is the get request')
  res.send('this is the get request')
})

app.post('/login', (req, res) => {
  var token = jwt.sign(req.body, 'private_key', {expiresIn: 60 * 60})
  res.json({'token': token})
})

app.post('/patch', function (req, res) {
  try {
    jwt.verify(req.body.token, 'private_key')
    let mydoc = req.body.mydoc
    let thepatch = req.body.thepatch
    let patcheddoc = jsonpatch.apply_patch(mydoc, thepatch)
    res.json({'output': patcheddoc})
  } catch (err) {
    res.statusCode(401)
    res.send('Failed to verify token. Please try to re-login')
  }
})

app.post('/resize', function (req, res) {
  try { jwt.verify(req.body.token, 'private_key') } catch (err) { res.send('Failed to verify token.') }
  jimp.read(req.body.img, function (err, img) {
    if (err) throw err
    img.resize(50, 50).getBase64(jimp.AUTO, function (e, img64) {
      if (e) throw err
      res.send('<img src="' + img64 + '">')
    })
  })
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app

require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const favicon = require('serve-favicon');

const publicRoute = require('./routes/public');
const privateRoute = require('./routes/private');
const {verifyToken} = require('./middlewares/security');
const {logger} = require('./utils/logger');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// public files
app.use('/static', express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
        'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods',
        'PUT, POST, GET, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        res.send(200); /* speedup options */
    } else {
        next();
    }
});

app.use((req, res, next) => {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    next();
});

app.use(publicRoute);
app.use(verifyToken);
app.use(privateRoute);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.json({message: err.message});
});

module.exports = app;

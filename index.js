var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var passport = require('passport');
require('./middleware/googleAuth');
require('dotenv').config();
var session = require('express-session');

var errorMiddleware = require('./middleware/errorMiddleware');
var ErrorHandler = require('./utils/error');
var connection = require('./utils/connection');

var User = require('./routes/userRoutes');
var Admin = require('./routes/adminRoutes');
var Api = require('./routes/apiRoutes');

var whitelist = [process.env.CLIENT_URI];
var corsOptions = {
	credentials: true,
	origin: function (origin, callback) {
		if (whitelist.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
};

app.listen(process.env.PORT, () => {
	console.log(`Running on port ${process.env.PORT} 👍.`);
});
connection.connectDB();

app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: false }));
app.use(cookieParser());
process.env.ENV === 'PRODUCTION' ? app.use(cors(corsOptions)) : app.use(cors());
app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: true,
	})
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/users', User);
app.use('/admin', Admin);
app.use('/api', Api);

app.all('*', (req, res, next) => {
	next(new ErrorHandler('No Api Route Hit -- Bad Request', 404));
});
app.use(errorMiddleware);

module.exports = app;

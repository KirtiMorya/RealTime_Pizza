require('dotenv').config();
const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('express-flash');
const MongoDbStore = require('connect-mongo');
const Emitter = require('events')

const PORT = process.env.PORT || 5500;


// MongoDB connection
mongoose.connect('mongodb://localhost:27017/pizza', {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
});
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB connection successful');
});
connection.on('error', (err) => {
    console.log('MongoDB connection error:', err);
});

// Session store
let mongoStore = MongoDbStore.create({
    mongoUrl: 'mongodb://localhost:27017/pizza',
    collectionName: 'sessions'
});

const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)

// Session middleware
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }  // 24 hours
}));

// Passport config
const passportInit = require('./app/config/passport');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Static files
app.use(express.static('public'));

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.user = req.user;
    next();
});

// Set view engine
app.use(expressLayout);
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');

// Routes
require('./routes/web')(app);
// app.use((req, res) => {
//     res.status(404).render('errors/404')
// })

// Start server
const server = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

const io = require('socket.io')(server)
io.on('connection', (socket) => {
      // Join
      socket.on('join', (orderId) => {
        socket.join(orderId)
      })
})

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})

// TODO:
// X add in DB after post
// - Cleanup
// - Seperate routes folder
// - Add comments
// - Make it so that letter cases won't matter in username
// X Figure out how to set up times into DB
// - Instal MONGODB locally
// X https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes
// X https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// - how to join between two models, mongoose

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const app = express();
const ejs = require('ejs');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('express-flash');
const session = require('express-session');
const APP_NAME = 'Tijdkaart';
const moment = require('moment');
const PORT = 4000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/Tijdkaart', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const User = require('./models/User');
const Shift = require('./models/Shift');
const { startSession } = require('./models/User');
passport.use(User.createStrategy());

// Sets ExpressJS to use EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', checkAuthenticated, async (req, res) => {
  try {
    const uid = req.user.id;
    // Get results only from the current month
    const currentMonth = '/' + (moment().month() + 1).toString().padStart(2, '0') + '/';
    let shifts = await Shift.find({ by: uid, startTime: { $regex: currentMonth } }).sort({ startTime: 'asc' });

    res.render('index', { moment, username: req.user, shifts });
  } catch (error) {
    console.log(error);
  }
});

app.get('/settings', checkAuthenticated, (req, res) => {
  res.render('settings', { username: req.user });
});

app.post('/settings', checkAuthenticated, async (req, res) => {
  const uid = req.user._id;
  const email = req.body.email;
  const pay = req.body.pay;
  const accountUpdate = await User.findByIdAndUpdate({ _id: uid }, { email, pay });
  req.flash('info', 'Updated succesfuly!');
  await res.redirect('/settings');
});

app.get('/add', checkAuthenticated, (req, res) => {
  res.redirect('/');
});

app.post('/add', checkAuthenticated, async (req, res) => {
  const time = req.body.time;
  const uid = req.user.id;
  const comment = req.body.comment;
  const userDocument = await User.findById(uid);
  let timeSplit = time.split(' - ');
  const shift = await Shift.create({ by: uid, startTime: timeSplit[0], endTime: timeSplit[1], comment, pay: userDocument.pay });
  res.redirect('/');
});

app.get('/edit', checkAuthenticated, (req, res) => {
  res.redirect('/');
});

app.post('/edit', checkAuthenticated, async (req, res) => {
  const shiftData = req.body;
  const shiftUpdate = await Shift.findByIdAndUpdate({ _id: shiftData.shiftsID }, { startTime: shiftData.startTime, endTime: shiftData.endTime, comment: shiftData.comment });
});

app.get('/delete', checkAuthenticated, (req, res) => {
  res.redirect('/');
});

app.post('/delete', checkAuthenticated, async (req, res) => {
  const shiftData = req.body;
  const shiftDelete = await Shift.findByIdAndDelete({ _id: shiftData.shiftsID });
});

app.post('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login');
});

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register');
});

app.post('/register', function (req, res, next) {
  console.log('registering user');
  User.register(new User({ username: req.body.username, email: req.body.email, pay: req.body.pay }), req.body.password, function (err) {
    if (err) {
      console.log('error while user register!', err);
      return next(err);
    }

    console.log('user registered!');

    res.redirect('/');
  });
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), function (req, res) {
  res.redirect('/');
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}

app.listen(PORT, () => {
  console.log(`${APP_NAME} is running on http://localhost:${PORT}/`);
});

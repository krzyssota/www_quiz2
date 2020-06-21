import express = require('express');
import path = require('path');
import csurf = require('csurf');
import * as sqlite from 'sqlite3';
sqlite.verbose();
import cookieParser = require('cookie-parser');
import * as USERS from './users.js';
import * as QUIZES from './quizes.js'
// import bodyParser from 'body-parser'
var bodyParser = require('body-parser')

// tslint:disable-next-line: no-var-requires
const session = require('express-session');
const connectSqlite = require('connect-sqlite3');
const SqliteStore = connectSqlite(session);
const csrfProtection = csurf({ cookie: true });

const app = express();
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

const secretString = '102101101108032116104101032098101114110'
const port = 3000;
const jsonParser = bodyParser.json()
app.use(jsonParser)
// app.use(express.json())

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(secretString));
app.use(session({
  secret: secretString,
  cookie: { maxAge: 15*60*1000 },
  resave: false,
  saveUninitialized: true,
  store: new SqliteStore()})
)

app.listen(port, err => {
  if (err) return console.error(err);
  return console.log(`server is listening on  http://localhost:${port}`);
});

app.use(express.static(path.join(__dirname + '/../static')))


// USERS
app.get('/', csrfProtection, USERS.renderUsers)
app.get('/users', csrfProtection, USERS.renderUsers)
app.get('/users/changePassword', csrfProtection, USERS.renderUsers)
app.get('/users/login', csrfProtection, USERS.renderUsers)

app.get('/users/logout', csrfProtection, USERS.logoutUser)
app.post('/users/changePassword', csrfProtection, USERS.changePassword)
app.post('/users/login', csrfProtection, USERS.logUserIn)

app.get('/chooseQuiz', csrfProtection, QUIZES.sendSelectionHTML)
app.get('/chooseQuiz/selectionRequest', csrfProtection, QUIZES.sendSelection)
app.get('/chooseQuiz/typeRequest/:quizId(\\d+)', csrfProtection, QUIZES.sendType)
app.get('/chooseQuiz/quizHeaderRequest/:quizId(\\d+)', csrfProtection, QUIZES.sendQuizHeader)
app.get('/chooseQuiz/quizQuestionsRequest/:quizId(\\d+)', csrfProtection, QUIZES.sendQuiz)
app.get('/chooseQuiz/quizResultsRequest/:quizId(\\d+)', csrfProtection, QUIZES.sendResults)
app.get('/chooseQuiz/quizTop5/:quizId(\\d+)', csrfProtection, QUIZES.sendTop)
app.get('/cancelledQuiz', csrfProtection, QUIZES.cancelQuiz)


app.post('/chooseQuiz/sendingResults/:quizId(\\d+)', QUIZES.receiveAnswers)

// error handling
app.use(function(err: any, req: any, res: any, next: any) {
  console.error('error: ' + err)
  res.render('error', { error: err, message: 'error occured :('});
});

// module.exports = app;
export default app;





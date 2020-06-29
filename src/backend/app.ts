import express from 'express'
import path from 'path'
import csurf from 'csurf'
import cookieParser from 'cookie-parser'
import * as USERS from './users.js';
import * as QUIZES from './quizes.js'
import bodyParser from 'body-parser'
import session from 'express-session'
import connectSqlite from 'connect-sqlite3'

const SqliteStore = connectSqlite(session);
const csrfProtection = csurf({ cookie: true });

const app = express();
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

const secretString = '102101101108032116104101032098101114110'
const port = 3000;
const jsonParser = bodyParser.json()
app.use(jsonParser)

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

// log in, log out, change password
app.get('/', csrfProtection, USERS.renderUsers)
app.get('/users', csrfProtection, USERS.renderUsers)
app.get('/users/changePassword', csrfProtection, USERS.renderUsers)
app.get('/users/login', csrfProtection, USERS.renderUsers)
app.get('/users/logout', csrfProtection, USERS.logoutUser)
app.post('/users/changePassword', csrfProtection, USERS.changePassword)
app.post('/users/login', csrfProtection, USERS.logUserIn)

// choosing, sending quizes and receiving client's solved quizes
app.get('/chooseQuiz', csrfProtection, QUIZES.sendSelectionHTML)
app.get('/chooseQuiz/selectionRequest', csrfProtection, QUIZES.sendSelection)
app.get('/chooseQuiz/typeRequest/:quizId(\\d+)', csrfProtection, QUIZES.sendType)
app.get('/chooseQuiz/quizHeaderRequest/:quizId(\\d+)', csrfProtection, QUIZES.sendQuizHeader)
app.get('/chooseQuiz/quizQuestionsRequest/:quizId(\\d+)', csrfProtection, QUIZES.sendQuiz)
app.get('/chooseQuiz/quizResultsRequest/:quizId(\\d+)', csrfProtection, QUIZES.sendResults)
app.get('/chooseQuiz/quizTop5/:quizId(\\d+)', csrfProtection, QUIZES.sendTop)
app.get('/cancelledQuiz', csrfProtection, QUIZES.cancelQuiz)

// receiving and adding new quiz proposed by client
app.get('/addQuiz', csrfProtection, QUIZES.renderNewQuiz)
app.post('/addQuiz/newQuiz', csrfProtection, QUIZES.addQuiz)

// receiving results from client
app.post('/chooseQuiz/sendingResults/:quizId(\\d+)', QUIZES.receiveAnswers) // csurf 

// error handling
app.use(function(err: any, req: any, res: any, next: any) {
  console.error('error: ' + err)
  res.render('error', { error: err, message: 'error occured :('});
});

export default app;





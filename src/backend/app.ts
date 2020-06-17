import express = require('express');
import path = require('path');
import csurf = require('csurf');
import * as sqlite from 'sqlite3';
sqlite.verbose();
import cookieParser = require('cookie-parser');
import { open_db } from './DatabaseHandler.js'
// tslint:disable-next-line: no-var-requires
const session = require('express-session');
const connectSqlite = require('connect-sqlite3');
const SqliteStore = connectSqlite(session);
const csrfProtection = csurf({ cookie: true });

const app = express();
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

export const secretString = '102101101108032116104101032098101114110'
const port = 3000;

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

app.get('/', (req: any,res: any) => {
    res.sendFile(path.join(__dirname, '/../static/quiz.html'));
})

// USERS

import * as USERS from './users.js';
app.get('/users', csrfProtection, USERS.renderUsers);
app.get('/users/logout', csrfProtection, USERS.logoutUser);
app.post('/users/changePassword', csrfProtection, USERS.changePassword);
app.post('/users/login', csrfProtection, USERS.logUserIn);


// error handling
app.use(function(err: any, req: any, res: any, next: any) {
  console.error('error: ' + err)
  res.render('error', { error: err, message: 'error occured :('});
});

// module.exports = app;
export default app;





import express = require('express');
import path = require('path');

const app = express();

import csurf = require('csurf');
import * as sqlite from 'sqlite3';
import cookieParser = require('cookie-parser');

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

// tslint:disable-next-line: no-var-requires
const session = require('express-session');
const connectSqlite = require('connect-sqlite3');
const SqliteStore = connectSqlite(session);
const csrfProtection = csurf({ cookie: true });
export const secretString = '102101101108032116104101032098101114110'

sqlite.verbose();

app.use(cookieParser(secretString));

app.use(session({
  secret: secretString,
  cookie: { maxAge: 15*60*1000 },
  resave: false,
  saveUninitialized: true,
  store: new SqliteStore()})
)


const port = 3000;

app.use(express.urlencoded({ extended: true }));

app.listen(port, err => {
  if (err) return console.error(err);
  return console.log(`server is listening on  http://localhost:${port}`);
});

app.use(express.static(path.join(__dirname + '/../static')))

app.get('/', (req: any,res: any) => {
    res.sendFile(path.join(__dirname, '/../static/quiz.html'));
})

// LOGIN
app.get('/login', csrfProtection, async (req, res) => {
       res.render('login', {login: req.session.user, csrfToken: req.csrfToken()});
});

app.post('/login', csrfProtection, async (req, res) => {
   const enteredLogin: string = req.body.login
   const enteredPassword: string = req.body.password

   /* const db = make_db();
    try {
        await new Promise((resolve, reject) => {
            const sqlQ = `SELECT password FROM users WHERE login = ?;`
            db.all(sqlQ, enteredLogin, (err, rows) => {
                if(err) {
                    console.error('rejectuje select login password')
                    reject('DB error while select login password');
                }
                const bcrypt = require('bcryptjs');
                let correct = false;
                for(const row of rows) {
                    if(bcrypt.compareSync(enteredPassword, row.password)) {
                        resolve();
                        correct = true;
                    }
                }
                if(!correct) reject(new Error("Login or password is not correct"));
            })
        })
        req.session.user = enteredLogin;
        db.close();
        res.render('login', {login: req.session.user, csrfToken: req.csrfToken()});
    } catch(err) {
        db.close();
        res.render('login', {csrfToken: req.csrfToken(), error: err});
    } */
});



// error handling
app.use(function(err: any, req: any, res: any, next: any) {
  console.error('error: ' + err)
  res.render('error', { error: err, message: 'error occured :('});
});

// module.exports = app;
export default app;





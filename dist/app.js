"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.secretString = void 0;
const express = require("express");
const path = require("path");
const app = express();
const csurf = require("csurf");
const sqlite = __importStar(require("sqlite3"));
const cookieParser = require("cookie-parser");
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');
// tslint:disable-next-line: no-var-requires
const session = require('express-session');
const connectSqlite = require('connect-sqlite3');
const SqliteStore = connectSqlite(session);
const csrfProtection = csurf({ cookie: true });
exports.secretString = '102101101108032116104101032098101114110';
sqlite.verbose();
app.use(cookieParser(exports.secretString));
app.use(session({
    secret: exports.secretString,
    cookie: { maxAge: 15 * 60 * 1000 },
    resave: false,
    saveUninitialized: true,
    store: new SqliteStore()
}));
const port = 3000;
app.use(express.urlencoded({ extended: true }));
app.listen(port, err => {
    if (err)
        return console.error(err);
    return console.log(`server is listening on  http://localhost:${port}`);
});
app.use(express.static(path.join(__dirname + '/../static')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/../static/quiz.html'));
});
// LOGIN
app.get('/login', csrfProtection, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('login', { login: req.session.user, csrfToken: req.csrfToken() });
}));
app.post('/login', csrfProtection, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const enteredLogin = req.body.login;
    const enteredPassword = req.body.password;
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
}));
// error handling
app.use(function (err, req, res, next) {
    console.error('error: ' + err);
    res.render('error', { error: err, message: 'error occured :(' });
});
// module.exports = app;
exports.default = app;

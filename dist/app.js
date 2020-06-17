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
Object.defineProperty(exports, "__esModule", { value: true });
exports.secretString = void 0;
const express = require("express");
const path = require("path");
const csurf = require("csurf");
const sqlite = __importStar(require("sqlite3"));
sqlite.verbose();
const cookieParser = require("cookie-parser");
// tslint:disable-next-line: no-var-requires
const session = require('express-session');
const connectSqlite = require('connect-sqlite3');
const SqliteStore = connectSqlite(session);
const csrfProtection = csurf({ cookie: true });
const app = express();
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');
exports.secretString = '102101101108032116104101032098101114110';
const port = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(exports.secretString));
app.use(session({
    secret: exports.secretString,
    cookie: { maxAge: 15 * 60 * 1000 },
    resave: false,
    saveUninitialized: true,
    store: new SqliteStore()
}));
app.listen(port, err => {
    if (err)
        return console.error(err);
    return console.log(`server is listening on  http://localhost:${port}`);
});
app.use(express.static(path.join(__dirname + '/../static')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/../static/quiz.html'));
});
// USERS
const USERS = __importStar(require("./users.js"));
app.get('/users', csrfProtection, USERS.renderUsers);
app.get('/users/logout', csrfProtection, USERS.logoutUser);
app.post('/users/changePassword', csrfProtection, USERS.changePassword);
app.post('/users/login', csrfProtection, USERS.logUserIn);
// error handling
app.use(function (err, req, res, next) {
    console.error('error: ' + err);
    res.render('error', { error: err, message: 'error occured :(' });
});
// module.exports = app;
exports.default = app;

"use strict";
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
exports.logUserIn = exports.changePassword = exports.logoutUser = exports.renderUsers = void 0;
const bcrypt = require("bcryptjs");
const DatabaseHandler_js_1 = require("./DatabaseHandler.js");
function renderUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.render('users', { login: req.session.user, csrfToken: req.csrfToken() });
    });
}
exports.renderUsers = renderUsers;
;
function logoutUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        req.session.user = "";
        res.render('users', { csrfToken: req.csrfToken() });
    });
}
exports.logoutUser = logoutUser;
function changePassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const enteredLogin = req.body.login;
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;
        let sessionsDB;
        if (!req.body.repeatedPassword || req.body.repeatedPassword === '' ||
            enteredLogin === '' || oldPassword === '' || newPassword === '') {
            res.render('login', { changeError: 'Do not leave empty fields.', csrfToken: req.csrfToken() });
        }
        if (newPassword.localeCompare(req.body.repeatedPassword) !== 0) {
            res.render('login', { changeError: 'Repeated password doesn\'t match.', csrfToken: req.csrfToken() });
        }
        let sqlQ;
        const db = DatabaseHandler_js_1.open_db();
        try {
            yield new Promise((resolve, reject) => {
                sqlQ = `SELECT password FROM users WHERE login = ?;`;
                db.all(sqlQ, enteredLogin, (err, rows) => {
                    if (err) {
                        reject(new Error('Internal error. Couldn\'y verify password.'));
                    }
                    const bcrypt = require('bcryptjs');
                    let correct = false;
                    for (const row of rows) {
                        if (bcrypt.compareSync(oldPassword, row.password)) {
                            resolve();
                            correct = true;
                        }
                    }
                    if (!correct)
                        reject(new Error("Login or old password is not correct"));
                });
            });
            yield new Promise((resolve, reject) => {
                const hashedNewPassword = bcrypt.hashSync(newPassword, 8);
                sqlQ = `UPDATE users SET password = ? WHERE login = ?;`;
                db.run(sqlQ, [hashedNewPassword, enteredLogin], (err, rows) => {
                    if (err)
                        reject(new Error('Internal error. Couldn\'y change password.'));
                    resolve();
                });
            });
            sessionsDB = DatabaseHandler_js_1.open_session_db();
            const rows = yield new Promise((resolve, reject) => {
                sqlQ = `SELECT * FROM sessions;`;
                sessionsDB.all(sqlQ, (err, rows) => {
                    if (err)
                        reject(new Error('Internal error. Couldn\'t get session records.'));
                    resolve(rows);
                });
            });
            for (const row in rows) {
                console.log('row ' + row);
                console.log('rows ' + rows);
                const sid = row.sid;
                const sess = JSON.parse(row.sess);
                console.log('row.sess ' + sess);
                console.log('sess.user ' + sess.user);
                console.log('sid ' + row.sid);
                if (sess.user.localeCompare(enteredLogin) === 0) {
                    yield new Promise((resolve, reject) => {
                        sqlQ = `DELETE FROM sessions
                    WHERE sid=${sid};`;
                        sessionsDB.run(sqlQ, (err) => {
                            if (err)
                                reject(new Error('Internal error. Couldn\'t delete session.'));
                            resolve();
                        });
                    });
                }
            }
            res.render('users', { csrfToken: req.csrfToken() });
        }
        catch (err) {
            res.render('users', { changeError: err, csrfToken: req.csrfToken() });
        }
        finally {
            if (sessionsDB)
                sessionsDB.close();
            db.close();
        }
    });
}
exports.changePassword = changePassword;
function logUserIn(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const enteredLogin = req.body.login;
        const enteredPassword = req.body.password;
        const db = DatabaseHandler_js_1.open_db();
        try {
            yield new Promise((resolve, reject) => {
                const sqlQ = `SELECT password FROM users WHERE login = ?;`;
                db.all(sqlQ, enteredLogin, (err, rows) => {
                    if (err) {
                        reject(new Error('Internal error. Couldn\'y verify password.'));
                    }
                    const bcrypt = require('bcryptjs');
                    let correct = false;
                    for (const row of rows) {
                        if (bcrypt.compareSync(enteredPassword, row.password)) {
                            resolve();
                            correct = true;
                        }
                    }
                    if (!correct)
                        reject(new Error("Login or password is not correct"));
                });
            });
            req.session.user = enteredLogin;
            res.render('users', { login: req.session.user, csrfToken: req.csrfToken() });
        }
        catch (err) {
            res.render('users', { loginError: err, csrfToken: req.csrfToken() });
        }
        finally {
            db.close();
        }
    });
}
exports.logUserIn = logUserIn;

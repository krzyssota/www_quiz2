import bcrypt = require('bcryptjs')
import { open_db, open_session_db } from './DatabaseHandler.js'
import { sqlite3 } from 'sqlite3';
import * as sqlite from 'sqlite3';


export async function renderUsers(req: any, res: any) {
    res.render('users', {login: req.session.user, csrfToken: req.csrfToken()});
};
export async function logoutUser(req: any, res: any) {
    req.session.user = "";
    res.render('users', {csrfToken: req.csrfToken()});
}

export async function changePassword (req: any, res: any) {
    const enteredLogin: string = req.body.login
    const oldPassword: string = req.body.oldPassword
    const newPassword: string = req.body.newPassword
    let sessionsDB: sqlite.Database

    if(!req.body.repeatedPassword || req.body.repeatedPassword === '' ||
        enteredLogin === '' || oldPassword === '' || newPassword === '') {
        res.render('login', { changeError: 'Do not leave empty fields.', csrfToken: req.csrfToken() });
    }

    if(newPassword.localeCompare(req.body.repeatedPassword) !== 0) {
        res.render('login', { changeError: 'Repeated password doesn\'t match.', csrfToken: req.csrfToken() });
    }

    let sqlQ: string;
    const db = open_db();
    try {
        await new Promise((resolve, reject) => {
            sqlQ = `SELECT password FROM users WHERE login = ?;`
            db.all(sqlQ, enteredLogin, (err, rows: any[]) => {
                if(err) {
                    reject(new Error('Internal error. Couldn\'y verify password.'));
                }
                const bcrypt = require('bcryptjs');
                let correct = false;
                for(const row of rows) {
                    if(bcrypt.compareSync(oldPassword, row.password)) {
                        resolve();
                        correct = true;
                    }
                }
                if(!correct) reject(new Error("Login or old password is not correct"));
            })
        })
        await new Promise((resolve, reject) => {
            const hashedNewPassword = bcrypt.hashSync(newPassword, 8);
            sqlQ = `UPDATE users SET password = ? WHERE login = ?;`
            db.run(sqlQ, [hashedNewPassword, enteredLogin], (err: any, rows: any[]) => {
                if(err) reject(new Error('Internal error. Couldn\'y change password.'));
                resolve();
            })
        })
        sessionsDB = open_session_db();
        const rows: any[] = await new Promise((resolve, reject) => {
            
            sqlQ = `SELECT * FROM sessions;`
            sessionsDB.all(sqlQ, (err: any, rows: any[]) => {
                if(err) reject(new Error('Internal error. Couldn\'t get session records.'));
                resolve(rows);
            })
        })
        for(const row in rows) {
            console.log('row ' + row)
            console.log('rows ' + rows)
            
            const sid: string = row.sid;
            const sess: any = JSON.parse(row.sess);

            console.log('row.sess ' + sess)
            console.log('sess.user ' + sess.user)
            console.log('sid ' + row.sid)

            if(sess.user.localeCompare(enteredLogin) === 0) {
                await new Promise((resolve, reject) => {
                    sqlQ = `DELETE FROM sessions
                    WHERE sid=${sid};`
                    sessionsDB.run(sqlQ, (err: any) => {
                        if(err) reject(new Error('Internal error. Couldn\'t delete session.'))
                        resolve();
                    })
                })
            }
        }
        res.render('users', {csrfToken: req.csrfToken()});
    } catch(err) {
        res.render('users', {changeError: err, csrfToken: req.csrfToken()});
    } finally {
        if(sessionsDB) sessionsDB.close()
        db.close()
    }
}

export async function logUserIn (req: any, res: any) {
    const enteredLogin: string = req.body.login
    const enteredPassword: string = req.body.password   

    const db = open_db();
    try {
        await new Promise((resolve, reject) => {
            const sqlQ = `SELECT password FROM users WHERE login = ?;`
            db.all(sqlQ, enteredLogin, (err, rows: any[]) => {
                if(err) {
                    reject(new Error('Internal error. Couldn\'y verify password.'));
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
        res.render('users', {login: req.session.user, csrfToken: req.csrfToken()});
    } catch(err) {
        res.render('users', {loginError: err, csrfToken: req.csrfToken()});
    } finally {
        db.close();
    }
}
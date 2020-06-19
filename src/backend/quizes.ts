import bcrypt = require('bcryptjs')
import * as INTERFACES from './communicationB.js'
import * as DB from './DatabaseHandler.js'
import { sqlite3 } from 'sqlite3';
import * as sqlite from 'sqlite3';
import path = require('path');
import { type } from 'os';


export async function sendSelectionHTML(req: any, res: any) {
    if(!req.session.user || req.session.user === undefined) {
            res.render('users', {csrfToken: req.csrfToken()});
            return;
        }
    res.sendFile(path.join(__dirname, '/../static/quizSelection.html'));
};

export async function sendSelection(req: any, res: any) {
    const db: sqlite.Database = DB.open_db()
    try {
        console.log('user ' + req.session.user)
        if(!req.session.user || req.session.user === undefined) {
            res.render('users', {csrfToken: req.csrfToken()});
            return;
        }
        const selection: INTERFACES.ShortRepresentations = await DB.composeSelection(db)
        res.json(selection)
    } catch(err) {
        console.log(err)
    } finally {
        if(db) db.close()
    }    
};

export async function sendType(req: any, res: any) {
    let typeObj: INTERFACES.QuizJSONType = {type: 'placeholder'};
    const db: sqlite.Database = DB.open_db()
    const quizId: number =  parseInt(req.params.quizId)
    try {
        if(quizId === NaN) throw 404
        console.log('user ' + req.session.user)
        if(!req.session.user || req.session.user === undefined) {
            res.render('users', {csrfToken: req.csrfToken()});
            return;
        } 
        console.log(req.session.user + ' asked for ' + quizId)
        if(! await DB.quizInDB(db, quizId)) {
            throw 404
            return;
        }
        console.log('to sie wykonuje')
        if(await DB.quizAlreadyTaken(db, req.session.user)) typeObj.type = 'results'
        else typeObj.type = 'tosolve'
        res.json(typeObj)
    } catch(err) {
        // throw err;
        console.log(err)
    } finally {
        if(db) db.close()
    }
};



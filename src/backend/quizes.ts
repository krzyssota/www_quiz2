import bcrypt = require('bcryptjs')
import * as INTERFACES from './communicationB.js'
import * as DB from './DatabaseHandler.js'
import { sqlite3 } from 'sqlite3';
import * as sqlite from 'sqlite3';
import path = require('path');


export async function sendSelectionHTML(req: any, res: any) {
    if(!req.session.user || req.session.user === undefined) {
            res.render('users', {csrfToken: req.csrfToken()});
            return;
    }
    res.sendFile(path.join(__dirname, '/../static/quiz.html'));
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
        if(await DB.quizAlreadyTaken(db, quizId, req.session.user)) typeObj.type = 'results'
        else typeObj.type = 'tosolve'
        res.json(typeObj)
    } catch(err) {
        // throw err;
        console.log(err)
    } finally {
        if(db) db.close()
    }
};

export async function sendQuizHeader(req: any, res: any) {
    let header: INTERFACES.QuizHeader = {quizId: -1, description: 'placeholder'}
    const db: sqlite.Database = DB.open_db()
    const quizId: number =  parseInt(req.params.quizId)
    try {
        if(quizId === NaN) throw 404
        if(!req.session.user || req.session.user === undefined) {
            res.render('users', {csrfToken: req.csrfToken()});
            return;
        } 
        if(! await DB.quizInDB(db, quizId)) {
            throw 404
        }
        header = await DB.collectQuizHeader(db, quizId);
        
        res.json(header)
    } catch(err) {
        // throw err;
        console.log(err)
    } finally {
        if(db) db.close()
    }
};

export async function sendQuiz(req: any, res: any) {
    let questions: INTERFACES.QuizQuestionsToSolve = {}
    const db: sqlite.Database = DB.open_db()
    const quizId: number =  parseInt(req.params.quizId)
    try {
        if(quizId === NaN) throw 404
        if(!req.session.user || req.session.user === undefined) {
            res.render('users', {csrfToken: req.csrfToken()});
            return;
        } 
        if(! await DB.quizInDB(db, quizId)) {
            throw 404
        }
        questions = await DB.collectQuizQuestions(db, quizId)
        req.session.timeStart = new Date().getTime();
        res.json(questions)
    } catch(err) {
        // throw err;
        console.log(err)
    } finally {
        if(db) db.close()
    }
};

export async function sendResults(req: any, res: any) {
    let results: INTERFACES.QuizQuestionsResult = {}
    const db: sqlite.Database = DB.open_db()
    const quizId: number =  parseInt(req.params.quizId)
    try {
        if(quizId === NaN) throw 404
        if(!req.session.user || req.session.user === undefined) {
            res.render('users', {csrfToken: req.csrfToken()});
            return;
        } 
        if(! await DB.quizInDB(db, quizId)) {
            throw 404
        }
        if(! await DB.quizAlreadyTaken(db, quizId, req.session.user)) throw 404

        results = await DB.collectUserAnswers(db, quizId, req.session.user)
        await DB.collectAverageTimes(db, quizId, results)
        res.json(results)
    } catch(err) {
        // throw err;
        console.log(err)
    } finally {
        if(db) db.close()
    }
};

export async function receiveAnswers(req: any, res: any) {
    console.log('odpalilo sie receiveAns z', req.body)
    const db: sqlite.Database = DB.open_db()
    try {
        const solvedQuiz: INTERFACES.QuizQuestionsSolved = req.body
        const quizSize = Object.keys(solvedQuiz).length
        const quizId: number = parseInt(req.params.quizId)
        const user: string = req.session.user
        if(user === undefined) return;
        const wholeTime: number = new Date().getTime() - req.session.timeStart;
        let overallScore: number = wholeTime/1000;
        console.log('beg trans')
        await new Promise((resolve, reject) => {
            db.run(`BEGIN TRANSACTION;`, (err) => {
                if(err) reject(new Error("Internal error while beginning transaction."))
                resolve();
            })
        })
        for(let questionNo  = 1; questionNo <= quizSize; questionNo++) {
            const userAnswer: string = solvedQuiz[questionNo][0]
            const timeSpent: number = wholeTime/1000 * solvedQuiz[questionNo][1]
            console.log('add ans', questionNo, userAnswer)
            const questionDetails: [string, string, number] = await DB.getQuestionDetails(db, quizId, questionNo)
            const receivedPenalty: number = await DB.addUserAnswer(db, quizId, user, questionNo, questionDetails[0], questionDetails[1], userAnswer, questionDetails[2], timeSpent)
            overallScore += receivedPenalty
        }
        console.log('commmit')
        await new Promise((resolve, reject) => {
            db.run(`COMMIT;`, (err) => {
                if(err) reject(new Error("Internal error while commiting."))
                resolve()
            })

        })
        console.log('adding user score', user, overallScore)
        await DB.addUserScore(db, user, quizId, overallScore);
        res.sendFile(path.join(__dirname, '/../static/quiz.html'));
    } catch(err) {
        try {
            await new Promise((resolve, reject) => {
                db.run(`ROLLBACK;`, (err) => {
                    if(err) reject(new Error("Internal error while rollbacking."))
                    resolve();

                })            })
        } catch(err) {
            console.error(err)
        }
        console.error(err)
    } finally {
        if(db) db.close()
    }
}




import * as INTERFACES from './communicationB.js'
import * as DB from './DatabaseHandler.js'
import * as sqlite from 'sqlite3';
import path from 'path'

export async function sendSelectionHTML(req: any, res: any) {
    req.session.timeStart = undefined
    if(!req.session.user || req.session.user === undefined) {
            res.render('users', {csrfToken: req.csrfToken()});
            return;
    }
    res.sendFile(path.join(__dirname, '/../static/quiz.html'));
};

export async function sendSelection(req: any, res: any) {
    const db: sqlite.Database = DB.open_db()
    try {
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
        if(!req.session.user || req.session.user === undefined) {
            res.render('users', {csrfToken: req.csrfToken()});
            return;
        } 
        if(! await DB.quizInDB(db, quizId)) {
            throw 404
            return;
        }
        if(await DB.quizAlreadyTaken(db, quizId, req.session.user)) typeObj.type = 'results'
        else if(req.session.timeStart === undefined) typeObj.type = 'tosolve'
        else typeObj.type = 'cannot'
        res.json(typeObj)
    } catch(err) {
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
        // console.log('csrfToken = ', req.csrfToken())
        res.setHeader('CSRF-Header', req.csrfToken());
        res.json(questions)
    } catch(err) {
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
        console.log(err)
    } finally {
        if(db) db.close()
    }
};

function checkIfQuestionSolved(arg: any): arg is INTERFACES.QuizQuestionsSolved {
    if(typeof(arg) !== "object" || Object.keys(arg).length === 0) {
        return false;
    }
    for (const qNo in arg) {
        if(!Array.isArray(arg[qNo])
            || arg[qNo].length !== 2
            || typeof(arg[qNo][0]) !== "string"
            || typeof(arg[qNo][1]) !== "number") {
            return false;
        }
    }
    return true;
}

export async function receiveAnswers(req: any, res: any) {
    const db: sqlite.Database = DB.open_db()
    try {
        const solvedQuiz: INTERFACES.QuizQuestionsSolved = req.body
        const quizSize = Object.keys(solvedQuiz).length
        const quizId: number = parseInt(req.params.quizId)
        const user: string = req.session.user
        if(!checkIfQuestionSolved(req.body) || (await DB.quizAlreadyTaken(db, quizId, req.session.user)) === true) {
            res.sendFile(path.join(__dirname, '/../static/quiz.html'));
            return;
        }
        if(user === undefined) return;
        const wholeTime: number = new Date().getTime() - req.session.timeStart;
        req.session.timeStart = undefined
        let overallScore: number = wholeTime/1000;
        await new Promise((resolve, reject) => {
            db.run(`BEGIN IMMEDIATE;`, (err) => { // start a new write immediately, without waiting for a write statement
                if(err) reject(new Error("Internal error while beginning transaction."))
                resolve();
            })
        })
        let lastTime: number = wholeTime/1000;
        
        for(let questionNo  = 1; questionNo <= quizSize; questionNo++) {

            const userAnswer: string = solvedQuiz[questionNo][0]
            let timeSpent: number = Math.round((wholeTime/1000 * solvedQuiz[questionNo][1]) * 100)/100 
            if(questionNo === quizSize) timeSpent =   Math.round(lastTime * 100)/100 
            else  lastTime -= timeSpent

            const questionDetails: [string, string, number] = await DB.getQuestionDetails(db, quizId, questionNo)
            const receivedPenalty: number = await DB.addUserAnswer(db, quizId, user, questionNo, questionDetails[0], questionDetails[1], userAnswer, questionDetails[2], timeSpent)
            overallScore += receivedPenalty
        }
        if(quizSize > 0) await DB.addUserScore(db, user, quizId, overallScore);
        await new Promise((resolve, reject) => {
            db.run(`COMMIT;`, (err) => {
                if(err) reject(new Error("Internal error while commiting."))
                resolve()
            })

        })
        res.sendFile(path.join(__dirname, '/../static/quiz.html'));
    } catch(err) {
        try {
            await new Promise((resolve, reject) => {
                db.run(`ROLLBACK;`, (err) => {
                    if(err) reject(new Error("Internal error while rollbacking."))
                    resolve();

                })            })
        } catch(err2) {
            console.error('err2 ', err2)
        } finally {
            console.error('err ', err)
            res.sendFile(path.join(__dirname, '/../static/quiz.html'));
        }
    } finally {
        if(db) db.close()
    }
}

export async function sendTop(req: any, res: any) {
    let topFive: INTERFACES.Top5Times = {}
    const db: sqlite.Database = DB.open_db()
    const quizId: number = parseInt(req.params.quizId)
    try {
        if(quizId === NaN) throw 404
        if(! await DB.quizInDB(db, quizId)) throw 404
        topFive = await DB.collectTopFive(db, quizId)
        res.json(topFive)
    } catch(err) {
        console.log(err)
    } finally {
        if(db) db.close()
    }
};

export async function cancelQuiz(req: any, res: any) {
    req.session.timeStart = undefined
    res.json({key: 'value'})
};

export async function renderNewQuiz(req: any, res: any) {
    res.render('addQuiz', {csrfToken: req.csrfToken()});
};

function escape(string: string) {
    return string.replace( /(<([^>]+)>)/ig, '');
}

export async function addQuiz(req: any, res: any) {
    const db: sqlite.Database = DB.open_db()
    try {
        await DB.insertQuiz(db, req.body.description, escape(req.body.json));
    } catch(err) {
        console.log(err)
    } finally {
        if(db) db.close()
        res.render('users', {csrfToken: req.csrfToken()});
    } 
}
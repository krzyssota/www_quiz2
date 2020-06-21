import * as sqlite from 'sqlite3';
import * as INTERFACES from './communicationB'
sqlite.verbose();

export async function createTable(db: sqlite.Database, tableName: string, sqlScript: string): Promise<void> {
    return new Promise((resolve, reject) => {
        db.all(`SELECT COUNT(*) AS cnt FROM sqlite_master WHERE type='table' and name='${tableName}';`, (err, rows) => {
            if (err) {
                reject(new Error('Cannot execute query in sqlite_master.'));
                return;
            }

            if (rows[0].cnt === 1) {
                console.log(tableName + ' table already exists.');
                resolve();
                return;
            }
            db.run(sqlScript, [], (err2: any) => {
                if (err2) {
                    console.error(err2);
                    reject(new Error('Cannot create table ' + tableName + ' table.'));
                    return;
                }
                console.log('Done creating ' + tableName + ' table.');
                resolve();
            });
        });
    })
}

export async function createQuizJSONTable(db: sqlite.Database): Promise<void> {
    const script: string = `CREATE TABLE quizJSON (
        json TEXT NOT NULL,
        description TEXT NOT NULL);`;
    return createTable(db, 'quizJSON', script);
}

export async function createQuizQuestionsTable(db: sqlite.Database): Promise<void> {
    const script: string = `CREATE TABLE quizQuestions (
        quizId INTEGER,
        questionNo INTEGER,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        penalty INTEGER NOT NULL,
        PRIMARY KEY(quizId, questionNo),
        FOREIGN KEY (quizId) REFERENCES quizJSON(rowid));`;
    return createTable(db, 'quizQuestions', script);
}

export async function createUserAnswersTable(db: sqlite.Database): Promise<void> {
    const script: string = `CREATE TABLE userAnswers (
        quizId INTEGER,
        userLogin TEXT,
        questionNo INTEGER,
        question TEXT NOT NULL,
        correctAnswer TEXT NOT NULL,
        userAnswer TEXT NOT NULL,  
        penalty INTEGER NOT NULL,
        timeSpent INTEGER NOT NULL,
        PRIMARY KEY(quizId, userLogin, questionNo),
        FOREIGN KEY (quizId) REFERENCES quizJSON(rowid),
        FOREIGN KEY (userLogin) REFERENCES users(login));`;
    return createTable(db, 'userAnswers', script);
}

export async function createUsersTable(db: sqlite.Database): Promise<void> {
    const script: string = `CREATE TABLE users (
        login TEXT NOT NULL,
        password TEXT NOT NULL,
        PRIMARY KEY(login));`;
    return createTable(db, 'users', script);        
}

export async function createUserScoresTable(db: sqlite.Database): Promise<void> {
    const script: string = `CREATE TABLE userScores (
        login TEXT,
        quizId INTEGER,
        score INTEGER NOT NULL,
        FOREIGN KEY (quizId) REFERENCES quizJSON(rowid),
        PRIMARY KEY(login, quizId)
        );`;
    return createTable(db, 'userScores', script);        
}

export function open_db(): sqlite.Database {
    sqlite.verbose();
    return new sqlite.Database('quizAppDatabase.db', (err) => {
        if (err) return console.error(err.message);
    });
}

export function open_session_db(): sqlite.Database {
    sqlite.verbose();
    return new sqlite.Database('sessions', (err) => {
        if (err) return console.error(err.message);
    });
}

export function quizInDB(db: sqlite.Database, quizId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(*) AS cnt FROM quizJSON WHERE rowid=${quizId}`,
            (err, row) => {
                if(err) {
                    reject(new Error("Internal error while checing if quizId in database."))
                }
                if(row.cnt === 0) resolve(false)
                else if (row.cnt === 1) resolve(true)
                else reject(new Error("Internal error while checing if quizId in database. Shouldn't ever log."))
        })
    })
}

export function quizAlreadyTaken(db: sqlite.Database, quizId: number, login: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(*) AS cnt FROM userAnswers WHERE userLogin='${login}' AND quizId=${quizId};`,
            (err, row) => {
                if(err) {
                    reject(new Error('Internal error while checking if user already taken given quiz.'))
                }
                if(row.cnt === 0) resolve(false)
                else resolve(true)
                reject(new Error('Internal error while checking if user already taken given quiz. Shouldn\'t ever log.'))
        })
    })
}

export function composeSelection(db: sqlite.Database): Promise<INTERFACES.ShortRepresentations> {
    let selection: INTERFACES.ShortRepresentations = {};
    return new Promise((resolve, reject) => {
        db.all(`SELECT rowid, description FROM quizJSON;`,
        (err, rows) => {
            if(err) {
                reject(new Error('Internal error while extracting quiz selection.'))
            }
            let row: any;
            for(row of rows) {
                selection[parseInt(row.rowid)] = row.description
            }
            resolve(selection)
        })
    })
}

export function collectQuizHeader(db: sqlite.Database, quizId: number): Promise<INTERFACES.QuizHeader> {
    let header: INTERFACES.QuizHeader = {quizId: -1, description: 'placeholder'}
    return new Promise((resolve, reject) => {
        db.get(`SELECT description FROM quizJSON WHERE rowid=${quizId};`,
        (err, row) => {
            if(err) {
                reject(new Error('Internal error while extracting quiz header.'))
            }
            header.quizId = quizId
            header.description = row.description
            resolve(header)
        })
    })
}

export function collectQuizQuestions(db: sqlite.Database, quizId: number): Promise<INTERFACES.QuizQuestionsToSolve> {
    let questions: INTERFACES.QuizQuestionsToSolve = {};
    return new Promise((resolve, reject) => {
        db.all(`SELECT questionNo, question, penalty FROM quizQuestions WHERE quizId=${quizId};`,
        (err, rows) => {
            if(err) {
                reject(new Error('Internal error while extracting quiz questions to send.'))
            }
            let row: any;
            for(row of rows) {
                questions[parseInt(row.questionNo)] = [row.question, row.penalty]
            }
            resolve(questions)
        })
    })
}

export function collectUserAnswers(db: sqlite.Database, quizId: number, login: string): Promise<INTERFACES.QuizQuestionsResult> {
    let userAnswers: INTERFACES.QuizQuestionsResult = {};
    return new Promise((resolve, reject) => {
        db.all(`SELECT questionNo, question, correctAnswer, userAnswer, penalty, timeSpent
        FROM userAnswers WHERE userLogin='${login}' AND quizId=${quizId};`,
            (err, rows) => {
                if(err) {
                    reject(new Error('Internal error while checking user\'s answers.'))
                }
            let row: any;
            for(row of rows) {
                userAnswers[parseInt(row.questionNo)] = [row.question, row.correctAnswer, row.userAnswer, row.penalty, row.timeSpent, -1]
            }
            resolve(userAnswers)
        })
    })
}

export async function collectAverageTimes(db: sqlite.Database, quizId: number, results: INTERFACES.QuizQuestionsResult): Promise<void> {
    const quizLen: number = Object.keys(results).length
    let sqlQ: string = ""
    for(let questionNo: number = 1; questionNo <= quizLen; questionNo++) {
        let timeSum: number = 0;
        sqlQ = `SELECT timeSpent FROM userAnswers WHERE correctAnswer=userAnswer AND quizId=${quizId} AND questionNo=${questionNo};`
        await new Promise((resolve, reject) => {
            db.all(sqlQ, (err, rows) => {
                if(err) {
                    reject(new Error('Internal error while summing users\' answers.'))
                }
                const usersNumber: number = rows.length
                let row: any;
                for(row of rows) {
                    timeSum += parseInt(row.timeSpent)
                }
                if(usersNumber !== 0) results[questionNo][5] = timeSum/usersNumber
                resolve();
            })
        })
    }
}

export async function getQuestionDetails(db: sqlite.Database, quizId: number, questionNo: number): Promise<[string, string, number]> {
    return  new Promise((resolve, reject) => {
        db.get(`SELECT question, answer, penalty FROM quizQuestions WHERE quizId=${quizId} AND questionNo=${questionNo};`,
            (err, row) => {
                if(err) {
                    reject(new Error('Internal error while selecting quiz questions.'))
                }
                if(row) {
                    const q: string = row.question;
                    const a: string = row.answer;
                    const p: number = parseInt(row.penalty)
                    resolve([q, a, p])
                }
        })
    })
}

export async function addUserAnswer(db: sqlite.Database, quizId: number, user: string, questionNo: number, question: string, answer: string, userAnswer: string, penalty: number, timeSpent: number): Promise<number> {
    return new Promise((resolve, reject) => {
        const sqlQ: string = `INSERT INTO userAnswers
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);`
        db.run(sqlQ, [quizId, user, questionNo, question, answer, userAnswer, penalty, timeSpent],
            (err) => {
                if(err) {
                    reject(new Error('Internal error while inserting user\'s answer.'))
                }
                if(answer.localeCompare(userAnswer) === 0) resolve(0);
                else resolve(penalty);
        })
    })
}

export async function addUserScore(db: sqlite.Database, user: string, quizId: number, score: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const sqlQ: string = `INSERT INTO userScores
        VALUES (?, ?, ?);`
        db.run(sqlQ, [user, quizId, score],
            (err) => {
                if(err) {
                    reject(new Error('Internal error while inserting user\'s score.'))
                }
                resolve()
            }
        )
    })
}

export function collectTopFive(db: sqlite.Database, quizId: number): Promise<INTERFACES.Top5Times> {
    let topFive: INTERFACES.Top5Times = {};
    return new Promise((resolve, reject) => {
        db.all(`SELECT login, score FROM userScores WHERE quizId=${quizId};`,
            (err, rows) => {
                if(err) {
                    reject(new Error('Internal error while checking best times.'))
                }
            let row: any;
            for(row of rows) {
                let login: string = row.login
                let score: number = parseInt(row.score)
                topFive[login] = score
            }
            resolve(topFive)
        })
    })
}


export async function insertQuiz(db: sqlite.Database, quizDescription: string, quizQuestionsJSON: string): Promise<void> {
    const quizQuestions: INTERFACES.QuizQuestionsInDB = JSON.parse(quizQuestionsJSON)
    const quizId: number = await insertQuizJSON(db, quizQuestionsJSON, quizDescription);
    let questionNo: string;
    for(questionNo in quizQuestions) {
        await insertQuestion(db, quizId, quizQuestions, parseInt(questionNo));
    }
}

export async function insertQuizJSON(db: sqlite.Database, quizQuestionsJSON: string, description: string): Promise<number> {
    return new Promise( (resolve, reject) => {
        db.run(
            `INSERT OR REPLACE INTO quizJSON (json, description)
            VALUES (?, ?);`, [quizQuestionsJSON, description],
            function (err: any, rows: any) {
                if(err) {
                    reject(new Error(`Internal error while inserting quiz json`));
                    return;
                }
                resolve(this.lastID)
            }
        );
    })  
}

export async function insertQuestion(db: sqlite.Database, quizId: number, quiz: INTERFACES.QuizQuestionsInDB, questionNo: number): Promise<void> {
    return new Promise( (resolve, reject) => {
        db.run(
            `INSERT OR REPLACE INTO quizQuestions (quizId, questionNo, question, answer, penalty)
            VALUES (?, ?, ?, ?, ?);`,
            [quizId, questionNo, quiz[questionNo][0], quiz[questionNo][1], quiz[questionNo][2]],
            (err) => {
                if(err) {
                    reject(new Error(`Internal error while inserting quiz question`));
                    return;
                }
            }
        );
        resolve();
    })  
}
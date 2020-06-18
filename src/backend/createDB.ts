import * as DB from './DatabaseHandler.js'
import * as sqlite from 'sqlite3';
import * as INTERFACES from './communicationB.js'
import bcrypt = require('bcryptjs')

const easyQuizDescription: string = `Introductory quiz.`
const easyQuizQuestionsJSON: string = `{
    "1": ["0+1", "1", 10],
    "2": ["1+1", "2", 20],
    "3": ["1+2", "3", 30],
    "4": ["2+3", "5", 20]
}`
const mediumQuizDescription: string = `Medium quiz.`
const mediumQuizQuestionsJSON: string = `{
    "1": ["10+2", "12", 5],
    "2": ["2-(-24:4)", "8", 5],
    "3": ["2*5", "10", 5],
    "4": ["3-5", "-2", 5]
}`
const hardQuizDescription: string = `Hard quiz.`
const hardQuizQuestionsJSON: string = `{
    "questions":{
        "1": ["99*99", "9801", 2],
        "2": ["2964:39", "76", 3],
        "3": ["2123-654", "1469", 6]
    }
}`

export async function init() {
    const db: sqlite.Database = DB.open_db();
    try {
        await DB.createUsersTable(db);
        await DB.createQuizJSONTable(db);
        await DB.createQuizQuestionsTable(db);
        await DB.createUserAnswersTable(db);

        await new Promise( (resolve, reject) => {
            const hashedUser1: string = bcrypt.hashSync('user1', 8);
            const hashedUser2: string = bcrypt.hashSync('user2', 8);
            db.exec(
                `INSERT OR REPLACE INTO users (login, password) VALUES ('user1' , '${hashedUser1}');
                INSERT OR REPLACE INTO users (login, password) VALUES ('user2' , '${hashedUser2}');`,
                (err) => {
                    if(err) {
                        reject(new Error(`Internal error while inserting users`));
                        return;
                    }
                }
            );
            resolve();
        })
        insertQuiz(db, easyQuizDescription, easyQuizQuestionsJSON);
        insertQuiz(db, mediumQuizDescription, mediumQuizQuestionsJSON);
        insertQuiz(db, hardQuizDescription, hardQuizQuestionsJSON);

        /* const easyQuizQuestions: INTERFACES.QuizQuestionsInDB = JSON.parse(easyQuizQuestionsJSON)
        const mediumQuizQuestions: INTERFACES.QuizQuestionsInDB = JSON.parse(mediumQuizQuestionsJSON)
        const hardQuizQuestions: INTERFACES.QuizQuestionsInDB = JSON.parse(hardQuizQuestionsJSON)        
        await insertQuizJSON(db, easyQuizQuestionsJSON, easyQuizDescription);
        await insertQuizJSON(db, mediumQuizQuestionsJSON, mediumQuizDescription);
        await insertQuizJSON(db, hardQuizQuestionsJSON, hardQuizDescription);
        let questionNo: string;
        for(questionNo in easyQuizQuestions) {
            console.log('easu ' + questionNo)
            await insertQuestion(db, easyQuizQuestions, questionNo);
        }
        for(questionNo in mediumQuizQuestions) {
            console.log('easu ' + questionNo)
            await insertQuestion(db, mediumQuizQuestions, questionNo);
        }
        for(questionNo in hardQuizQuestions) {
            console.log('easu ' + questionNo)
            await insertQuestion(db, hardQuizQuestions, questionNo);
        } */
    } catch (error) {
        console.error(error);
    } finally {
        db.close();
    }
}
init();

async function insertQuiz(db: sqlite.Database, quizDescription: string, quizQuestionsJSON: string) {
    const quizQuestions: INTERFACES.QuizQuestionsInDB = JSON.parse(quizQuestionsJSON)
    const quizId: number = await insertQuizJSON(db, quizQuestionsJSON, quizDescription);
    let questionNo: string;
    for(questionNo in quizQuestions) {
        await insertQuestion(db, quizId, quizQuestions, parseInt(questionNo));
    }
}
async function insertQuizJSON(db: sqlite.Database, quizQuestionsJSON: string, description: string): Promise<number> {
    return new Promise( (resolve, reject) => {
        db.all(
            `INSERT OR REPLACE INTO quizJSON (json, description)
            VALUES (${quizQuestionsJSON}, ${description});
            SELECT last_insert_rowid()`,
            (err, rows) => {
                if(err) {
                    reject(new Error(`Internal error while inserting quiz json`));
                    return;
                }
                console.log('rows[0] ' + rows[0])
                resolve(rows[0])
            }
        );
    })  
}

async function insertQuestion(db: sqlite.Database, quizId: number, quiz: INTERFACES.QuizQuestionsInDB, questionNo: number): Promise<void> {
    return new Promise( (resolve, reject) => {
        db.run(
            `INSERT OR REPLACE INTO quizQuestions (quizId, questionNo, question, answer, penalty)
            VALUES (${quizId}, ${questionNo}, '${quiz[questionNo][0]}', '${quiz[questionNo][1]}', ${quiz[questionNo][2]});`,
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
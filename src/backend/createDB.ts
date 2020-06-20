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
    "1": ["99*99", "9801", 2],
    "2": ["2964:39", "76", 3],
    "3": ["2123-654", "1469", 6]
}`

export async function init() {
    const db: sqlite.Database = DB.open_db();
    try {
        await DB.createQuizJSONTable(db);
        await DB.createUsersTable(db);
        await DB.createQuizQuestionsTable(db);
        await DB.createUserAnswersTable(db);
        await DB.createUserScoresTable(db)

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
        await insertQuiz(db, easyQuizDescription, easyQuizQuestionsJSON);
        await insertQuiz(db, mediumQuizDescription, mediumQuizQuestionsJSON);
        await insertQuiz(db, hardQuizDescription, hardQuizQuestionsJSON);
    } catch (error) {
        console.error(error);
    } finally {
        db.close();
    }
}
init();

async function insertQuiz(db: sqlite.Database, quizDescription: string, quizQuestionsJSON: string): Promise<void> {
    const quizQuestions: INTERFACES.QuizQuestionsInDB = JSON.parse(quizQuestionsJSON)
    const quizId: number = await insertQuizJSON(db, quizQuestionsJSON, quizDescription);
    let questionNo: string;
    for(questionNo in quizQuestions) {
        await insertQuestion(db, quizId, quizQuestions, parseInt(questionNo));
    }
}

async function insertQuizJSON(db: sqlite.Database, quizQuestionsJSON: string, description: string): Promise<number> {
    return new Promise( (resolve, reject) => {
        db.run(
            `INSERT OR REPLACE INTO quizJSON (json, description)
            VALUES ('${quizQuestionsJSON}', '${description}');`,
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
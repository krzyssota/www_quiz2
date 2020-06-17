import * as sqlite from 'sqlite3';
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
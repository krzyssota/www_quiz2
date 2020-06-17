import * as DB from './DatabaseHandler.js'
import * as sqlite from 'sqlite3';
import bcrypt = require('bcryptjs')

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
            db.run(
                `INSERT OR REPLACE INTO users (login, password) VALUES ('user1' , '${hashedUser1}');`,
                (err) => {
                    if(err) {
                        reject(new Error(`Internal error while inserting user1`));
                        return;
                    }
                }
            );
            db.run(
                `INSERT OR REPLACE INTO users (login, password) VALUES ('user2' , '${hashedUser2}');`,
                (err) => {
                    if(err) {
                        reject(new Error(`Internal error while inserting user2`));
                         return;
                    }
                    resolve();
                }
            );
        })
    } catch (error) {
        console.error(error);
    } finally {
        db.close();
    }
}
init();
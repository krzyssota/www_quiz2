"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.open_session_db = exports.open_db = exports.createUsersTable = exports.createUserAnswersTable = exports.createQuizQuestionsTable = exports.createQuizJSONTable = exports.createTable = void 0;
const sqlite = __importStar(require("sqlite3"));
sqlite.verbose();
function createTable(db, tableName, sqlScript) {
    return __awaiter(this, void 0, void 0, function* () {
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
                db.run(sqlScript, [], (err2) => {
                    if (err2) {
                        console.error(err2);
                        reject(new Error('Cannot create table ' + tableName + ' table.'));
                        return;
                    }
                    console.log('Done creating ' + tableName + ' table.');
                    resolve();
                });
            });
        });
    });
}
exports.createTable = createTable;
function createQuizJSONTable(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const script = `CREATE TABLE quizJSON (
        json TEXT NOT NULL,
        description TEXT NOT NULL);`;
        return createTable(db, 'quizJSON', script);
    });
}
exports.createQuizJSONTable = createQuizJSONTable;
function createQuizQuestionsTable(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const script = `CREATE TABLE quizQuestions (
        quizId INTEGER,
        questionNo INTEGER,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        penalty INTEGER NOT NULL,
        PRIMARY KEY(quizId, questionNo),
        FOREIGN KEY (quizId) REFERENCES quizJSON(rowid));`;
        return createTable(db, 'quizQuestions', script);
    });
}
exports.createQuizQuestionsTable = createQuizQuestionsTable;
function createUserAnswersTable(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const script = `CREATE TABLE userAnswers (
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
    });
}
exports.createUserAnswersTable = createUserAnswersTable;
function createUsersTable(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const script = `CREATE TABLE users (
        login TEXT NOT NULL,
        password TEXT NOT NULL,
        PRIMARY KEY(login));`;
        return createTable(db, 'users', script);
    });
}
exports.createUsersTable = createUsersTable;
function open_db() {
    sqlite.verbose();
    return new sqlite.Database('quizAppDatabase.db', (err) => {
        if (err)
            return console.error(err.message);
    });
}
exports.open_db = open_db;
function open_session_db() {
    sqlite.verbose();
    return new sqlite.Database('sessions', (err) => {
        if (err)
            return console.error(err.message);
    });
}
exports.open_session_db = open_session_db;

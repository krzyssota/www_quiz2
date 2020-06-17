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
exports.init = void 0;
const DB = __importStar(require("./DatabaseHandler.js"));
const bcrypt = require("bcryptjs");
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = DB.open_db();
        try {
            yield DB.createUsersTable(db);
            yield DB.createQuizJSONTable(db);
            yield DB.createQuizQuestionsTable(db);
            yield DB.createUserAnswersTable(db);
            yield new Promise((resolve, reject) => {
                const hashedUser1 = bcrypt.hashSync('user1', 8);
                const hashedUser2 = bcrypt.hashSync('user2', 8);
                db.run(`INSERT OR REPLACE INTO users (login, password) VALUES ('user1' , '${hashedUser1}');`, (err) => {
                    if (err) {
                        reject(new Error(`Internal error while inserting user1`));
                        return;
                    }
                });
                db.run(`INSERT OR REPLACE INTO users (login, password) VALUES ('user2' , '${hashedUser2}');`, (err) => {
                    if (err) {
                        reject(new Error(`Internal error while inserting user2`));
                        return;
                    }
                    resolve();
                });
            });
        }
        catch (error) {
            console.error(error);
        }
        finally {
            db.close();
        }
    });
}
exports.init = init;
init();

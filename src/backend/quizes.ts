import bcrypt = require('bcryptjs')
import { open_db, open_session_db } from './DatabaseHandler.js'
import { sqlite3 } from 'sqlite3';
import * as sqlite from 'sqlite3';
import path = require('path');


export async function sendSelection(req: any, res: any) {
    res.sendFile(path.join(__dirname, '/../static/quizSelection.html'));
};

export async function sendChosen(req: any, res: any) {
    console.log('jestem w send chosen')
    const quizId: number = parseInt(req.params.quizId, 10);
    res.json({ test: 'val' })
};



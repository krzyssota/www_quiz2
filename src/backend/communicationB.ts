
export interface ShortRepresentations {
    [quizId: number] : string // quizId -> description
}

export interface QuizJSONType {
    type: string    // 'tosolve'/'results'
}

export interface QuizHeader {
    quizId: number
    description: string
}

export interface QuizQuestionsInDB {
    [questionNo: number]: [string, string, number]  // questionNo -> [question, correct answer, penalty]
}

export interface QuizQuestionsToSolve {
    [questionNo: number]: [string, number] // questionNo -> [question, penalty]
}

export interface QuizQuestionsSolved {
    [questionNo: number]: [string, number]  // questionNo -> [user answer, % time spend]
}

export interface QuizQuestionsResult {
    [questionNo: number]: [string, string, string, number, number, number]  // questionNo -> [question, correct answer, user answer, penalty, timeSpent, avg time spent]
}

export interface Top5Times {
    [login: string]: number  // login -> time spent
}
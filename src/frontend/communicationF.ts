
export interface ShortRepresentations {
    [quizId: number] : string // quizId -> description
}

export interface JSONType {
    type: string    // 'tosolve'/'solve'
}

export interface QuizHeader {
    quizId: number
    description: string
}

export interface QuizQuestionsInDB {
    [questionNo: number]: [string, string, number]  // questionNo -> [question, answer, penalty]
}

export interface QuizQuestionsToSolve {
    [questionNo: number]: [string, string] // questionNo -> [question, correct answer]
}

export interface QuizQuestionsSolved {
    [questionNo: number]: [string, string, number]  // questionNo -> [question, answer, % time spend]
}

export interface QuizQuestionsResult {
    [questionNo: number]: [string, string, string, number]  // questionNo -> [question, correct answer, user answer, avg time spent]
}

export interface Top5Times {
    [login: string]: number  // login -> time spent
}
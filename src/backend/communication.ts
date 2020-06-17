
export interface ShortRepresentations {
    [quizId: number] : [string] // quizId -> description
    size: number
}

export interface JSONType {
    type: string    // 'tosolve'/'solve'
}

export interface QuizToSolve {
    quizId: number
    introduction: string
    [questionNo: number]: [string, string] // questionNo -> [question, correct answer]
    size: number
}

export interface QuizSolved {
    quizId: number
    introduction: string
    [questionNo: number]: [string, string, number]  // questionNo -> [question, answer, % time spend]
    size: number
}

export interface QuizResult {
    quizId: number
    introduction: string
    [questionNo: number]: [string, string, string, number]  // questionNo -> [question, correct answer, user answer, avg time spent]
    size: number
}

export interface Top5Times {
    [login: string]: [number]  // login -> time spent
}


const easyQuizToSolveJSON: string = `{
    "introduction": "Introductory quiz.",
    "questions":{
        "1": ["0+1", "1"],
        "2": ["1+1", "2"],
        "3": ["1+2", "3"],
        "4": ["2+3", "5"]
    },
    "size": "4"
}`

const mediumQuizToSolveJSON: string = `{
    "introduction": "Medium quiz.",
    "questions":{
        "1": ["10+2", "12"],
        "2": ["2-(-24:4)", "8"],
        "3": ["2*5", "10"],
        "4": ["3-5", "-2"]
    },
    "size": "4"
}`

const hardQuizToSolveJSON: string = `{
    "introduction": "Hard quiz.",
    "questions":{
        "1": ["99*99", "9801"],
        "2": ["2964:39", "76"],
        "3": ["2123-654", "1469"],
    },
    "size": "3"
}`

const easyQuizToSolve: QuizToSolve = JSON.parse(easyQuizToSolveJSON)
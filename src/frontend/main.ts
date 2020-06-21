import * as HTML from "./htmlElements.js"
import * as INTERFACES from "./communicationF.js"

// GLOBAL VARIABLES AND INIT
let quizToSolve: INTERFACES.QuizQuestionsToSolve;
let gloQuizId: number;
let quizDescription: string;
let quizSize: number;
let cardNumber: number;
let userAnswers: string[];
let userTimes: number[];
let enterTime: number;
let leftTime: number;
let nIntervId: any;
let currTime: number;
let timeSpent: number;

// INIT
resetVariables();
fetchQuizSelectionContent();

// TIMER
function startTimer(): void {
    nIntervId = setInterval(() => {
        currTime++;
        HTML.timerEl.innerHTML = currTime + "s";
    }, 1000);
}

function stopTimer(): void {
    clearInterval(nIntervId);
}

async function fetchQuizSelectionContent() {
    try {
        const response: Response = await fetch('http://localhost:3000/chooseQuiz/selectionRequest')
        const quizSelection: INTERFACES.ShortRepresentations = await response.json()

        HTML.viewQuizesTableBodyEl.innerHTML = ""
        for(let quizId in quizSelection) {
            const description: string = quizSelection[quizId]
            const row: string = "<tr>"
                + "<td>" + quizId + "</td>"
                + "<td>" + description + "</td>"
                + "<td>" + "<input type=\"radio\" name=\"choice\" value=\"" + quizId + "\">" + "</td>"
                + "</tr>";

            HTML.viewQuizesTableBodyEl.innerHTML += row;
        }
    } catch (err) {
        console.error(err)
    }
}

HTML.viewQuizButtonEl.addEventListener('click', async (ev: MouseEvent) => {
    event.preventDefault();
    const choice: any = new FormData(HTML.quizSelectionFormEl);
    let quizId: number;
    for (const entry of choice) {
        quizId = parseInt(entry[1].toString());
    };
    if(quizId === undefined) return;
    try {
        const response: Response = await fetch('http://localhost:3000/chooseQuiz/typeRequest/' + quizId)
        const typeObj: INTERFACES.QuizJSONType = await response.json()
        if(typeObj.type.localeCompare('tosolve') === 0) {
            await requestQuizHeader(quizId)
            await requestQuizToSolve(quizId)
            startQuiz();
        } else if(typeObj.type.localeCompare('results') === 0) {
            await requestQuizResults(quizId)
        } else {
            alert('You cannot open two quizes at the same time.')
        }
    } catch(err) {
        console.error('Cannot obtain quiz')
    }
})

async function requestQuizHeader(quizId: number) {
    const response: Response = await fetch('http://localhost:3000/chooseQuiz/quizHeaderRequest/' + quizId)
    const quizHeader: INTERFACES.QuizHeader = await response.json()
    quizDescription = quizHeader.description;
}

async function requestQuizToSolve(quizId: number): Promise<void> {
    const response: Response = await fetch('http://localhost:3000/chooseQuiz/quizQuestionsRequest/' + quizId)
    quizToSolve = await response.json()
    quizSize = Object.keys(quizToSolve).length
    for(let questionNo: number = 1; questionNo <= quizSize; questionNo++) {
        userTimes[questionNo] = 0;
    }
    gloQuizId = quizId;
}

async function requestQuizResults(quizId: number): Promise<void> {
    let response: Response = await fetch('http://localhost:3000/chooseQuiz/quizResultsRequest/' + quizId)
    const quizToSolve: INTERFACES.QuizQuestionsResult = await response.json()
    
    HTML.quizSelectionFormEl.style.visibility = "hidden"
    HTML.viewQuizButtonEl.style.visibility = "hidden"
    HTML.resultsTableWrapperEl.style.visibility = "visible"

    for(const questionNo in quizToSolve) {
        const row: string = "<tr>"
                + "<td>" + questionNo + "</td>"
                + "<td>" + quizToSolve[questionNo][0] + "</td>"
                + "<td>" + quizToSolve[questionNo][1] + "</td>"
                + "<td>" + quizToSolve[questionNo][2] + "</td>"
                + "<td>" + quizToSolve[questionNo][3] + "</td>"
                + "<td>" + quizToSolve[questionNo][4] + "</td>"
                + "<td>" + ((quizToSolve[questionNo][5] == -1) ? '-' :  quizToSolve[questionNo][5]) + "</td>"
                + "</tr>";
        HTML.resultsTableBodyEl.innerHTML += row;
    }
    response = await fetch('http://localhost:3000/chooseQuiz/quizTop5/' + quizId)
    const bestFive: INTERFACES.Top5Times = await response.json()

    let a: HTMLElement = document.getElementById("scoreWrapper") as HTMLElement
    a.style.visibility = "visible"

    for(let user in bestFive) {
        const row: string = "<tr>"
        + "<td>" + user + "</td>"
        + "<td>" + bestFive[user] + "</td>"
        + "</tr>";
        HTML.scoreTableBodyEl.innerHTML += row;
    }
}

async function sendResults(): Promise<void> {
    let answers: INTERFACES.QuizQuestionsSolved = prepareResults()
    try {
        await fetch('http://localhost:3000/chooseQuiz/sendingResults/' + gloQuizId, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(answers)
        });
    } catch(err) {
        console.log(err)
    }

}

// START QUIZ
function startQuiz() {
    // display introduction card
    HTML.introductionEl.innerHTML = quizDescription;
    HTML.introductionEl.style.opacity = "1.0";
    HTML.startWrapperEl.style.visibility = "hidden";
    HTML.cardWrapperEl.style.visibility = "visible";
}

// NEXT QUESTION
HTML.nextButtonEl.addEventListener('click', (ev: MouseEvent) => {
    ev.preventDefault()
    saveTimeStatistics();

    if (cardNumber < quizSize) {
        cardNumber++
    }
    if (cardNumber === 1) {
        // hide introduction and display gameplay elements
        HTML.introductionEl.style.opacity = "0.1";
        HTML.timerEl.style.visibility = "visible";
        setQuizCardElementsVisibility("visible")
        startTimer();
    }
    // display current question
    HTML.questionEl.innerHTML = quizToSolve[cardNumber][0] + " = ";
    resetInput()
    // update question number
    displayQuestionNumber();
    // mark if question was already answered
    markBorderIfAnswerGiven();
})

// PREVIOUS QUESTION
HTML.prevButtonEl.addEventListener('click', (ev: MouseEvent) => {
    ev.preventDefault()
    saveTimeStatistics();

    if (cardNumber > 0) {
        cardNumber--
    }
    if (cardNumber === 0) {
        stopTimer();
        // show introduction and hide gameplay elements
        HTML.introductionEl.style.opacity = "1.0"
        setQuizCardElementsVisibility("hidden")
    } else {
        // display current question
        HTML.questionEl.innerHTML = quizToSolve[cardNumber][0] + " = ";
        resetInput()
        // mark if the answer was already given
        markBorderIfAnswerGiven();
    }
    // update question number
    displayQuestionNumber();
})

// SUBMIT ANSWER
HTML.submitAnswerButtonEl.addEventListener('click', (ev: MouseEvent) => {
    if (HTML.inputEl.value !== "") {
        userAnswers[cardNumber] = HTML.inputEl.value;
    }
    if (allAnswersSubmitted()) {
        HTML.submitQuizButtonEl.removeAttribute("disabled")
    }
    markBorderIfAnswerGiven();
})

// CANCEL QUIZ SESSION
HTML.cancelQuizButtonEl.addEventListener('click', async (ev: MouseEvent) => {
    alert("Cancelling session. Redirecting to the home page. Click \"OK\"");
    HTML.cardWrapperEl.style.visibility = "hidden";
    setQuizCardElementsVisibility("hidden");
    HTML.timerEl.style.visibility = "hidden";
    HTML.startWrapperEl.style.visibility = "visible";
    resetVariables();

    await fetch('http://localhost:3000/cancelledQuiz')
    await fetchQuizSelectionContent();
})

// SUBMIT QUIZ
HTML.submitQuizButtonEl.addEventListener('click', async (ev: MouseEvent) => {
    ev.preventDefault()
    saveTimeStatistics();
    stopTimer();
    // hide gameplay, display summary
    HTML.cardWrapperEl.style.visibility = "hidden";
    HTML.timerEl.style.visibility = "hidden";
    setQuizCardElementsVisibility("hidden");

    await sendResults();
    await requestQuizResults(gloQuizId);
})

// clear player's answer input field
function resetInput() {
    (document.getElementById("playersAnswer") as HTMLInputElement).value = "";
}

function displayQuestionNumber() {
    if (cardNumber !== 0) {
        HTML.numberEl.innerHTML = cardNumber.toString() + ". question";
    } else {
        HTML.numberEl.innerHTML = "";
    }
}

function setQuizCardElementsVisibility(state: string) {
    HTML.questionEl.style.visibility = state
    HTML.inputEl.style.visibility = state
    HTML.numberEl.style.visibility = state
    HTML.submitAnswerButtonEl.style.visibility = state
}

function allAnswersSubmitted() {
    for (let i = 1; i <= quizSize; i++) {
        if (userAnswers[i] === undefined) {
            return false;
        }
    }
    return true;
}

function saveTimeStatistics() {
    if (cardNumber !== 0) {
        leftTime = currTime;
        const timeOnQuestion: number = leftTime - enterTime;
        userTimes[cardNumber] = userTimes[cardNumber] + +timeOnQuestion;
        enterTime = currTime;
    }
}

function prepareResults(): INTERFACES.QuizQuestionsSolved {
    let results: INTERFACES.QuizQuestionsSolved = {}
    let totalTime: number = 0;
    for(let questionNo = 1; questionNo <= quizSize; questionNo++) {
        totalTime += userTimes[questionNo]
    }
    for(let questionNo = 1; questionNo <= quizSize; questionNo++) { 
        results[questionNo] = [userAnswers[questionNo], (userTimes[questionNo]/totalTime)]
    }
    
    return results;
}

function resetVariables() {
    quizToSolve = {}
    gloQuizId = -1
    quizDescription = ""
    quizSize = -1

    cardNumber = 0
    userAnswers = []
    userTimes = [];
    
    enterTime = 0;
    leftTime = 0;
    currTime = 0;
    timeSpent = 0;
}

function markBorderIfAnswerGiven() {
    if (userAnswers[cardNumber] !== undefined) {
        HTML.numberEl.style.border = "2px yellow solid";
    } else {
        HTML.numberEl.style.border = "2px grey solid";
    }
}
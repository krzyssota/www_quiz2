import * as DB from './dbModule.js';
import * as HTML from "./htmlElements.js";
const jsonQuiz1 = `{
    "introduction": "Hope you will enjoy this quiz. All answers are integrals. Answered questions will be signalled with yellow border around question number.",
    "questions":{
        "1": ["10+2", "12", 4],
        "2": ["2-(-24:4)", "8", 30],
        "3": ["2*5", "10", 20],
        "4": ["3-5", "-2", 10]
    },
    "size": "4"
}`;
// GLOBAL VARIABLES AND INIT
const currQuiz = JSON.parse(jsonQuiz1);
let cardNumber;
let userAnswers;
let userTimes;
let enterTime;
let leftTime;
let nIntervId;
let currTime;
let timeSpent;
resetVariables();
DB.diplayDataByIndex(HTML.bestScoresTableBodyEl);
// TIMER
function startTimer() {
    nIntervId = setInterval(() => {
        currTime++;
        HTML.timerEl.innerHTML = currTime + "s";
    }, 1000);
}
function stopTimer() {
    clearInterval(nIntervId);
}
// START QUIZ
HTML.startquizButtonEl.addEventListener('click', (ev) => {
    // display introduction card
    HTML.introductionEl.innerHTML = currQuiz.introduction;
    HTML.introductionEl.style.opacity = "1.0";
    HTML.startWrapperEl.style.visibility = "hidden";
    HTML.cardWrapperEl.style.visibility = "visible";
});
// NEXT QUESTION
HTML.nextButtonEl.addEventListener('click', (ev) => {
    ev.preventDefault();
    saveTimeStatistics();
    if (cardNumber < currQuiz.size) {
        cardNumber++;
    }
    if (cardNumber === 1) {
        // hide introduction and display gameplay elements
        HTML.introductionEl.style.opacity = "0.1";
        HTML.timerEl.style.visibility = "visible";
        setQuizCardElementsVisibility("visible");
        startTimer();
    }
    // display current question
    HTML.questionEl.innerHTML = currQuiz.questions[cardNumber][0] + " = ";
    resetInput();
    // update question number
    displayQuestionNumber();
    // mark if question was already answered
    markBorderIfAnswerGiven();
});
// PREVIOUS QUESTION
HTML.prevButtonEl.addEventListener('click', (ev) => {
    ev.preventDefault();
    saveTimeStatistics();
    if (cardNumber > 0) {
        cardNumber--;
    }
    if (cardNumber === 0) {
        stopTimer();
        // show introduction and hide gameplay elements
        HTML.introductionEl.style.opacity = "1.0";
        setQuizCardElementsVisibility("hidden");
    }
    else {
        // display current question
        HTML.questionEl.innerHTML = currQuiz.questions[cardNumber][0] + " = ";
        resetInput();
        // mark if the answer was already given
        markBorderIfAnswerGiven();
    }
    // update question number
    displayQuestionNumber();
});
// SUBMIT ANSWER
HTML.submitAnswerButtonEl.addEventListener('click', (ev) => {
    if (HTML.inputEl.value !== "") {
        userAnswers[cardNumber] = HTML.inputEl.value;
    }
    if (allAnswersSubmitted()) {
        HTML.submitQuizButtonEl.removeAttribute("disabled");
    }
    markBorderIfAnswerGiven();
});
// CANCEL QUIZ SESSION
HTML.cancelQuizButtonEl.addEventListener('click', (ev) => {
    alert("Cancelling session. Redirecting to the home page. Click \"OK\"");
    HTML.cardWrapperEl.style.visibility = "hidden";
    setQuizCardElementsVisibility("hidden");
    HTML.timerEl.style.visibility = "hidden";
    HTML.startWrapperEl.style.visibility = "visible";
    resetVariables();
});
// SUBMIT QUIZ
HTML.submitQuizButtonEl.addEventListener('click', (ev) => {
    ev.preventDefault();
    stopTimer();
    // hide gameplay, display summary
    HTML.scoreWrapperEl.style.visibility = "visible";
    HTML.cardWrapperEl.style.visibility = "hidden";
    HTML.timerEl.style.visibility = "hidden";
    setQuizCardElementsVisibility("hidden");
    fillScoreTable();
});
// SAVE SCORE
HTML.saveScoreButtonEl.addEventListener('click', (ev) => {
    // save to database
    const score = timeSpent;
    const statistics = [];
    DB.addToDatabase(score, statistics);
    // hide summary, display home page
    HTML.scoreWrapperEl.style.visibility = "hidden";
    HTML.startWrapperEl.style.visibility = "visible";
    DB.diplayDataByIndex(HTML.bestScoresTableBodyEl);
    resetVariables();
});
// SAVE SCORE AND STATISTICS
HTML.saveScoreAndStatisticsButtonEl.addEventListener('click', (ev) => {
    // save to database
    const score = timeSpent;
    const statistics = userTimes;
    DB.addToDatabase(score, statistics);
    // hide summary, display home page
    HTML.scoreWrapperEl.style.visibility = "hidden";
    HTML.startWrapperEl.style.visibility = "visible";
    DB.diplayDataByIndex(HTML.bestScoresTableBodyEl);
    resetVariables();
});
// clear player's answer input field
function resetInput() {
    document.getElementById("playersAnswer").value = "";
}
function displayQuestionNumber() {
    if (cardNumber !== 0) {
        HTML.numberEl.innerHTML = cardNumber.toString() + ". question";
    }
    else {
        HTML.numberEl.innerHTML = "";
    }
}
function setQuizCardElementsVisibility(state) {
    HTML.questionEl.style.visibility = state;
    HTML.inputEl.style.visibility = state;
    HTML.numberEl.style.visibility = state;
    HTML.submitAnswerButtonEl.style.visibility = state;
}
function allAnswersSubmitted() {
    for (let i = 1; i <= currQuiz.size; i++) {
        if (userAnswers[i] === undefined) {
            return false;
        }
    }
    return true;
}
function saveTimeStatistics() {
    if (cardNumber !== 0) {
        leftTime = currTime;
        const timeOnQuestion = leftTime - enterTime;
        userTimes[cardNumber] = userTimes[cardNumber] + +timeOnQuestion;
        enterTime = currTime;
    }
}
// prepare score table for summary
function fillScoreTable() {
    let rows = "";
    for (let i = 1; i <= currQuiz.size; i++) {
        const correctAns = (userAnswers[i] === currQuiz.questions[i][1]);
        const fine = (correctAns ? 0 : currQuiz.questions[i][2]);
        const row = "<tr style=\"background-color:" + (correctAns ? " green" : "red") + "\">"
            + "<td>" + currQuiz.questions[i][0] + "</td>"
            + "<td>" + userAnswers[i] + "</td>"
            + "<td>" + userTimes[i] + "</td>"
            + "<td>" + fine + "</td>"
            + "</tr>";
        rows = rows + row;
        timeSpent += +userTimes[i] + +fine;
    }
    HTML.scoreTableBodyEl.innerHTML = rows;
    HTML.overallScoreEl.innerHTML = timeSpent.toString();
}
function resetVariables() {
    cardNumber = 0;
    userAnswers = [];
    userTimes = [];
    for (let i = 1; i <= currQuiz.size; i++) {
        userTimes[i] = 0;
    }
    enterTime = 0;
    leftTime = 0;
    currTime = 0;
    timeSpent = 0;
}
function markBorderIfAnswerGiven() {
    if (userAnswers[cardNumber] !== undefined) {
        HTML.numberEl.style.border = "2px yellow solid";
    }
    else {
        HTML.numberEl.style.border = "2px grey solid";
    }
}

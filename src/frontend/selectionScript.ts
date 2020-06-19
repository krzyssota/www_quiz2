import * as INTERFACES from "./communicationF.js";
import { sqlite3 } from "sqlite3";

const viewQuizesTableBodyEl = document.getElementById("viewQuizesTableBody") as HTMLElement;
const resultsTableBodyEl = document.getElementById("resultsTableBody") as HTMLElement;
const resultsTableWrapperEl = document.getElementById("resultsTableWrapper") as HTMLElement;
const quizSelectionFormEl = document.getElementById("quizSelectionForm") as HTMLFormElement;
const viewQuizButtonEl = document.getElementById("viewQuizButton") as HTMLButtonElement

async function fetchQuizSelectionContent() {
    try {
        console.log('czekam na selection')
        const response: Response = await fetch('http://localhost:3000/chooseQuiz/selectionRequest')
        const quizSelection: INTERFACES.ShortRepresentations = await response.json()
        console.log('qsel ' + quizSelection)

        for(let quizId in quizSelection) {
            // console.log('quizId ' + quizId + ' quizSelection[quizId] ' + quizSelection[quizId] + ' quizSelection[parseInt(quizId)] ' + quizSelection[parseInt(quizId)])
            const description: string = quizSelection[quizId]
            console.log('id ' + quizId + ' desc ' + description)
            const row: string = "<tr>"
                + "<td>" + quizId + "</td>"
                + "<td>" + description + "</td>"
                + "<td>" + "<input type=\"radio\" name=\"choice\" value=\"" + quizId + "\">" + "</td>"
                + "</tr>";

            viewQuizesTableBodyEl.innerHTML += row;
        }
    } catch (err) {
        // alert('Go back to localhost:3000/users and log in to continue')
        console.error(err)
    }
}
fetchQuizSelectionContent();

viewQuizButtonEl.addEventListener('click', async (ev: MouseEvent) => {
    event.preventDefault();
    const choice: any = new FormData(quizSelectionFormEl);
    let quizId: number;
    for (const entry of choice) {
        quizId = parseInt(entry[1].toString());
    };
    if(quizId === undefined){
        return;
    }
    try {
        const response: Response = await fetch('http://localhost:3000/chooseQuiz/typeRequest/' + quizId)
        const typeObj: INTERFACES.QuizJSONType = await response.json()
        if(typeObj.type.localeCompare('tosolve') === 0) {
            console.log('got type tosolve')
            await requestQuizToSolve(quizId)
        } else if(typeObj.type.localeCompare('results') === 0) {
            console.log('got type results')
            await requestQuizResults(quizId)
        } else {
            console.error('shouldnt print')
        }
    } catch(err) {
        console.error('Cannot obtain quiz')
    }
})

async function requestQuizToSolve(quizId: number): Promise<void> {
    const response: Response = await fetch('http://localhost:3000/chooseQuiz/quizQuestionsRequest/' + quizId)
    const quizToSolve: INTERFACES.QuizQuestionsToSolve = await response.json()
    for(const question in quizToSolve) {
        console.log('q ' + question + ' ' + quizToSolve[question])
    }
}

async function requestQuizResults(quizId: number): Promise<void> {
    const response: Response = await fetch('http://localhost:3000/chooseQuiz/quizResultsRequest/' + quizId)
    const quizToSolve: INTERFACES.QuizQuestionsResult = await response.json()
    
    quizSelectionFormEl.style.visibility = "hidden"
    viewQuizButtonEl.style.visibility = "hidden"
    resultsTableWrapperEl.style.visibility = "visible"

    for(const questionNo in quizToSolve) {
        const row: string = "<tr>"
                + "<td>" + questionNo + "</td>"
                + "<td>" + quizToSolve[questionNo][0] + "</td>"
                + "<td>" + quizToSolve[questionNo][1] + "</td>"
                + "<td>" + quizToSolve[questionNo][2] + "</td>"
                + "<td>" + quizToSolve[questionNo][3] + "</td>"
                + "<td>" + quizToSolve[questionNo][4] + "</td>"
                + "<td>" + quizToSolve[questionNo][5] + "</td>"
                + "</tr>";
        resultsTableBodyEl.innerHTML += row;
    }

    
}
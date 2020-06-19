import * as INTERFACES from "./communicationF.js";

const viewQuizesTableBodyEl = document.getElementById("viewQuizesTableBody") as HTMLElement;
const quizSelectionFormEl = document.getElementById("quizSelectionForm") as HTMLFormElement;
const ViewQuizButtonEl = document.getElementById("viewQuizButton") as HTMLButtonElement

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

ViewQuizButtonEl.addEventListener('click', async (ev: MouseEvent) => {
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
            // todo tu skonczylem
            /* const response: Response = await fetch('http://localhost:3000/chooseQuiz/quizRequest/' + quizId + '')
            const typeObj: INTERFACES.QuizJSONType = await response.json() */
        } else if(typeObj.type.localeCompare('results') === 0) {
            console.log('got type results')
        } else {
            console.error('shouldnt print')
        }
    } catch(err) {
        console.error('Cannot obtain quiz')
    }
})

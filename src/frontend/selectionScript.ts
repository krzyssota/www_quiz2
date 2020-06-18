import * as INTERFACES from "./communicationF.js";

const viewQuizesTableBodyEl = document.getElementById("viewQuizesTableBody") as HTMLElement;
const quizSelectionFormEl = document.getElementById("quizSelectionForm") as HTMLFormElement;
const ViewQuizButtonEl = document.getElementById("viewQuizButton") as HTMLButtonElement

async function fetchQuizSelectionContent() {
    try {
        let quizId: number;
        const response: Response = await fetch('http://localhost:3000/chooseQuiz/selection')
        const quizSelection: INTERFACES.ShortRepresentations = await response.json()
        let key: string;
        for(key in quizSelection) {
            console.log('key ' + key + ' obj[key] ' + quizSelection[key])
        }
    } catch (err) {
        console.error(err)
    }
}
fetchQuizSelectionContent();

ViewQuizButtonEl.addEventListener('click', async (ev: MouseEvent) => {
    event.preventDefault();
    const choice: any = new FormData(quizSelectionFormEl);
    let quizId: number;
    for (const entry of choice) {
        console.log('entry ' + entry + ' ' + entry[0] +' ' + entry[1])
        quizId = parseInt(entry[1].toString(), 10);
        console.log('wybrano ' + quizId )
    };
    if(quizId === undefined){
        console.log('nie nie dai')
        return;
    }
    interface i {
        [key: number] : string
    }
    try {
        console.log('feczuje' + 'http://localhost:3000/chooseQuiz/' + quizId)
        const response: Response = await fetch('http://localhost:3000/chooseQuiz/' + quizId)
        const quizObject: i = await response.json()
        for(let key in quizObject) {
            console.log('halooo key ' + key + ' obj[key] ' + quizObject[key])
        }
        console.log('po forze')
    } catch(err) {
        console.error('Cannot obtain quiz')
    }
})

const quizId: number = 1;
const row: string = "<tr>"
                + "<td>" + quizId + "</td>"
                + "<td>" + 'easy quiz' + "</td>"
                + "<td>" + "<input type=\"radio\" name=\"choice\" value=\"" + quizId + "\">" + "</td>"
                + "</tr>";

console.log('inner ' + viewQuizesTableBodyEl.innerHTML)
viewQuizesTableBodyEl.innerHTML += row;
console.log('after ' + viewQuizesTableBodyEl.innerHTML)

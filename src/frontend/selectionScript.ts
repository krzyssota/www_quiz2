
const viewQuizesTableBodyEl = document.getElementById("viewQuizesTableBody") as HTMLElement;
const quizSelectionFormEl = document.getElementById("quizSelectionForm") as HTMLFormElement;
const ViewQuizButtonEl = document.getElementById("viewQuizButton") as HTMLButtonElement

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

    try {
        console.log('feczuje' + 'http://localhost:3000/chooseQuiz/' + quizId)
        const response: Response = await fetch('http://localhost:3000/chooseQuiz/' + quizId)
        const responseStr: String = await response.json()
        console.log(responseStr);
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

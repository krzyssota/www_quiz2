var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const viewQuizesTableBodyEl = document.getElementById("viewQuizesTableBody");
const quizSelectionFormEl = document.getElementById("quizSelectionForm");
const ViewQuizButtonEl = document.getElementById("viewQuizButton");
ViewQuizButtonEl.addEventListener('click', (ev) => __awaiter(this, void 0, void 0, function* () {
    event.preventDefault();
    const choice = new FormData(quizSelectionFormEl);
    let quizId;
    for (const entry of choice) {
        console.log('entry ' + entry + ' ' + entry[0] + ' ' + entry[1]);
        quizId = parseInt(entry[1].toString(), 10);
        console.log('wybrano ' + quizId);
    }
    ;
    if (quizId === undefined) {
        console.log('nie nie dai');
        return;
    }
    try {
        console.log('feczuje' + 'http://localhost:3000/chooseQuiz/' + quizId);
        const response = yield fetch('http://localhost:3000/chooseQuiz/' + quizId);
        console.log(response.json());
    }
    catch (err) {
        console.error('Cannot obtain quiz');
    }
}));
const quizId = 1;
const row = "<tr>"
    + "<td>" + quizId + "</td>"
    + "<td>" + 'easy quiz' + "</td>"
    + "<td>" + "<input type=\"radio\" name=\"choice\" value=\"" + quizId + "\">" + "</td>"
    + "</tr>";
console.log('inner ' + viewQuizesTableBodyEl.innerHTML);
viewQuizesTableBodyEl.innerHTML += row;
console.log('after ' + viewQuizesTableBodyEl.innerHTML);

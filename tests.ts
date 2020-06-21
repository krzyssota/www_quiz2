import {Capabilities} from 'selenium-webdriver';

import { expect } from 'chai';

import { Builder, driver, ThenableWebDriver } from 'mocha-webdriver';
import { doesNotMatch } from 'assert';
// export TS_NODE_COMPILER_OPTIONS='{"lib": ["ES2015"]}';
// npx mocha -r ts-node/register --timeout 20000 testy_web.ts

const date_from_the_past = "2020-01-01"
const date_from_future = "2030-12-22";
const TIMEOUT = 50000;

let nap: number = 100;
let loginSel = '#loginWrapper > header > form:nth-child(1) > input[type=text]:nth-child(1)'
let passSel = '#loginWrapper > header > form:nth-child(1) > input[type=password]:nth-child(3)'
let loginButtonSel = '#loginWrapper > header > form:nth-child(1) > button'
let chooseButtonSel = '#loginWrapper > header > a:nth-child(4) > button'
let radioSel = '#viewQuizesTableBody > tr:nth-child(1) > td:nth-child(3) > input[type=radio]'
let viewButtonSel = '#viewQuizButton'
let nextButtonSel = '#nextButton'
let answerInputSel = '#playersAnswer'
let submitAnsSel = '#submitAnswerButton'
let submitQuizSel = '#submitQuizButton'
let quizCardSel = '#quizCard'
let scoreWrapperSel = '#scoreWrapper'

let loginChangeSel = '#loginWrapper > header > form:nth-child(3) > input[type=text]:nth-child(1)'
let oldpassChangeSel = '#loginWrapper > header > form:nth-child(3) > input[type=password]:nth-child(3)'
let newpassChangeSel = '#loginWrapper > header > form:nth-child(3) > input[type=password]:nth-child(5)'
let repeatpassChangeSel = '#loginWrapper > header > form:nth-child(3) > input[type=password]:nth-child(7)'
let changepassButtonSel = '#loginWrapper > header > form:nth-child(3) > button'
let logoutButtonSel = '#loginWrapper > header > a:nth-child(2) > button'


describe('reservation form test', function () {

    // let driver: ThenableWebDriver = undefined;
    const localhost = `http://localhost:3000`;

    this.beforeAll(async function () {
        
    })

    this.beforeEach(async function () {
        this.timeout(TIMEOUT);
        // driver = new Builder().forBrowser("firefox").build();
        await driver.get(localhost);
    })

    this.afterEach(async function () {
        // await driver.close();
         // driver = undefined;
    })

    this.afterAll(async function () {
        // await driver.close()
    })

 /*    it('take quiz only once', async function () {

        await logIn('user1', 'user1');
       
        await seeSelection();

        await chooseQuiz();
        
        await solveQuiz();
       

        await driver.get(localhost + '/chooseQuiz');
        await sleep(nap)

        await (await driver.find(viewButtonSel)).doClick();
        await sleep(nap)

        await (await driver.find(radioSel)).doClick()
        await (await driver.find(viewButtonSel)).doClick()
        await sleep(nap)

        expect (await (await driver.find(scoreWrapperSel)).isDisplayed()).to.be.equal(true)
        expect (await (await driver.find(quizCardSel)).isDisplayed()).to.be.equal(false)
    }) */

    it('changing password logs out user\'s session', async function () {

        await logIn('user2', 'user2')

        // saving and deleting cookies
        let cookie = await driver.manage().getCookie('connect.sid');

        await driver.manage().deleteAllCookies();

        // log in again
        await driver.get(localhost);
        await sleep(nap)

        await changePassword('user2', 'user2', 'changed')
  
        await driver.manage().deleteAllCookies();
        await sleep(nap)

        // load old cookies and test if I'm logged out
        await driver.manage().addCookie({ name: 'connect.sid', value: cookie.value });
        await sleep(nap)

        // this request, when user is not logged in, will redirect back to users page instead of /chooseQuiz
        // which contains login button
        await driver.get(localhost + '/chooseQuiz');
        let login = await driver.find(loginSel)
        expect(login).to.exist
    });

    /*
    Po zmianie hasła sesje użytkownika, który zmienił hasło powinny być wylogowywane. Napisz test tego zachowania w Selenium. W tym celu możesz na przykład:
    zapisać ciasteczka jednej sesji,
    usunąć je z przeglądarki, 
    stworzyć drugą sesję,
    zmienić hasło,
    wczytać ciasteczka z pierwszej sesji,
    sprawdzić, że jesteś wylogowany. */


   /*  Aplikacja powinna pobierać listę quizów a następnie pojedyncze quizy z serwera WWW
    w postaci JSONów a następnie powinna odsyłać na ten sam serwer odpowiedzi
    (wszystkie odpowiedzi do quizu na raz a nie pojedynczo)
    oraz statystyki w postaci procentowego czasu spędzonego nad konkretnym pytaniem
    (np. pyt1: 10%, pyt2: 30%, pyt3: 60%) */

    async function logIn(login :string, password: string): Promise<void> {
        await (await driver.find(loginSel)).sendKeys(login);
        await (await driver.find(passSel)).sendKeys(password);
        await (await driver.find(loginButtonSel)).doClick();
        await sleep(nap)
    }

    async function seeSelection() {
        await (await driver.find(chooseButtonSel)).doClick();
        await sleep(nap)
    }

    async function chooseQuiz() {
        await (await driver.find(radioSel)).doClick()
        await (await driver.find(viewButtonSel)).doClick()
        await sleep(nap)
    }

    async function solveQuiz() {
        await (await driver.find(nextButtonSel)).doClick()
        await sleep(nap)
        for(let i = 1; i <= 4; i++) {
            await (await driver.find(answerInputSel)).sendKeys(1);
            await (await driver.find(submitAnsSel)).doClick()
            await (await driver.find(nextButtonSel)).doClick()
            await sleep(nap)
        }
        await (await driver.find(submitQuizSel)).doClick()
    }

    async function changePassword(login :string, password: string, newPassword: string): Promise<void> {
        await (await driver.find(loginChangeSel)).sendKeys(login);
        await (await driver.find(oldpassChangeSel)).sendKeys(password);
        await (await driver.find(newpassChangeSel)).sendKeys(newPassword);
        await (await driver.find(repeatpassChangeSel)).sendKeys(newPassword);
        await (await driver.find(changepassButtonSel)).doClick();
        await sleep(nap)
    }


    async function sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    /*     it('button not clickable if date is from the past', async () => {
        await fill_form(date_from_the_past);
        expect (await driver.find('button[id=submit_button]').getAttribute("disabled")).to.be.equal("true");
    });

    it('reset button resets the text fields', async () => {
        await driver.find('button[id=reset_button]').doClick();
        expect (await get_input_by_id("imie")).to.equal("");
        expect (await get_input_by_id("nazwisko")).to.equal("");
        expect (await get_input_by_id("skad")).to.equal("");
        expect (await get_input_by_id("dokad")).to.equal("");
    });

    it('links not clickable after the reservations were made', async () => {
        await fill_form(date_from_future);
        await driver.find('button[id=submit_button]').doClick();

        // reservation info correct
        expect(await driver.find("div[id=potwierdzenie_rezerwacji]").getAttribute("innerHTML")).
        to.equal(
        (await get_input_by_id("imie")) + " " +
        (await get_input_by_id("nazwisko")) + ": " +
        "rezerwacja dokonana na dzień " +
        (await get_input_by_id("data_lotu")));

        // link not clickable
        expect(await driver.find('a').click()
            .then(() => {
                return false;
            })
            .catch(() => {
                return true;
            })
        ).to.equal(true);
    }); */

    async function fill_form(date: string) {
        await driver.find('input[type=date]').sendKeys(date);
        await driver.find('input[id=imie]').sendKeys('Jan');
        await driver.find('input[id=nazwisko]').sendKeys('Kowalski');
        await driver.find('input[id=skad]').sendKeys('Wwa');
        await driver.find('input[id=dokad]').sendKeys('Krk');
    }

    async function get_input_by_id(id: string) {
        const arg = 'input[id=' + id + ']';
        return (await driver.find(arg)).value();
    }

})


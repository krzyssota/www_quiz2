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

let firstQTime = '#resultsTableBody > tr:nth-child(1) > td:nth-child(6)'
let secondQTime = '#resultsTableBody > tr:nth-child(2) > td:nth-child(6)'
let thirdQTime = '#resultsTableBody > tr:nth-child(3) > td:nth-child(6)'
let fourthQTime = '#resultsTableBody > tr:nth-child(4) > td:nth-child(6)'


describe('reservation form test', function () {

    const localhost = `http://localhost:3000`;

    this.beforeEach(async function () {
        await driver.get(localhost);
        await sleep(nap)
    })

    it('take quiz only once', async function () {

        await logIn('user1', 'user1');
        await sleep(nap)
       
        await seeSelection();
        await sleep(nap)

        await chooseQuiz();
        await sleep(nap)
        
        await solveQuiz();
        await sleep(nap)
       

        await driver.get(localhost + '/chooseQuiz');
        await sleep(nap)

        await (await driver.find(radioSel)).doClick()
        await (await driver.find(viewButtonSel)).doClick()
        await sleep(nap)

        // results summary is displayed instead of quizCard which would appear if the quiz was enabled to be solved again
        expect (await (await driver.find(scoreWrapperSel)).isDisplayed()).to.be.equal(true)
        expect (await (await driver.find(quizCardSel)).isDisplayed()).to.be.equal(false)

        await driver.get(localhost);
        await sleep(nap)
        await (await driver.find(logoutButtonSel)).doClick();
        await sleep(nap)
    
    })

    it('changing password logs out user\'s session', async function () {
        await logIn('user2', 'user2')
        await sleep(nap)

        // saving and deleting cookies
        let cookie = await driver.manage().getCookie('connect.sid');
        await sleep(nap)

        await driver.manage().deleteAllCookies();
        await sleep(nap)

        // log in again
        await driver.get(localhost);
        await sleep(nap)

        await changePassword('user2', 'user2', 'changed')
        await sleep(nap)
  
        await driver.manage().deleteAllCookies();
        await sleep(nap)

        // load old cookies and test if I'm logged out
        await driver.manage().addCookie({ name: 'connect.sid', value: cookie.value });
        await sleep(nap)

        // this request, when user is not logged in, will redirect back to users page instead of /chooseQuiz
        // which contains login button
        await driver.get(localhost + '/chooseQuiz');
        await sleep(nap)

        let login = await driver.find(loginSel)
        expect(login).to.exist
    });

    it('it should get data send over by a json', async function () {

        await logIn('user2', 'changed');
        await sleep(nap)
       
        await seeSelection();
        await sleep(nap)

        await chooseQuiz();
        await sleep(nap)
        
        await (await driver.find(nextButtonSel)).doClick()
        await sleep(nap)
        for(let i = 1; i <= 4; i++) {
            await (await driver.find(answerInputSel)).sendKeys(1);
            await sleep(i*2000)
            await (await driver.find(submitAnsSel)).doClick()
            await sleep(nap)
            await (await driver.find(nextButtonSel)).doClick()
            await sleep(nap)
        }
        await (await driver.find(submitQuizSel)).doClick()

        await driver.get(localhost + '/chooseQuiz');
        await sleep(nap)

        await (await driver.find(radioSel)).doClick()
        await (await driver.find(viewButtonSel)).doClick()
        await sleep(nap)

        let first: number = parseInt(await (await (await driver.find(firstQTime)).getText()))
        let second: number = parseInt(await (await (await driver.find(secondQTime)).getText()))
        let third: number = parseInt(await (await (await driver.find(thirdQTime)).getText()))
        let fourth: number = parseInt(await (await (await driver.find(fourthQTime)).getText()))

        expect (first * 3).to.be.greaterThan(second)
        expect (first).to.be.lessThan(second)

        expect (second * 3).to.be.greaterThan(third)
        expect (second).to.be.lessThan(third)

        expect (third * 3).to.be.greaterThan(fourth)
        expect (third).to.be.lessThan(fourth)
    })

    async function logIn(login :string, password: string): Promise<void> {
        await (await driver.find(loginSel)).sendKeys(login);
        await (await driver.find(passSel)).sendKeys(password);
        await (await driver.find(loginButtonSel)).doClick();

    }

    async function seeSelection() {
        await (await driver.find(chooseButtonSel)).doClick();
    }

    async function chooseQuiz() {
        await (await driver.find(radioSel)).doClick()
        await (await driver.find(viewButtonSel)).doClick()
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

    }

    async function sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }
})


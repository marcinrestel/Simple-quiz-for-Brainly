"use strict";

(function () {
    Array.prototype.forEach2 = function (a) {
        var l = this.length;
        for (var i = 0; i < l; i++) {
            a(this[i], i);
        }
    }

    function arrayHasOwnIndex(array, prop) {
        return array.hasOwnProperty(prop) && /^0$|^[1-9]\d*$/.test(prop) && prop <= 4294967294;
    }

    window.onload = function () {
        Quiz.init();
    }

    var Quiz = (function () {
        var pub = {},
            quizData,
            startButton = document.querySelector(".js-quiz-start-button"),
            nextButton = document.querySelector(".js-quiz-next-button"),
            previousButton = document.querySelector(".js-quiz-previous-button"),
            quizMessage = document.querySelector(".js-quiz-message"),
            actionButtonsSeperator = document.querySelector(".js-action-buttons-seperator"),
            quizAdditonalInfoPanel = document.querySelector(".js-quiz-data"),
            answersForm = document.querySelector(".js-quiz-answers-form"),
            quizRadioInputsArray = Array.from(document.getElementsByName("js-quiz-radio-input")),
            answersLabelsArray = Array.from(document.getElementsByClassName("js-quiz-answers-labels"));

        getQuizJSON()
            .then(answerJSON => prepareForStartingTheQuiz(answerJSON))
            .catch(function () { setQuizMessage("There was an error in loading the quiz. Please try again later. We're sorry for your inconvenience.") });

        pub.init = function () {
            startButton.addEventListener("click", () => startQuiz());
            nextButton.addEventListener("click", () => changeQuestion("forward"));
            previousButton.addEventListener("click", () => changeQuestion("backward"));
            quizRadioInputsArray.forEach2(element => element.onclick = function () {
                nextButton.classList.remove("sg-icon-as-button--disabled"); 
                nextButton.disabled = false;
            });
        }

        function getQuizJSON() {
            return new Promise((resolve, reject) => {
                var request = new XMLHttpRequest();
                request.open('GET', 'https://cdn.rawgit.com/kdzwinel/cd08d08002995675f10d065985257416/raw/811ad96a0567648ff858b4f14d0096ba241f28ef/quiz-data.json', true);
                request.onload = function () {
                    if (request.status >= 200 && request.status < 400) {
                        resolve(JSON.parse(request.responseText));
                    } else {
                        reject();
                    }
                };
                request.onerror = function () { reject(); };
                request.send();
            });
        }

        function prepareForStartingTheQuiz(answerJSON) {
            quizData = answerJSON;
            quizData['answers'] = Array();
            startButton.classList.remove("display-none");
            var timeLimit = quizData['time_seconds'] > 0 ? "Please be aware you have to end the quiz within " + quizData['time_seconds'] + " seconds. There will be no possibility to pause. " : "";
            setQuizMessage("Everything is set up for your quiz. " + timeLimit + "Good luck!");
        }

        function setQuizMessage(message) {
            quizMessage.innerHTML = message;
        }

        function startQuiz() {
            startButton.classList.add("display-none");
            previousButton.classList.remove("display-none");
            nextButton.classList.remove("display-none");
            answersForm.classList.remove("display-none");
            actionButtonsSeperator.classList.remove("display-none");
            quizAdditonalInfoPanel.classList.remove("display-none");
            Timer.startTimer(quizData['time_seconds']);
            showQuestion(0);
        }

        function showQuestion(which) {
            setQuizMessage(quizData['questions'][which]['question']);
            answersLabelsArray.forEach2((element, index) => { element.innerHTML = quizData['questions'][which]['answers'][index]['answer'] });
            quizRadioInputsArray.forEach2((element, index) => handleWithCheckingRadios(element, index, which))
            ProgressBar.changeValue(which + 1, quizData['questions'].length);
        }

        function handleWithCheckingRadios(element, index, which) {
            if (index === quizData['answers'][which]) {
                element.click();
            } else {
                element.checked = false
            }
        }

        function changeQuestion(direction) {
            var changeValue = direction === "forward" ? 1 : direction === "backward" ? -1 : 0;
            var which = parseInt(answersForm.getAttribute('data-current-question')) + changeValue;
            storeCurrentAnswer();
            if (!(which >= quizData['questions'].length || which < 0)) {
                handleDisablingButtonsOnQuestionChange(which);
                answersForm.setAttribute('data-current-question', which);
                showQuestion(which);
            }
            else if (which >= quizData['questions'].length) {
                Timer.stopTimerAndShowTheResults();
            }
        }

        function storeCurrentAnswer() {
            quizRadioInputsArray.forEach2(
                function (element, index) {
                    if (element.checked) {
                        quizData.answers[answersForm.getAttribute('data-current-question')] = index;
                    }
                });
        }

        function handleDisablingButtonsOnQuestionChange(which) {
            if (which <= 0) {
                previousButton.classList.add("sg-icon-as-button--disabled");
                previousButton.disabled = true;
            }
            else {
                previousButton.classList.remove("sg-icon-as-button--disabled");
                previousButton.disabled = false;
            }
            nextButton.classList.add("sg-icon-as-button--disabled");
            nextButton.disabled = true;
        }

        pub.showResults = function () {
            nextButton.classList.add("display-none");
            previousButton.classList.add("display-none");
            answersForm.classList.add("display-none");
            actionButtonsSeperator.classList.add("display-none");
            quizAdditonalInfoPanel.classList.add("display-none");
            setQuizMessage(createResultView(calculateUsersPerformance()));
        }

        function calculateUsersPerformance() {
            var correct = 0;
            for (let eachAnswerIndex in quizData['answers']) {
                if (arrayHasOwnIndex(quizData['answers'], eachAnswerIndex)) {
                    let usersAnswer = quizData['answers'][eachAnswerIndex];
                    if (quizData['questions'][eachAnswerIndex]['answers'][usersAnswer]['correct']) {
                        correct += 1;
                    }
                }
            }
            return correct;
        }

        function createResultView(usersPerformance) {
            var message = '<div class="sg-content-box__content sg-content-box__content--spaced-bottom-large">\
                                <p class="sg-text sg-text--standout"> You scored ' + usersPerformance + ' out of ' + quizData['questions'].length + ' points.</p>\
                            </div>\
                            <div class="sg-horizontal-separator sg-horizontal-separator--short-spaced"></div>';
            for (let eachQuestionIndex in quizData['questions']) {
                if (arrayHasOwnIndex(quizData['questions'], eachQuestionIndex)) {
                    let eachQuestion = quizData['questions'][eachQuestionIndex];
                    message += '\
                    <div class="sg-content-box__content sg-content-box__content--spaced-bottom-large">\
                        <p class="sg-text sg-text--standout">' + eachQuestion['question'] + '</p>\
                    </div>\
                    <div class="sg-content-box__content sg-content-box__content--spaced-bottom-large">';
                    for (let eachAnswerIndex in eachQuestion['answers']) {
                        if (arrayHasOwnIndex(eachQuestion['answers'], eachAnswerIndex)) {
                            let eachAnswer = eachQuestion['answers'][eachAnswerIndex];
                            let isChecked = parseInt(eachAnswerIndex) === quizData['answers'][eachQuestionIndex] ? " checked" : "";
                            let isCorrect = eachAnswer['correct'] ? " sg-label__text--underline" : "";
                            message += '\
                        <div class="sg-label">\
                            <div class="sg-label__icon">\
                                <div class="sg-radio">\
                                    <input class="sg-radio__element" name="js-result-radio-input-' + eachQuestion['id'] + '" id="radio-' + eachAnswer['id'] + '" type="radio" disabled' + isChecked + '>\
                                    <label class="sg-radio__ghost" for="radio-' + eachAnswer['id'] + '"></label>\
                                </div>\
                            </div>\
                            <label class="sg-label__text js-quiz-answers-labels' + isCorrect + '" for="radio-' + eachAnswer['id'] + '">' + eachAnswer['answer'] + '</label>\
                        </div>';
                        }
                    }
                    message += '</div>';
                }
            }
            return message;
        }

        return pub;
    })();

    var ProgressBar = (function () {
        var pub = {},
            progressBarText = document.querySelector(".js-quiz-progress-bar-text"),
            quizProgressBar = document.querySelector(".js-quiz-progress-bar");

        pub.changeValue = function (currentQuestion, allQuestions) {
            changeText(currentQuestion + "/" + allQuestions);
            changeProgress(currentQuestion / allQuestions);
        }

        function changeProgress(value) {
            var percentage = value * 100;
            var style = "background: #fff;\
                    background: -moz-linear-gradient(left,  #57b2f8 0%, #57b2f8 " + percentage + "%, #fff " + percentage + "%, #fff 100%);\
                    background: -webkit-linear-gradient(left,  #57b2f8 0%,#57b2f8 " + percentage + "%, #fff " + percentage + "%, #fff 100%);\
                    background: linear-gradient(to right,  #57b2f8 0%,#57b2f8 " + percentage + "%, #fff " + percentage + "%, #fff 100%);";
            quizProgressBar.style = style;
        }

        function changeText(text) {
            progressBarText.innerHTML = text;
        }

        return pub;
    })();

    var Timer = (function () {
        var pub = {},
            intervalTimer,
            timer = document.querySelector(".js-quiz-timer");

        pub.startTimer = function (time) {
            var minutes, seconds, timeString = "";
            setTimerView(time);
            intervalTimer = setInterval(function () {
                time = time - 1;
                if (time < 0) { pub.stopTimerAndShowTheResults() };
                setTimerView(time);
            }, 1000);
        }

        pub.stopTimerAndShowTheResults = function () {
            clearInterval(intervalTimer);
            Quiz.showResults();
        }

        function setTimerView(time) {
            var minutes = Math.floor(time / 60);
            var seconds = time % 60;
            var timeString = strPadLeft(minutes, '0', 2) + ':' + strPadLeft(seconds, '0', 2);
            timer.innerHTML = timeString;
        }

        function strPadLeft(string, pad, length) {
            return (new Array(length + 1).join(pad) + string).slice(-length);
        }

        return pub;
    })();
})();
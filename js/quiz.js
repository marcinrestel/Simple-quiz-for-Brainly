(function () {
    "use strict";
    window.onload = function () {
        Array.from(document.getElementsByClassName("js-quiz-start-button")).forEach(function (element) { element.onclick = function () { startQuiz(); } });
        Array.from(document.getElementsByClassName("js-quiz-next-button")).forEach(function (element) { element.onclick = function () { changeQuestion("forward"); } });
        Array.from(document.getElementsByClassName("js-quiz-previous-button")).forEach(function (element) { element.onclick = function () { changeQuestion("backward"); } });
        Array.from(document.getElementsByName("js-quiz-checked-answer")).forEach(function (element) {
            element.onclick = function () {
                Array.from(document.getElementsByClassName("js-quiz-next-button")).forEach(function (element, index) { element.classList.remove("sg-icon-as-button--disabled"); });
            }
        });
    };

    var quizData;

    getQuizJSON()
        .then(answerJSON => prepareForStartingTheQuiz(answerJSON))
        .catch(function () { setQuizMessage("There was an error in loading the quiz. Please try again later. We're sorry for your inconvenience.") });

    function prepareForStartingTheQuiz(answerJSON) {
        quizData = answerJSON;
        quizData['answers'] = Array();
        Array.from(document.getElementsByClassName("js-quiz-start-button")).forEach(function (element) { element.classList.remove("display-none") });
        var timeLimit = quizData['time_seconds'] > 0 ? "Please be aware you have to end the quiz within " + quizData['time_seconds'] + " seconds. There will be no possibility to pause. " : "";
        setQuizMessage("Everything is set up for your quiz. " + timeLimit + "Good luck!");
    }

    function startQuiz() {
        Array.from(document.getElementsByClassName("js-quiz-start-button")).forEach(function (element) { element.classList.add("display-none") });
        Array.from(document.getElementsByClassName("js-quiz-previous-button")).forEach(function (element) { element.classList.remove("display-none") });
        Array.from(document.getElementsByClassName("js-quiz-next-button")).forEach(function (element) { element.classList.remove("display-none") });
        Array.from(document.getElementsByClassName("js-quiz-answers-radio")).forEach(function (element) { element.classList.remove("display-none") });
        changeQuestion();
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

    function setQuizMessage(message) {
        Array.from(document.getElementsByClassName("js-quiz-message")).forEach(function (element) { element.innerHTML = message });
    }

    function changeQuestion(direction) {
        var changeValue = direction === "forward" ? 1 : direction === "backward" ? -1 : 0;
        var which = parseInt(Array.from(document.getElementsByClassName("js-quiz-answers-radio")).map(function (element) { return element.getAttribute('data-current-question') })[0]) + changeValue;
        storeCurrentAnswer();
        handleDisablingButtonsOnQuestionChange(which);
        if (!(which >= quizData['questions'].length || which < 0)) {
            Array.from(document.getElementsByClassName("js-quiz-answers-radio")).forEach(function (element) { element.setAttribute('data-current-question', which) });
            showQuestion(which);
        }
        else if (which >= quizData['questions'].length) {
            // showResult();
        }
    }

    function showQuestion(which) {
        setQuizMessage(quizData['questions'][which]['question']);
        Array.from(document.getElementsByClassName("js-quiz-answers")).forEach(function (element, index) { element.innerHTML = quizData['questions'][which]['answers'][index]['answer'] });
        Array.from(document.getElementsByName('js-quiz-checked-answer')).forEach(function (element, index) { handleWithCheckingRadios(element, index, which); })
    }

    function handleWithCheckingRadios(element, index, which) {
        if (index === quizData['answers'][which]) {
            element.click();
        } else {
            element.checked = false
        }
    }

    function handleDisablingButtonsOnQuestionChange(which) {
        if (which <= 0) {
            Array.from(document.getElementsByClassName("js-quiz-previous-button")).forEach(function (element, index) { element.classList.add("sg-icon-as-button--disabled"); });
        }
        else {
            Array.from(document.getElementsByClassName("js-quiz-previous-button")).forEach(function (element, index) { element.classList.remove("sg-icon-as-button--disabled"); });
        }
        Array.from(document.getElementsByClassName("js-quiz-next-button")).forEach(function (element, index) { element.classList.add("sg-icon-as-button--disabled"); });
    }

    function storeCurrentAnswer() {
        Array.from(document.getElementsByName('js-quiz-checked-answer')).forEach(
            function (element, index) {
                if (element.checked) {
                    quizData.answers[Array.from(document.getElementsByClassName("js-quiz-answers-radio")).map(function (element) { return element.getAttribute('data-current-question') })[0]] = index;
                }
            });
    }
})();
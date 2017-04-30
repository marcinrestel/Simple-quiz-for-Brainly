// (function () {
    "use strict";

    window.onload = function () {
        Quiz.init();
    };

    var Quiz = (function () {
        var pub = {},
            quizData,
            startButtonsArray = Array.from(document.getElementsByClassName("js-quiz-start-button")),
            nextButtonsArray = Array.from(document.getElementsByClassName("js-quiz-next-button")),
            previousButtonsArray = Array.from(document.getElementsByClassName("js-quiz-previous-button")),
            quizRadioInputsArray = Array.from(document.getElementsByName("js-quiz-radio-input")),
            answersFormsArray = Array.from(document.getElementsByClassName("js-quiz-answers-form")),
            answersLabelsArray = Array.from(document.getElementsByClassName("js-quiz-answers-labels")),
            quizMessagesArray = Array.from(document.getElementsByClassName("js-quiz-message"));

        getQuizJSON()
            .then(answerJSON => prepareForStartingTheQuiz(answerJSON))
            .catch(function () { setQuizMessage("There was an error in loading the quiz. Please try again later. We're sorry for your inconvenience.") });

        pub.init = function () {
            startButtonsArray.forEach(function (element) { element.onclick = function () { startQuiz(); } });
            nextButtonsArray.forEach(function (element) { element.onclick = function () { changeQuestion("forward"); } });
            previousButtonsArray.forEach(function (element) { element.onclick = function () { changeQuestion("backward"); } });
            quizRadioInputsArray.forEach(function (element) {
                element.onclick = function () {
                    nextButtonsArray.forEach(function (element, index) { element.classList.remove("sg-icon-as-button--disabled"); element.disabled = false; });
                }
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
            console.log(quizData);
            quizData['answers'] = Array();
            startButtonsArray.forEach(function (element) { element.classList.remove("display-none") });
            var timeLimit = quizData['time_seconds'] > 0 ? "Please be aware you have to end the quiz within " + quizData['time_seconds'] + " seconds. There will be no possibility to pause. " : "";
            setQuizMessage("Everything is set up for your quiz. " + timeLimit + "Good luck!");
        }

        function setQuizMessage(message) {
            quizMessagesArray.forEach(function (element) { element.innerHTML = message });
        }

        function startQuiz() {
            startButtonsArray.forEach(function (element) { element.classList.add("display-none") });
            previousButtonsArray.forEach(function (element) { element.classList.remove("display-none") });
            nextButtonsArray.forEach(function (element) { element.classList.remove("display-none") });
            answersFormsArray.forEach(function (element) { element.classList.remove("display-none") });
            showQuestion(0);
        }

        function showQuestion(which) {
            setQuizMessage(quizData['questions'][which]['question']);
            answersLabelsArray.forEach(function (element, index) { element.innerHTML = quizData['questions'][which]['answers'][index]['answer'] });
            quizRadioInputsArray.forEach(function (element, index) { handleWithCheckingRadios(element, index, which); })
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
            var which = parseInt(answersFormsArray.map(function (element) { return element.getAttribute('data-current-question') })[0]) + changeValue;
            storeCurrentAnswer();
            if (!(which >= quizData['questions'].length || which < 0)) {
                handleDisablingButtonsOnQuestionChange(which);
                answersFormsArray.forEach(function (element) { element.setAttribute('data-current-question', which) });
                showQuestion(which);
            }
            else if (which >= quizData['questions'].length) {
                pub.showResults();
            }
        }

        function storeCurrentAnswer() {
            quizRadioInputsArray.forEach(
                function (element, index) {
                    if (element.checked) {
                        quizData.answers[answersFormsArray.map(function (element) { return element.getAttribute('data-current-question') })[0]] = index;
                    }
                });
        }

        function handleDisablingButtonsOnQuestionChange(which) {
            if (which <= 0) {
                previousButtonsArray.forEach(function (element, index) { element.classList.add("sg-icon-as-button--disabled"); element.disabled = true; });
            }
            else {
                previousButtonsArray.forEach(function (element, index) { element.classList.remove("sg-icon-as-button--disabled"); element.disabled = false; });
            }
            nextButtonsArray.forEach(function (element, index) { element.classList.add("sg-icon-as-button--disabled"); element.disabled = true; });
        }

        pub.showResults = function () {
            nextButtonsArray.forEach(function (element, index) { element.classList.add("display-none"); });
            previousButtonsArray.forEach(function (element, index) { element.classList.add("display-none"); });
            answersFormsArray.forEach(function (element, index) { element.classList.add("display-none"); });
            setQuizMessage(createResultView());
        }

        function createResultView() {
            var message = "";
            for (let eachQuestionIndex in quizData['questions']) {
                let eachQuestion = quizData['questions'][eachQuestionIndex];
                message += '\
                <div class="sg-content-box__content sg-content-box__content--spaced-bottom-large">\
                    <p class="sg-text sg-text--standout">' + eachQuestion['question'] + '</p>\
                </div>\
                <div class="sg-content-box__content sg-content-box__content--spaced-bottom-large">';
                for (let eachAnswerIndex in eachQuestion['answers']) {
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
                message += '</div>';
            }
            return message;
        }

        return pub;
    })();

// })();
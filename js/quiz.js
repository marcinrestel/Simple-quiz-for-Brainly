"use strict";
(function () {
    window.onload = function () {
        document.getElementsByClassName("js-quiz-start-button")[0].onclick = function () {
            startQuiz();
        }
    };

    var quizData;

    getQuizJSON()
        .then(answerJSON => prepareForStartingTheQuiz(answerJSON))
        .catch(function () { setQuizMessage("There was an error in loading the quiz. Please try again later. We're sorry for your inconvenience.") });

    function prepareForStartingTheQuiz(answerJSON) {
        quizData = answerJSON;
        document.getElementsByClassName("js-quiz-start-button")[0].classList.remove("display-none");
        var timeLimit = quizData['time_seconds'] > 0 ? "Please be aware you have to end the quiz within " + quizData['time_seconds'] + " seconds. There will be no possibility to pause." : "";
        setQuizMessage("Everything is set up for your quiz. " + timeLimit + " Good luck!");
    }

    function startQuiz() {
        document.getElementsByClassName("js-quiz-start-button")[0].classList.add("display-none");
        // showQuestion(1);
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
            request.onerror = function () {
                reject();
            };
            request.send();
        });
    }

    function setQuizMessage(message) {
        document.getElementsByClassName("js-quiz-message")[0].innerHTML = message;
    }

    // function showQuestion(which){
    //     setQuizMessage(quizData[1]);
    // }
})();
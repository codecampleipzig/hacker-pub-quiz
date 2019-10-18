import 'bulma/css/bulma.css'
import './style.css'
import './scoring.css'

import handlebars from 'handlebars';

const app = document.getElementById ('app');

const questionTemplate = handlebars.compile (document.getElementById('question-template').innerHTML);
const answerTemplate = handlebars.compile (document.getElementById('answer-template').innerHTML);
const introTemplate = handlebars.compile (document.getElementById ('intro-template').innerHTML);

var questions = [];
function fetchQuestions(callback) {
   const request =  new XMLHttpRequest();
   request.open ("GET", "https://opentdb.com/api.php?amount=20&category=9&difficulty=medium&type=multiple"); 
   request.send();
  
   // Do something, if the server doesn't respond
   request.addEventListener ('load', function (e) {
      questions = JSON.parse (request.response).results;
      callback();
   })
}

function randomInt (min, max) {
   return min + Math.floor ((max + 1) * Math.random())
}

function randomArray (array) {
   const result = [];
   for (const element of array) {
      result.splice (randomInt (0, array.length), 0, element);
   }
   return result;
}

function getChoices (question) {
   return randomArray ([...question.incorrect_answers, question.correct_answer]);
}

const scores = []

const routes = {
   'question' : {
      render : function ({index}) {
         const question = questions[index];
         const choices = getChoices (question);
         return questionTemplate ({
            question: question.question,
            choiceA: choices[0],
            choiceB: choices[1],
            choiceC: choices[2],
            choiceD: choices[3],
            index: index + 1,
            scores
         });
      },
      script : function ({index}) {
         document.getElementById ('next-button').addEventListener ('click', function (e) {
            e.preventDefault();
            navigate ('answer', {index: index});
         })
      }
   },
   'answer' : {
      render : function ({index}) {
         return answerTemplate ({
            answer: questions[index]['correct_answer'],
            index: index + 1,
            teams: scores,
            scores
         })
      },
      script : function ({index}) {
         document.getElementById ('next-button').addEventListener ('click', function (e) {
            e.preventDefault();
            document.querySelectorAll ('input').forEach (function (input) {
               console.log (input.dataset.id);
               console.log (input.value);
               scores[input.dataset.id - 1].score += input.checked ? 1 : 0;
            });

            navigate ('question', {index : index + 1});
         })
      }
   },
   'intro' : {
      render : function () {
         return introTemplate ({})
      },
      script : function () {

         document.querySelectorAll('.team-selector').forEach (function (selector) {
            selector.addEventListener ('click', function (e) {
               const numTeams = Number (selector.dataset.num);
               for (var i = 0; i < numTeams; i++) {
                  scores.push ({name: "Team " + (i + 1), score: 0, id: i + 1});
               }
               navigate ('question', {index: 1});
            })
         })
      }
   }
}

function navigate (path, params = {}) {
   const route = routes[path];
   app.innerHTML = route.render (params);
   route.script(params);
}

fetchQuestions(function() {
   navigate ('intro');
});

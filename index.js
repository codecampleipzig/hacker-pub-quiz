import 'bulma/css/bulma.css'
import './style.css'

import handlebars from 'handlebars';

const app = document.getElementById ('app');

const questionTemplate = handlebars.compile (document.getElementById('question-template').innerHTML);
const answerTemplate = handlebars.compile (document.getElementById('answer-template').innerHTML);

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
            index: index + 1
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
            index: index + 1
         })
      },
      script : function ({index}) {
         document.getElementById ('next-button').addEventListener ('click', function (e) {
            e.preventDefault();
            navigate ('question', {index : index + 1});
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
   navigate ('question', {index: 0})
});

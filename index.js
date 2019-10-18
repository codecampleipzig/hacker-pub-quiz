import handlebars from 'handlebars';

function fetchQuestions() {
   const request =  new XMLHttpRequest();
   request.open ("GET", "https://opentdb.com/api.php?amount=20&category=9&difficulty=medium&type=multiple", false); 
   request.send();
   // Do something, if the server doesn't respond
   return JSON.parse(request.response).results;
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

const questions = fetchQuestions();

const app = document.getElementById ('app');

const questionTemplate = handlebars.compile (document.getElementById('question-template').innerHTML);
const answerTemplate = handlebars.compile (document.getElementById('answer-template').innerHTML);

const routes = {
   'question' : {
      render : function ({index}) {
         const question = questions[index];
         return questionTemplate ({
            question: question.question,
            choices : getChoices (question),
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

navigate ('question', {index: 0});
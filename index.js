import handlebars from 'handlebars';

function fetchCategories() {
   const request =  new XMLHttpRequest();
   request.open ("GET", "https://opentdb.com/api_category.php", false); 
   request.send();
   // Do something, if the server doesn't respond
   return JSON.parse(request.response).trivia_categories;
}

function fetchQuestions(categoryID) {
   const request =  new XMLHttpRequest();
   request.open ("GET", "https://opentdb.com/api.php?amount=20&category=" + categoryID + "&difficulty=medium&type=multiple", false); 
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

var questions = [];

const app = document.getElementById ('app');

const questionTemplate = handlebars.compile (document.getElementById('question-template').innerHTML);
const answerTemplate = handlebars.compile (document.getElementById('answer-template').innerHTML);
const introTemplate = handlebars.compile (document.getElementById('intro-template').innerHTML);

const routes = {
   'intro' : {
      render : function () {
         return introTemplate ({
            categories: fetchCategories()
         })
      },
      script : function () {
         document.getElementById ('start-button').addEventListener ('click', function (e) {
            e.preventDefault();

            questions = fetchQuestions(document.getElementById ('category-select').value);
            console.log(questions);

            navigate ('question', {index: 0});
         })
      }
   },
   'question' : {
      render : function ({index}) {
         console.log(questions);
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

navigate ('intro');
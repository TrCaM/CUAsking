'use strict';
var Alexa = require("alexa-sdk");
var axios = require("axios");
var urlencode = require('urlencode');

// For detailed tutorial on how to making a Alexa skill,
// please visit us at http://alexa.design/build
const apiUrl = 'http://wiggles.stdlib.com/cuasking';


exports.handler = function (event, context) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = 'amzn1.ask.skill.3dff4ad5-c644-4f7d-a392-44a6a6c98ed9';
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('SayHello');
    },
    'PostQuestionIntent': function () {
        const encodedQuestion = urlencode(this.event.request.intent.slots.Question.value);
        const handler = this;

        axios.get(`${apiUrl}/question/post?question=${encodedQuestion}&username=Thomas`)
            .then(response => {
                handler.response.speak('Your question is successfully posted')
                    .cardRenderer('Success');
                handler.emit(':responseReady');
            })
            .catch(error => {
                handler.response.speak('Sorry, I can not post your question')
                    .cardRenderer('Error', error.toString());
                handler.emit(':responseReady');
            });
    },
    'GetIdForQuestionIntent': function () {
        const encodedQuestion = urlencode(this.event.request.intent.slots.Question.value);
        const handler = this;

        axios.get(`${apiUrl}/question/get?question=${encodedQuestion}`)
            .then(response => {
                if (response.data[0]) {
                    handler.response.speak(`Your question has id ${response.data[0].QuestionId}`)
                        .cardRenderer(`Your question has id ${response.data[0].QuestionId}`);
                    handler.emit(':responseReady');
                } else {
                    handler.response.speak('Sorry, I could not find your question')
                        .cardRenderer('Error', error.toString());
                    handler.emit(':responseReady');
                }
            })
            .catch(error => {
                handler.response.speak('Sorry, I could not find your question')
                    .cardRenderer('Error', error.toString());
                handler.emit(':responseReady');
            });
    },
    'GetQuestionByCategory': function () {
        var category = this.event.request.intent.slots.category.value;
        var handler = this;
        var questions = [];
        let offset = 5;

        axios.get(`${apiUrl}/questions/get?offset=${offset}`)
            .then(response => {
                questions = response.data;
                const question = questions.filter(question => question.Category === category)[0]
                if (question && question.QuestionText.length !== 0) {
                    handler.response.speak(`Here is your question, ${question.QuestionText}`)
                        .cardRenderer('Successed', `ID: ${question.QuestionId} \nContent: ${question.QuestionText} `);
                    handler.emit(':responseReady');
                } else {
                    handler.response.speak(`Sorry, I could not find a question of ${category} type`)
                        .cardRenderer('Error', questions.toString());
                    handler.emit(':responseReady');
                }
            })
            .catch(error => {
                handler.response.speak(`Error, I could not find a question of ${category} type`)
                    .cardRenderer('Error', error.toString());
                handler.emit(':responseReady');
            });

    },
    'HelloWorldIntent': function () {
        this.emit('SayHello');
    },
    'MyNameIsIntent': function () {
        this.emit('SayHelloName');
    },
    'SayHello': function () {
        this.response.speak('Hello World!')
            .cardRenderer('hello world', 'hello world');
        this.emit(':responseReady');
    },
    'SayHelloName': function () {
        var name = this.event.request.intent.slots.name.value;
        this.response.speak('Hello ' + name)
            .cardRenderer('hello world', 'hello ' + name);
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        console.log('Session ended with reason: ' + this.event.request.reason);
    },
    'AMAZON.StopIntent': function () {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        this.response.speak("You can try: 'alexa, hello world' or 'alexa, ask hello world my" +
            " name is awesome Aaron'");
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'Unhandled': function () {
        this.response.speak("Sorry, I didn't get that. You can try: 'alexa, hello world'" +
            " or 'alexa, ask hello world my name is awesome Aaron'");
    }
};



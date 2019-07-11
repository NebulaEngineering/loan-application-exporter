'use strict'

const { ConsoleLogger } = require('@nebulae/backend-node-tools').log;
const { survey } = require('./SurveySetup');

class SurveyPagesAndQuestions {
    /**
     * Builds a dictionary of the survey questions
     * Page vs ( questionName vs questionTitle )
     * @param { {page : {name : title}} }  
     */
    static build() {
        const pages = survey.pages
            .map(page => ({ ...page, questions: page.questions || page.elements }))
            .filter(page => page.questions)
            .map(page =>
                ({
                    pageName: (page.questions[0].html || page.questions[0].name)
                        .replace('<h2><b>', '').replace('</b> </h2>', '')
                        .replace('<h4><b>', '').replace('</b></h4>', '')
                        .replace('<b>', '').replace('</b>', '')
                        .trim(),
                    questions: page.questions.filter(question => question.name && question.title)
                        .reduce((acc, { name, title }) => {
                            acc[name] = title;
                            return acc;
                        }, {}),
                })
            ).reduce(
                (acc, {
                    pageName,
                    questions
                }) => {
                    acc[pageName] = questions;
                    return acc;
                }, {}
            );

        return pages;
    }
}

module.exports = SurveyPagesAndQuestions;
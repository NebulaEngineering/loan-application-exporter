'use strict'

const { Observable, from, of } = require("rxjs");
const { map, last, mapTo } = require("rxjs/operators");
const Excel = require('exceljs/modern.nodejs');

const COLUMNS = [
    {
        header: 'Pregunta',
        key: 'Pregunta',
        width: 50
    },
    {
        header: 'Respuesta',
        key: 'Respuesta',
        width: 50
    },
];


class ExcelBookBuilder {

    static build$(formData, surveyConfig) {

        const workbook = new Excel.Workbook();
        workbook.creator = 'Nebula Engineering SAS';

        const surveyPages = Object.keys(surveyConfig).map(pageName => ({
            name: pageName,
            questions: surveyConfig[pageName],
            responses: formData
        }));

        return from(surveyPages).pipe(
            map(({ name, questions, responses }) => ({ name, questionsAndAnswers: this.buildLinkedQuestionsAndAnswers(questions, responses) })),
            map(({ name, questionsAndAnswers }) => this.buildWoorksheet(workbook, name, questionsAndAnswers)),
            last(),
            mapTo({
                workbook,
                metadata: {
                    id: formData["_id"],
                    timestamp: formData["timestamp"],
                    clientName: formData["beneficiaryName"],
                    clientId: formData["beneficiaryIdentificationNumber"]
                }
            })
        );
    }

    static buildLinkedQuestionsAndAnswers(questions, responses) {
        return Object.keys(questions)
            .map(questionName => ({
                questionName: questions[questionName],
                response: responses[questionName] || ''
            }))
            .reduce((acc, {
                questionName,
                response
            }) => {
                acc[questionName] = response;
                return acc;
            }, {});
    }

    static buildWoorksheet(workbook, sheetName, questionsAndAnswers) {
        let worksheet = undefined;

        if (sheetName === 'applicantReferences') {
            const realSheetName = Object.keys(questionsAndAnswers)[0];
            worksheet = workbook.addWorksheet(realSheetName, {});
            worksheet.columns = Object.keys(questionsAndAnswers[realSheetName][0]).map(propKey => ({
                header: { Name: 'Nombre', Lastname: 'Apellido', Relationship: 'Relacion', PhoneNumber: 'Telefono', CellphoneNumber: 'Celular', State: 'Departamento', City: 'Ciudad' }[propKey],
                key: propKey,
                width: 20
            }));
            questionsAndAnswers[realSheetName].forEach(questionsAndAnswer => worksheet.addRow(questionsAndAnswer))
        } else {
            worksheet = workbook.addWorksheet(sheetName, {});
            worksheet.columns = COLUMNS;
            Object.keys(questionsAndAnswers).forEach(question => {
                const raw = questionsAndAnswers[question];
                let answer = Array.isArray(raw)
                    ? raw.length === 1
                        ? raw[0]
                        : raw[0] instanceof Object
                            ? raw.map(r => Object.values(r)[0])
                            : raw[0]
                    : raw;
                if(answer.replace){
                    answer = answer.replace(".00","");
                }                
                worksheet.addRow({ Pregunta: question, Respuesta: answer });
            });
        }

        return worksheet;
    }

}

module.exports = ExcelBookBuilder;
'use strinct'

const { Observable, from, of } = require("rxjs");
const { map, tap, mergeMap, } = require("rxjs/operators");
const mongoDB = require("../tools/MongoDB").singleton();
const SurveyPagesAndQuestions = require("./SurveyPagesAndQuestions");
const ExcelBookBuilder = require("./ExcelBookBuilder");
const FORM_APPLICATION_SEARCH_FROM_TIMESTAMP = parseInt(process.env.FORM_APPLICATION_SEARCH_FROM_TIMESTAMP || "0");

class LoanApplicationExporter {

    constructor() { }

    start$() {
        return this.retrieveDocuments$().pipe(
            mergeMap(formData => ExcelBookBuilder.build$(formData, SurveyPagesAndQuestions.build())),
            mergeMap(({ workbook, metadata }) => from(workbook.xlsx.writeFile(`__workbooks/${metadata.timestamp}-${metadata.clientName.replace(" ", "_")}.xlsx`)))
        );
    }

    retrieveDocuments$() {
        const collection = mongoDB.db.collection('FormApplication');
        return mongoDB.extractAllFromMongoCursor$(
            collection.find({ timestamp: { "$gt": FORM_APPLICATION_SEARCH_FROM_TIMESTAMP }})
        );
    }

}

module.exports = LoanApplicationExporter;
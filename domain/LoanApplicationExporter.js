'use strinct'

const { concat, from, of } = require("rxjs");
const { map, mapTo, mergeMap, } = require("rxjs/operators");
const mongoDB = require("../tools/MongoDB").singleton();
const SurveyPagesAndQuestions = require("./SurveyPagesAndQuestions");
const ExcelBookBuilder = require("./ExcelBookBuilder");
const FORM_APPLICATION_SEARCH_FROM_TIMESTAMP = parseInt(process.env.FORM_APPLICATION_SEARCH_FROM_TIMESTAMP || "0");

class LoanApplicationExporter {

    constructor() { }

    start$() {
        return this.retrieveDocuments$().pipe(
            mergeMap(formData => ExcelBookBuilder.build$(formData, SurveyPagesAndQuestions.build())),
            map(({ workbook, metadata }) => ({ workbook, metadata, fileName: `__workbooks/${metadata.timestamp}-${metadata.clientName.replace(" ", "_")}.xlsx` })),
            mergeMap(({ workbook, metadata, fileName }) => from(workbook.xlsx.writeFile(fileName)).pipe(
                mapTo(fileName)
            ))
        );
    }

    retrieveDocuments$() {
        const collection = mongoDB.db.collection('FormApplication');
        return mongoDB.extractAllFromMongoCursor$(
            collection.find({ timestamp: { "$gt": FORM_APPLICATION_SEARCH_FROM_TIMESTAMP } })
        );
    }

}

module.exports = LoanApplicationExporter;
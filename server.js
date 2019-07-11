'use strict'

require('dotenv').config()

const {
    Observable,
    defer,
    throwError
} = require("rxjs");
const {
    map,
    mergeMap,
    last,
    switchMap
} = require("rxjs/operators");
const {
    ConsoleLogger
} = require('@nebulae/backend-node-tools').log;
const LoanApplicationExporter = require('./domain/LoanApplicationExporter');
const mongoDB = require("./tools/MongoDB").singleton();


mongoDB.start$().pipe(
    switchMap(() => new LoanApplicationExporter().start$()),
).subscribe(
    (next) => {
        ConsoleLogger.i(`server.next: ${JSON.stringify(next,null,2)}`)
    },
    (error) => {
        ConsoleLogger.e(`server.error: ${error}`, error)
    },
    async () => {
        ConsoleLogger.i(`server.complete`);
        await mongoDB.stop$().toPromise();
    },
)
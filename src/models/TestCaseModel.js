"use strict";
module.exports = class TestCaseModel {
    constructor(caseID, statusID, comments, elapsed) {
        return {
            case_id: caseID,
            status_id: statusID,
            comment: comments,
            elapsed: elapsed,
        };
    }
}
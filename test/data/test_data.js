
const TestCaseModel = require("../../src/models/TestCaseModel")
const TestRunModel = require("../../src/models/TestRunModel")
const JiraDefectModel = require("../../src/models/JiraDefectModel")
module.exports = {
    testRunObject(suiteID, userID, mileStoneID, testArray) {
        return new TestRunModel(
            suiteID,
            "Custom Plugin run-00" + Math.floor(Math.random() * 100).toString(),
            userID,
            testArray,
            mileStoneID,
            "This is just a test description"
        )
    },
    
    testCaseObject(testCaseID, result, comments, time) {
        return new TestCaseModel(testCaseID, result, comments, time)
    },

    testJiraObject(projectKey, summary, description, componentName, priority, severity, labels) {
        return new JiraDefectModel(projectKey, summary, description, componentName, priority, severity, labels)
    }
}
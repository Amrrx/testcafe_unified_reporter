var assert = require('assert');
const rail_Channel = require("./utils/rail_channel_func")
const jira_Channel = require("./utils/jira_channel_func")
const test_Data = require("./data/test_data");
const Distributer = require("../src/distributer");
const rawTestObject = require("./data/testObject.json");
const AllureCore = require("../src/core/AllureCore")
const index = require("../src/index")
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })
const testUserConfig = {
    "auth": {
        "testRailBaseURL": process.env.testRailBaseURL,
        "railUsername": process.env.railUsername,
        "railPassword": process.env.railPassword,
        "jiraBaseURL": process.env.jiraBaseURL,
        "jiraUsername": process.env.jiraUsername,
        "jiraPassword": process.env.jiraPassword
    },
    "metaConfig": {
        "projectMeta": "Project_Name",
        "suiteMeta": "Suite_Name",
        "milestoneMeta": "MileStone_Name",
        "testcaseID": "testcase_ID",
        "componentMeta": "targetComponent",
        "projectKeyMeta": "jiraProjectKey",
        "priorityMeta": "testPriority",
        "severityMeta": "testSeverity",
        "labelsMeta": "testLabels",
        "fixtureIDMeta": "fixtureID"
    }

}
describe("Test the installation of the user configuration json file", function () {
    it('Check the config file validation functions', async function () {
        assert.equal(index().userConfigData, false);
    });
})

describe("Test the Testrail module core functions", function () {
    before(async function () {
        this.token = await rail_Channel.createAuthenticationToken()
        assert.notEqual(this.token.userID, null);
        assert.notEqual(this.token.sessionID, null);
    });

    it('Test return a project ID from current projects on testrail', async function () {
        this.projectID = await rail_Channel.getProjectID(this.token.sessionID, "AVL Project")
        assert.equal(this.projectID, 4);
    });

    it('Test return a milestone ID from current milestones on testrail', async function () {
        this.mileStoneID = await rail_Channel.getMilestoneID(this.token.sessionID, this.projectID, "Testcafe Integration")
        assert.equal(this.mileStoneID, 7);
    });

    it('Test return a Suite ID from current suites on testrail', async function () {
        this.suiteID = await rail_Channel.getSuiteID(this.token.sessionID, this.projectID, "AVL Web  Admin.")
        assert.equal(this.suiteID, 4);
    });

    it('Test return a user ID from current users on testrail', async function () {
        this.userID = await rail_Channel.getUserID(this.token.sessionID)
        assert.equal(this.userID, 57);
    });

    it('Test create new testrun', async function () {
        let testRunObject = test_Data.testRunObject(this.suiteID, this.userID, this.mileStoneID, [15569, 15100])
        this.testRun = await rail_Channel.createNewTestRun(this.token.sessionID, this.projectID, testRunObject)
        assert.notEqual(this.testRun.id, null);
    });

    it('Test update testrun results', async function () {
        let testCases = [];
        testCases.push(test_Data.testCaseObject(15569, 5, "Comment", "4m"));
        testCases.push(test_Data.testCaseObject(15100, 1, "Comment test result 2", "2m"));

        let testRunResults = await rail_Channel.updateTestRunResult(this.token.sessionID, this.testRun.id, testCases)
        assert.equal(testRunResults.data.length > 0, true);
    });
})

describe("Test the Jira module core functions", function () {
    before(async function () {
        this.token = await jira_Channel.createAuthenticationToken()
        assert.notEqual(this.token, null);
    });

    it('Test push a defect on jira', async function () {
        let railToken = await rail_Channel.createAuthenticationToken()
        let testCaseData = await rail_Channel.getTestCaseData(railToken.sessionID, 15100)
        let defectObject = test_Data.testJiraObject("AVLAUT", testCaseData.data.title,
            `${testCaseData.data.custom_preconds}\n
        ${testCaseData.data.custom_steps}\n
        ${testCaseData.data.custom_expected}`,
            "Automation", "High", "Critical", [
            "SystemTest",
            "BackEnd"
        ])
        let result = await jira_Channel.pushDefect(this.token, defectObject.toRequestPayload())
        assert.notEqual(result, null);
    });
})

describe("Test Allure module core functions", function () {
    before(async function () {

    });

    it("Test create new alurre xml file", async function () {
        const allureCore = new AllureCore();
        allureCore.setTaskStartData(rawTestObject.reportStart, rawTestObject.reportAgent, 2)
        rawTestObject.testFixtures.forEach((fixture) => {
            allureCore.createNewSuite(fixture.name)
            fixture.fTests.forEach((test) => {
                allureCore.createNewTestCase(test.tName)
                //allureCore.addTaskInfo(323213131, 1, "This is a warning")
                // allureCore.addTestEnvironment("Browser", rawTestObject.reportAgent[0])
                // allureCore.addTestArgument("Project name", fixture.fMeta.Project_Name)
                // allureCore.addTestArgument("Suite_Name", fixture.fMeta.Suite_Name)
                // allureCore.addTestArgument("MileStone_Name", fixture.fMeta.MileStone_Name)
                // allureCore.addTestLabel("story", test.tMeta.Suite_Name)
                // allureCore.addTestLabel('feature', test.tMeta.testSeverity);
                rawTestObject.reportAgent.forEach((agent) => allureCore.addTestEnvironment("User Agent", agent))
                allureCore.addTestDescription('This is just a description');
                allureCore.addTestLabel('severity', "critical");
                allureCore.addTestTag("Test")
                allureCore.endTestCaseData("passed", { "message": "This test passed", "stack": "empty stack" }, test.runInfo.durationMs)

            })
            allureCore.endTestSuite()
        })


    })
})

describe("Test the distributer class functionality", function () {
    before(async function () {
        this.token = await jira_Channel.createAuthenticationToken()
        assert.notEqual(this.token, null);
    });

    it("Test push on testrail and jira from the raw test object", async function () {
        const reportDistributer = new Distributer(testUserConfig);
        await reportDistributer.setTestObject(rawTestObject);
        await reportDistributer.startDistributing();

    })
})

describe("Random Functions Test", function () {

    before(async function () {
        const reportDistributer = new Distributer();
        this.distributer = reportDistributer
    });

    it("Test the check metadata validation function", async function () {
        assert.equal(this.distributer.checkMetaData(rawTestObject), true)
    })

    it("Test the check metadata validation function with a missing meta key in fixture", async function () {
        delete rawTestObject.testFixtures[0].fMeta.Project_Name
        assert.throws(() => this.distributer.checkMetaData(rawTestObject))
    })

    it("Test the check metadata validation function with a missing meta key in test", async function () {
        delete rawTestObject.testFixtures[0].fTests[0].tMeta.testcase_ID
        assert.throws(() => this.distributer.checkMetaData(rawTestObject))
    })
})
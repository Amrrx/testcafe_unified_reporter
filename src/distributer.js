"use strict";
const JiraCore = require("./core/JiraCore.js")
const TestrailCore = require("./core/TestrailCore.js")
const TestRailInstance = require("./channels/TestRailInstance.js")
const jiraInstance = require("./channels/jiraInstance.js")
const logger = require("./logger");
const globalConfigs = require("./config.json");
const AllureCore = require("./core/AllureCore.js");
const AllureInstance = require("./channels/AllureInstance.js");
const railExceptions = require("./exceptions/TestRailExceptions")
const jiraExceptions = require("./exceptions/JiraExceptions")

module.exports = class Distributer {
   #TEST_OBJECT;
   railCore;
   railProcessor;
   jiraCore;
   jiraProcessor;
   railToken;
   allureCore;
   allureInstance;
   constructor(userconfig) {
      this.userConfigs = userconfig
   }


   async setTestObject(testObject) {
      this.#TEST_OBJECT = testObject;
   }

   async startDistributing() {
      try {
         await this.checkMetaData(this.#TEST_OBJECT)
         await this.distributeToRail(this.#TEST_OBJECT);
         await this.distributeToJira(this.#TEST_OBJECT);
         await this.distributeToAllure(this.#TEST_OBJECT);
      } catch (error) {
         if (error instanceof railExceptions.TestRailErrors || error instanceof jiraExceptions.JiraErrors) {
            logger(error.name, true)
            if (error.message.response != undefined) {
               logger(error.message.response.data, true)
            }
         } else {
            logger(error, true)
         }
      }
   }

   checkMetaData(testObject) {
      if (testObject.testFixtures.every((fixture) => this.checkFixtureMeta(fixture) && fixture.fTests.every((test) => this.checkTestCaseMeta(test)))) return true; else throw "Missing required metadata, unable to complete."
   }

   async distributeToRail(railTestObject) {
      this.railCore = new TestrailCore(globalConfigs.testrail, this.userConfigs.auth)
      this.railProcessor = new TestRailInstance(this.railCore, this.userConfigs);
      this.railToken = await this.railProcessor.createTokenDetails();
      const runData = await this.railProcessor.prepareRunData(this.railToken, railTestObject);
      await this.railProcessor.pushNewRun(this.railToken, runData);
      await this.railProcessor.pushTestResults(this.railToken, runData);
      await this.railProcessor.runReportTemplate(this.railToken, this.userConfigs.general.testrail_report_template);
   }

   async distributeToJira(testObject) {
      this.jiraCore = new JiraCore(globalConfigs.jira, this.userConfigs.auth)
      this.jiraProcessor = new jiraInstance(this.jiraCore, this.userConfigs);
      let sessionCookies = await this.jiraProcessor.initateAuthenticationToken();
      let defects = await this.jiraProcessor.extractDefectsFromObject(testObject);
      let issuesList = await this.jiraProcessor.createIssueObjectList(defects);
      await this.updateIssuesListWithDescription(issuesList)
      await this.jiraProcessor.pushEachDefect(await sessionCookies, issuesList);
      await this.jiraProcessor.updateDefectAttachment(await sessionCookies, issuesList)
      return true
   }

   async distributeToAllure(testObject) {
      this.allureCore = new AllureCore(globalConfigs.allure)
      this.allureInstance = new AllureInstance(this.allureCore, this.userConfigs)
      this.allureInstance.generateReport(testObject)
   }

   async updateIssuesListWithDescription(issuesList) {
      await Promise.all(issuesList.map(async (test) => {
         let testCaseData = await this.railCore.getTestCaseByID(this.railToken.sessionID, test.id);
         test.description =
            `h3. Steps to produce\n
            ${testCaseData.data.custom_preconds}\n
             ${testCaseData.data.custom_steps}\n\n
             h3. Expected Results\n
             ${testCaseData.data.custom_expected}\n\n
             h3. Actual Results:\n
             {quote}${test.errors.join('\n')}{quote}`
      }))
      return issuesList
   }

   checkFixtureMeta(fixture) {
      let fixtureMetas = [this.userConfigs.metaConfig.projectKeyMeta, this.userConfigs.metaConfig.projectMeta, this.userConfigs.metaConfig.suiteMeta,
      this.userConfigs.metaConfig.milestoneMeta]
      return fixtureMetas.every((metaItem) => {
         if (Object.keys(fixture.fMeta).includes(metaItem)) {
            return true
         }
         else {
            logger(`${metaItem} is missing from fixture metadata`, true)
            return false
         }
      })
   }

   checkTestCaseMeta(testCase) {
      let testCaseMeta = [this.userConfigs.metaConfig.testcaseID, this.userConfigs.metaConfig.componentMeta,
      this.userConfigs.metaConfig.priorityMeta, this.userConfigs.metaConfig.labelsMeta]
      return testCaseMeta.every((metaItem) => {
         if (Object.keys(testCase.tMeta).includes(metaItem)) {
            return true
         }
         else {
            logger(`${metaItem} is missing from testcase metadata`, true)
            return false
         }
      })
   }
};



const Distributer = require("./distributer");
const logger = require("./logger");
const chalk = require('chalk')
const globalConfigs = require("./config.json");
const path = require('path')
const fs = require("fs")
var appRoot = require('app-root-path');
let userconfig;

class TestRun {
   constructor() {
      this.dataObject = {
         reportStart: "",
         reportAgent: "",
         testsCount: "",
         testFixtures: [],
         rendTime: "",
         rpassed: "",
         rfailed: "",
         rwarnings: "",
         rresults: "",
      };
   }

   updateDataObject(params, value) {
      this.dataObject[params] = value;
   }

   updateFixtures(fName, fPath, fMeta, fID) {
      this.dataObject["testFixtures"].push({
         fID: fID,
         name: fName,
         path: fPath,
         fMeta: fMeta,
         fTests: [],
      });
   }

   updateFixtureTests(tName, tMeta, tID, info, tErr) {
      this.dataObject["testFixtures"][this.dataObject["testFixtures"].length - 1]["fTests"].push({
         tID: tID,
         tName: tName,
         tMeta: tMeta,
         runInfo: info,
         tErrors: tErr
      });
   }

   updateTestRunFooter(endTime, passed, warnings, result, failed) {
      this.dataObject["rendTime"] = endTime;
      this.dataObject["rpassed"] = passed;
      this.dataObject["rfailed"] = failed;
      this.dataObject["rwarnings"] = warnings;
      this.dataObject["rresults"] = result;
   }

   async printGeneratedObject() {
      try {
         logger("Starting the distributer master......");
         const reportDistributer = new Distributer(userconfig);
         await reportDistributer.setTestObject(this.dataObject);
         await reportDistributer.startDistributing();
         logger("Done......");
      } catch (error) {
         logger(error, true);
      }
   }
}

module.exports = function () {
   return {
      noColors: true,
      reporterHandler: new TestRun(),
      userConfigData: validateConfigFile(),
      reportTaskStart(startTime, userAgents, testCount) {
         this.startTime = startTime;
         this.testCount = testCount;

         const time = this.moment(startTime).format("M/D/YYYY h:mm:ss a");

         this.write(chalk.yellow('--> ') + `User configuration file status:` + this.userConfigData).newline()

         this.write(chalk.green('--> ') + `Unified testcafe reporter started: ${time}`).newline()
            .write(chalk.green('--> ') + `Running ${testCount} tests in: ${userAgents}`).newline();

         this.reporterHandler.updateDataObject("reportStart", startTime);
         this.reporterHandler.updateDataObject("reportAgent", userAgents);
         this.reporterHandler.updateDataObject("testsCount", testCount);
      },

      reportFixtureStart(name, path, meta) {
         this.currentFixtureName = name;
         this.currentFixtureMeta = meta;
         this.write('\n' + chalk.green('--> ') + `Starting fixture: ${name} ${meta[userconfig.metaConfig.fixtureIDMeta]}`).newline();
         this.reporterHandler.updateFixtures(name, path, meta, Math.random());
      },

      async reportTestStart(name, meta) {
         // this.write(chalk.green('--> ') + `Starting test: ${name} (${meta[userconfig.metaConfig.severityMeta]})`).newline();
      },

      reportTestDone(name, testRunInfo, meta) {
         const errors = testRunInfo.errs;
         const warnings = testRunInfo.warnings;
         const hasErrors = !!errors.length;
         const hasWarnings = !!warnings.length;
         const result = hasErrors ? `failed` : `passed`;
         const errorsArray = []
         if (hasErrors) {
            this.write(`\n` + chalk.red('--> ') + `Finished test: ${name} (${meta[userconfig.metaConfig.priorityMeta]}) ${chalk.red(result)}`).newline();
            this.newline()
               .write('Errors:');

            errors.forEach(error => {
               this.newline()
                  .write(this.formatError(error));
               errorsArray.push(this.formatError(error))
            });

         } else {
            this.write(`\n` + chalk.green('--> ') + `Finished test: ${name} (${meta[userconfig.metaConfig.priorityMeta]}) ${chalk.green(result)}`).newline();
         }
         this.newline()
         if (hasWarnings) {
            this.newline()
               .write('Warnings:');

            warnings.forEach(warning => {
               this.newline()
                  .write(warning);
            });

         }
         this.newline()

         this.reporterHandler.updateFixtureTests(name, meta, Math.random(), testRunInfo, errorsArray);
      },

      async reportTaskDone(endTime, passed, warnings, result) {
         this.reporterHandler.updateTestRunFooter(endTime, passed, warnings, result, result.failedCount);
         const time = this.moment(endTime).format('M/D/YYYY h:mm:ss a');
         const durationMs = endTime - this.startTime;
         const durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
         const summary = result.failedCount ? chalk.red(`${result.failedCount}/${this.testCount} failed`) : chalk.green(`${result.passedCount} passed`);
         this.write(chalk.green('--> ') + `Testing finished: ${time} | Duration: ${durationStr} | ${summary}`).newline();
         await this.reporterHandler.printGeneratedObject();
      },
   };
};

function validateConfigFile() {
   let fileValidations = [validateFileExistance, validateFileStructure, validateFileAuthKeysValues, validateFileMetaKeysValues]
   return fileValidations.every((item) => item() == true)
}

function validateFileExistance() {
   if (!fs.existsSync(path.resolve(appRoot.path + "/" + globalConfigs.general.userConfigFileName))) {
      fs.writeFileSync(path.resolve(appRoot.path + "/" + globalConfigs.general.userConfigFileName), JSON.stringify(returnObject()))
   }
   userconfig = require(path.resolve(appRoot.path + "/" + globalConfigs.general.userConfigFileName))
   return true
}

function validateFileStructure() {
   let mandatoryStructure = ["auth", "metaConfig", "general"]
   return mandatoryStructure.every((item) => Object.keys(userconfig).includes(item))
}

function validateFileAuthKeysValues() {
   let authKeys = ["testRailBaseURL", "railUsername", "railPassword", "jiraBaseURL", "jiraUsername", "jiraPassword"]
   return authKeys.every((item) => Object.keys(userconfig.auth).includes(item) && userconfig.auth[item] != "" && userconfig.auth[item] != null)
}

function validateFileMetaKeysValues() {
   let metaKeys = ["projectMeta", "suiteMeta", "milestoneMeta", "testcaseID", "componentMeta", "projectKeyMeta", "priorityMeta", "severityMeta", "labelsMeta", "fixtureIDMeta"]
   return metaKeys.every((item) => Object.keys(userconfig.metaConfig).includes(item) && userconfig.metaConfig[item] != "" && userconfig.metaConfig[item] != null)
}

const returnObject = () => {
   return {
      "auth": {
         "testRailBaseURL": "",
         "railUsername": "",
         "railPassword": "",
         "jiraBaseURL": "",
         "jiraUsername": "",
         "jiraPassword": ""
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
         "fixtureIDMeta": "fixtureID",
         "parentMeta": "USER_STORY"
      },
      "general": {
         "testrail_report_template": null
      }
   }
}
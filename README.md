# testcafe-reporter-unified

This is the **Unified** reporter plugin for [TestCafe](http://devexpress.github.io/testcafe).

## Version - 1.2
- Create test run on test rail for each tested fixture
- Create defect on jira with the assigned meta data based on the testcase result
- Create allure report 
- Simple command line reporter

## Install

```
npm install testcafe-reporter-unified
```
## Instructions

- Create a (**reporterconfig.json**) file in your test project root folder with the following structure 
```
{
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
      }
   }
```
- Specify the empty strings with the required values
- Change the meta data key names if you want

## Usage

Add the required meta data to your fixture function and testcase function as the following example.

If you have changed the meta keys in the config files, you should also apply this change in your test project.

```js
fixture`login Module`.meta({fixtureID:"F1", jiraProjectKey: "testProject", Project_Name: "Test Project", Suite_Name: "Test Web Suite", MileStone_Name: "Testcafe Integration" })
```

```js
test.meta({ testcase_ID: "C15100", targetComponent: "Automation", testPriority: "High", testSeverity: "Critical", testLabels: "SystemTest"})
```

When you run tests from the command line, specify the reporter name by using the `--reporter` option:

```
testcafe chrome 'path/to/test/file.js' --reporter unified
```


When you use API, pass the reporter name to the `reporter()` method:

```js
testCafe
    .createRunner()
    .src('path/to/test/file.js')
    .browsers('chrome')
    .reporter('unified') // <-
    .run();
```

## Author
Amr Aly @ 2021
# Unified_Reporter

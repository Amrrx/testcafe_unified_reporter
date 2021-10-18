"use strict";
module.exports = class jiraDefectInstance {
   constructor(projectKey, caseSummery, caseDescr, componentName, priority, severity, labels, testCaseID, attachment) {
      this.id = testCaseID
      this.projectKey = projectKey;
      this.title = caseSummery;
      this.description = caseDescr;
      this.component = componentName;
      this.priority = priority;
      this.severity = severity;
      this.labels = labels;
      this.attachment = attachment
      this.jiraKey = null;
   }

   toRequestPayload() {
      return {
         fields: {
            project: {
               key: this.projectKey,
            },
            summary: "Automated - " + this.title,
            description: this.description + " \n" + "Auto created defect by Unified reporter v1.0",
            issuetype: {
               name: "Bug",
            },
            components: [
               {
                  name: this.component,
               },
            ],
            priority: {
               "name": this.priority,
            },
            labels: this.labels,
            customfield_10700: { "value": this.severity },
         },
      };
   }

}
"use strict";
module.exports = class jiraDefectInstance {
   constructor(projectKey, caseSummery, caseDescr, componentName, priority, severity, labels, testCaseID, attachment, errors, parentKey) {
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
      this.errors = errors;
      this.parent = parentKey
   }

   toRequestPayload() {
      return {
         fields: {
            project: {
               key: this.projectKey,
            },
            summary: "Automated - " + this.title,
            description: this.description + " \n\n" + "{{Auto created defect by Unified reporter}}",
            issuetype: {
               name: "Sub-Bug",
            },
            components: [
               {
                  name: this.component,
               },
            ],
            priority: {
               "name": this.priority,
            },
            labels: [this.labels],
            parent:
            {
               "key": this.parent
            },
         }
      };
   }

}
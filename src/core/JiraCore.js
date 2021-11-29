"use strict";
const http = require("axios").default;
const logger = require("../logger");
const jiraExceptions = require("../exceptions/JiraExceptions")
module.exports = class JiraCore {
   constructor(configObject, authConfig) {
      this.jiraConfig = configObject;
      this.userName = authConfig.jiraUsername;
      this.password = authConfig.jiraPassword;
      this.baseUrl = authConfig.jiraBaseURL;
      this.authEndPoint = this.jiraConfig.gAuthEndPoint;
      this.issueEndPoint = this.jiraConfig.gCreateIssue;
   }

   async initateAuthenticationToken() {
      try {
         const sd = await http.post(
            this.baseUrl + this.authEndPoint,
            {
               username: this.userName,
               password: this.password,
            },
            {
               headers: {
                  "Content-Type": "application/json",
               },
            }
         );
         logger("Initiating Jira token status is: " + (sd.status == 200 && await sd.headers["set-cookie"] != undefined ? "OK" : "Denied"));
         return await sd.headers["set-cookie"];
      } catch (error) {
         // logger(await error.response.data, true);
         // console.error(await error.response.data);
         throw new jiraExceptions.UnableToAuthenticate(error)
      }
   }

   async pushNewIssue(cookies, dataPayload) {
      try {
         const sd = await http.post(this.baseUrl + this.issueEndPoint, await dataPayload, {
            headers: {
               Cookie: await cookies,
               "Content-Type": "application/json",
            },
         });
         logger("Defect pushed with key: " + sd.data.key);
         return await sd.data.key;
      } catch (error) {
         // logger("Issue while pushing a new issue on jira");
         // logger(await error.response.data, true);
         // console.error(await error.response.data);
         throw new jiraExceptions.PushNewIssue(error)
      }
   }

   async updateIssueAttachment(cookies, issueKey, dataPayload) {
      try {
         const sd = await http.post(this.baseUrl + this.issueEndPoint + issueKey + "/attachments", dataPayload, {
            headers: {
               Cookie: await cookies,
               "Accept": "application/json",
               'X-Atlassian-Token': 'no-check',
               'Content-Type': `multipart/form-data; boundary=${dataPayload._boundary}`
            },
         });
         logger("Defect updated with new attachment");
         return await sd.data;
      } catch (error) {
         // logger("Issue while pushing a new issue on jira");
         // logger(await error.response, true);
         // console.error(await error.response);
         throw new jiraExceptions.UpdateIssueAttachment(error)
      }
   }
}
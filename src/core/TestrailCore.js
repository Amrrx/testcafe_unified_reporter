"use strict";
const http = require("axios").default;
const logger = require("../logger");
module.exports = class TestrailCore {
    constructor(configObject, authConfig) {
        
        this.railConfig = configObject;
        this.userName = authConfig.railUsername;
        this.password = authConfig.railPassword;
        this.baseUrl = authConfig.testRailBaseURL;
        this.authEndPoint = this.railConfig.gAuthEndPoint;
        this.listProjectsEndPoint = this.railConfig.gListProjectsEndPoint;
        this.listMileStones = this.railConfig.gListMileStones;
        this.listProjectSuites = this.railConfig.gListProjectSuites;
        this.getCurrentUser = this.railConfig.gGetCurrentUser;
        this.addNewRun = this.railConfig.gAddNewRun;
        this.addResults = this.railConfig.gAddResults;
        this.getTestCase = this.railConfig.gGetTestCase
    }

    async initateAuthenticationToken() {
        try {
            let sessionID = await http.get(this.baseUrl + "/auth/login");
            let requestCookies = await sessionID.headers["set-cookie"].toString().slice(0, sessionID.headers["set-cookie"].toString().indexOf(";"));
            let sd = await http.post(
                this.baseUrl + this.authEndPoint,
                new URLSearchParams({
                    name: this.userName,
                    password: this.password,
                    rememberme: 1,
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Cookie: requestCookies,
                    },
                }
            );
            logger("Initiating Testrail token status is: " + sd.statusText);
            return requestCookies;
        } catch (error) {
            console.log(error)
            logger(await error.response.data, true);
            console.error(await error.response.data);
        }
    }

    async getProjectIDS(sessionCookies, projectName) {
        try {
            let listProjects = await http.get(this.baseUrl + this.listProjectsEndPoint, {
                headers: {
                    "Content-Type": "application/json",
                    Cookie: await sessionCookies,
                },
            });
            let targetProject = await listProjects.data.filter((project) => project.name == projectName);
            return await targetProject[0].id;
        } catch (error) {
            logger(await error.response.data, true);
            console.error(await error.response.data);
        }
    }

    async getMileStoneID(sessionCookies, projectID, mileStoneName) {
        try {
            let listMileStones = await http.get(this.baseUrl + this.listMileStones + "/" + (await projectID), {
                headers: {
                    "Content-Type": "application/json",
                    Cookie: await sessionCookies,
                },
            });
            let targetMileStone = await listMileStones.data.filter((mileStone) => mileStone.name == mileStoneName);
            return await targetMileStone[0].id;
        } catch (error) {
            logger(await error.response.data, true);
            console.error(await error.response.data);
        }
    }

    async getSuiteID(sessionCookies, projectID, suitName) {
        try {
            let listSuits = await http.get(this.baseUrl + this.listProjectSuites + "/" + (await projectID), {
                headers: {
                    "Content-Type": "application/json",
                    Cookie: await sessionCookies,
                },
            });
            let targetSuit = await listSuits.data.filter((projectSuite) => projectSuite.name == suitName);
            return await targetSuit[0].id;
        } catch (error) {
            logger(await error.response.data, true);
            console.error(await error.response.data);
        }
    }

    async getUserID(sessionCookies) {
        try {
            let userDetails = await http.get(this.baseUrl + this.getCurrentUser + "&email=" + this.userName, {
                headers: {
                    "Content-Type": "application/json",
                    Cookie: await sessionCookies,
                },
            });
            return await userDetails.data.id;
        } catch (error) {
            logger(await error.response.data, true);
            console.error(await error.response.data);
        }
    }

    async pushNewTestRun(sessionCookies, projectID, testRunObject) {
        try {
            let addRunRequest = await http.post(this.baseUrl + this.addNewRun + "/" + projectID, testRunObject, {
                headers: {
                    "Content-Type": "application/json",
                    Cookie: sessionCookies,
                },
            });
            return addRunRequest.data;
        } catch (error) {
            logger(await error.response.data, true);
            console.error(await error.response.data);
        }
    }

    async updateTestRunResults(sessionCookies, runObjectID, resultsObject) {
        try {
            let addResultsRequest = await http.post(
                this.baseUrl + this.addResults + "/" + (await runObjectID),
                { results: await resultsObject },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Cookie: sessionCookies,
                    },
                }
            );
            return addResultsRequest;
        } catch (error) {
            logger(await error.response.data, true);
            console.error(await error.response.data);
        }
    }

    async getTestCaseByID(sessionCookies, testCaseID) {
        try {
            let testCaseData = await http.get(
                this.baseUrl + this.getTestCase + "/" + (await testCaseID),
                {
                    headers: {
                        "Content-Type": "application/json",
                        Cookie: await sessionCookies,
                    },
                }
            );
            return testCaseData;
        } catch (error) {
            logger(await error.response.data, true);
            console.error(await error.response.data);
        }
    }

}
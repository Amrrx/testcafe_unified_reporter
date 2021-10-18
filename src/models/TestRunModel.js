"use strict";
module.exports = class TestRunModel {
    constructor(suiteID, name, userID, case_ids, mileStoneID, description) {
       return {
          suite_id: suiteID,
          name: name + ' - ' + "Automated Run - " + Math.floor(Math.random() * 1000) ,
          assignedto_id: userID,
          refs: "",
          case_ids: case_ids,
          include_all: false,
          milestone_id: mileStoneID,
          description: description + " \n" + "Auto created run by Unified reporter v1.0",
       };
    }
 }
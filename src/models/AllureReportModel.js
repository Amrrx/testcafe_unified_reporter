"use strict";
module.exports = class allureReportInstance {
   constructor(startTime, endTime, totalTime, testStartTime, userAgents, passed, total, skipped, fixtures, warnings) {
      this.startTime = startTime
      this.endTime = endTime;
      this.totalTime = totalTime;
      this.testStartTime = testStartTime;
      this.userAgents = userAgents;
      this.passed = passed;
      this.total = total;
      this.skipped = skipped;
      this.fixtures = fixtures
      this.warnings = warnings;
   }

   toRequestPayload() {
      return {}
   }

}
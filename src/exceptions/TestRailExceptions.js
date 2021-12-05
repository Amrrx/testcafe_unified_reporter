class TestRailErrors {
  constructor(message) {
    this.message = message;
    this.name = "TestRail Error";
  }
}

class UnableToAuthenticate extends TestRailErrors {
  constructor(message) {
    let su = super(message);
    this.name = su.name + " - Authentication Error";
  }
}

class ProjectNotFound extends TestRailErrors {
  constructor(message) {
    super(message);
    this.name = super.name + " - Project Not Found";
  }
}

class SuiteNotFound extends TestRailErrors {
  constructor(message) {
    let su = super(message);
    this.name = su.name + " - Suite Not Found";
  }
}


class MiltestoneNotFound extends TestRailErrors {
  constructor(message) {
    let su = super(message);
    this.name = su.name + " - Miltestone Not Found";
  }
}

class TestCaseNotFound extends TestRailErrors {
  constructor(message) {
    let su = super(message);
    this.name = su.name + " - Testcase Not Found";
  }
}

class UserNotFound extends TestRailErrors {
  constructor(message) {
    let su = super(message);
    this.name = su.name + " - User Not Found";
  }
}

class UnableToPushNewRun extends TestRailErrors {
  constructor(message) {
    let su = super(message);
    this.name = su.name + " - Unable To Push New Run";
  }
}

class UnableToUpdateTestRun extends TestRailErrors {
  constructor(message) {
    let su = super(message);
    this.name = su.name + " - Unable To Update Test Run";
  }
}

class UnableToGenerateReport extends TestRailErrors {
  constructor(message) {
    let su = super(message);
    this.name = su.name + " - Unable To Generate Report";
  }
}

module.exports = {
  TestRailErrors, UnableToUpdateTestRun, UnableToPushNewRun, UserNotFound,
  TestCaseNotFound, MiltestoneNotFound, SuiteNotFound, ProjectNotFound, UnableToAuthenticate, UnableToGenerateReport
}
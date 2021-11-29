class JiraErrors{
    constructor(message) {
        this.message = message;
        this.name = "Jira Error"; 
      }
}

class UnableToAuthenticate extends JiraErrors{
    constructor(message) {
      let su = super(message);
        this.name = su.name + " - Authentication Error";
      }
}


class PushNewIssue extends JiraErrors{
    constructor(message) {
      let su = super(message);
        this.name = su.name + " - Push New Issue";
      }
}


class UpdateIssueAttachment extends JiraErrors{
    constructor(message) {
      let su = super(message);
        this.name = su.name + " - Update Issue Attachment";
      }
}

module.exports = {
  JiraErrors, UnableToAuthenticate, PushNewIssue, UpdateIssueAttachment
}
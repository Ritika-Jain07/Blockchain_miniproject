const EHRAccessAudit = artifacts.require("EHRAccessAudit");

module.exports = function (deployer) {
  deployer.deploy(EHRAccessAudit);
};
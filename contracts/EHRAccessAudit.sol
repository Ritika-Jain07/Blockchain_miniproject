// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract EHRAccessAudit {
    enum Role { NONE, PATIENT, DOCTOR, RESEARCHER, ADMIN }
    enum Purpose { NONE, TREATMENT, RESEARCH, EMERGENCY }

    struct AuditEvent {
        uint256 time;
        address user;
        Role role;
        uint256 recordId;
        Purpose purpose;
        bool granted;
        bytes32 recordHash;
    }

    address public owner;

    mapping(address => Role) public roles;
    mapping(uint256 => bytes32) public recordHashes;
    mapping(uint256 => bool) public researchConsent;

    AuditEvent[] public audits;

    event RoleAssigned(address indexed user, Role role);
    event RecordHashStored(uint256 indexed recordId, bytes32 hash);
    event ResearchConsentUpdated(uint256 indexed recordId, bool consent);
    event AccessLogged(address indexed user, uint256 indexed recordId, Purpose purpose, bool granted);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        roles[msg.sender] = Role.ADMIN;
    }

    function setRole(address user, Role role) external onlyOwner {
        roles[user] = role;
        emit RoleAssigned(user, role);
    }

    function storeRecordHash(uint256 recordId, bytes32 hash) external onlyOwner {
        recordHashes[recordId] = hash;
        emit RecordHashStored(recordId, hash);
    }

    function setResearchConsent(uint256 recordId, bool consent) external onlyOwner {
        researchConsent[recordId] = consent;
        emit ResearchConsentUpdated(recordId, consent);
    }

    function canAccess(address user, uint256 recordId, Purpose purpose) public view returns (bool) {
        Role r = roles[user];

        if (r == Role.ADMIN) return false;

        if (purpose == Purpose.EMERGENCY && r == Role.DOCTOR) return true;
        if (purpose == Purpose.TREATMENT && r == Role.DOCTOR) return true;

        if (purpose == Purpose.RESEARCH && r == Role.RESEARCHER) {
            return researchConsent[recordId];
        }

        return false;
    }

    function logAccess(uint256 recordId, Purpose purpose, bytes32 providedHash) external returns (bool granted) {
        granted = canAccess(msg.sender, recordId, purpose);

        bytes32 stored = recordHashes[recordId];
        if (stored != bytes32(0)) {
            require(providedHash == stored, "Hash mismatch (tamper detected)");
        }

        audits.push(AuditEvent({
            time: block.timestamp,
            user: msg.sender,
            role: roles[msg.sender],
            recordId: recordId,
            purpose: purpose,
            granted: granted,
            recordHash: providedHash
        }));

        emit AccessLogged(msg.sender, recordId, purpose, granted);
        return granted;
    }

    function auditCount() external view returns (uint256) {
        return audits.length;
    }

    function getAudit(uint256 i) external view returns (AuditEvent memory) {
        return audits[i];
    }
}
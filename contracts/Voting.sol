// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Voting {

  struct Election {
    mapping(address => bool) eligibleVoters;
    mapping(address => uint) registeredVoters;
    mapping(bytes32 => uint) votes;
    bytes32[] candidates;
    bool open; // if true, anybody can register to vote
  }

  Election[] public elections;
  uint constant MAX_LENGTH = 15;

  function createElection(address[] memory voterPool, bytes32[] memory candidates, bool open) public {
    elections.push(Election({candidates: candidates, open: open}));

    for(uint i = 0; i < voterPool.length; i++) {
      elections[elections.length - 1].eligibleVoters[voterPool[i]] = true;
    }
  }

  function registerToVote(uint i) public {
    require(i >= 0, "Election not available");
    require(i < elections.length, "Election not available");
    require(isEligibleToVote(i, msg.sender), "You cannot register to vote");
    require(elections[i].registeredVoters[msg.sender] == 0, "You already registered to vote");
    elections[i].registeredVoters[msg.sender] = 1;
  }

  function vote(uint i, bytes32 candidate) public {
    require(i >= 0, "Election not available");
    require(i < elections.length, "Election not available");
    require(!voted(i, msg.sender), "You have already voted");
    require(isRegisteredToVote(i, msg.sender), "You are not registered to vote");
    elections[i].registeredVoters[msg.sender] = 2;
    elections[i].votes[candidate]++;
  }

  function getElection(uint i) public view returns(bytes32[] memory, bool) {
    require(i >= 0, "Election not available");
    require(i < elections.length, "Election not available");
    return (elections[i].candidates, elections[i].open);
  }

  function isEligibleToVote(uint i, address voter) public view returns (bool) {
    return elections[i].open || elections[i].eligibleVoters[voter];
  }

  function isRegisteredToVote(uint i, address voter) public view returns (bool) {
    return elections[i].registeredVoters[voter] == 1;
  }

  function voted(uint i, address voter) public view returns (bool) {
    return elections[i].registeredVoters[voter] == 2;
  }

  function getNumberOfVotes(uint i, bytes32 candidate) public view returns (uint) {
    return elections[i].votes[candidate];
  }

}

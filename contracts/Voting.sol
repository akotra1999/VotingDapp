// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Voting {

  struct Election {
    mapping(address => bool) eligibleVoters;
    address[] voters;
    bool open; // if true, anybody can register to vote
  }

  Election[] public elections;

  function createElection(address[] memory voterPool, bool open) public {
    elections.push(Election({voters: new address[](0), open: open}));

    for(uint i = 0; i < voterPool.length; i++) {
      elections[elections.length - 1].eligibleVoters[voterPool[i]] = true;
    }
  }

  function registerToVote(uint i) public {
    require(i >= 0, "Election not available");
    require(i < elections.length, "Election not available");
    require(eligibleToVote(i, msg.sender), "You cannot register to vote");
    elections[i].voters.push(msg.sender);
  }

  function getElection(uint i) public view returns(address[] memory, bool) {
    require(i >= 0, "Election not available");
    require(i < elections.length, "Election not available");
    return (elections[i].voters, elections[i].open);
  }

  function eligibleToVote(uint i, address voter) public view returns (bool) {
    return elections[i].open || elections[i].eligibleVoters[voter];
  }
}

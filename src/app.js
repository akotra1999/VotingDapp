App = {

  load: async () => {

    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      let voting = await $.getJSON("Voting.json");
      let votingContract = new window.web3.eth.Contract(voting.abi, voting.networks["5777"].address);
      let numberOfElections = await votingContract.methods.getNumberOfElections().call();
      let $electionTemplate = $("#election_template");

      for (let i = numberOfElections - 1; i >= Math.max(0, numberOfElections - 3); i--) {
        let $newElectionTemplate = $electionTemplate.clone();
        let election = await votingContract.methods.getElection(i).call();
        App.loadElectionCard($newElectionTemplate, election, i);
        $("#recent_elections_list").append($newElectionTemplate);
        $newElectionTemplate.show();
      }

    } else {
      console.log("Can't find a Metamask account")
    }
  },

  search: async () => {

    // https://ethereum.org/en/developers/tutorials/set-up-web3js-to-use-ethereum-in-javascript/
    // https://blockchain.oodles.io/dev-blog/interacting-with-ethereum-smart-contracts-through-web3js-library/
    if (window.ethereum) {
      document.getElementById("search_result").style.display = "none";
      window.web3 = new Web3(window.ethereum);
      let voting = await $.getJSON("Voting.json");
      let votingContract = new window.web3.eth.Contract(voting.abi, voting.networks["5777"].address);
      let election = await votingContract.methods.getElection($("#search").val()).call();
      let $searchResult = $("#search_result");
      App.loadElectionCard($searchResult, election, $("#search").val());
      $searchResult.show();

    } else {
      console.log("Can't find a Metamask account")
    }
  },

  loadElectionCard: ($electionCard, electionData, electionID) => {
    let candidates = electionData[0].map(c => web3.utils.hexToAscii(c));
    let candidateString = "";

    if (candidates.length == 1) {
      candidateString = candidates[0];
    } else if (candidates.length == 2) {
      candidateString = candidates[0] + " and " + candidates[1];
    } else if (candidates.length != 0) {
      candidateString = candidates[0] + ", " + candidates[1] + ", etc.";
    }
    $electionCard.find("#candidates").html(candidateString);
    $electionCard.find("#election_id").html("#" + electionID);

    if (electionData[1]) {
      $electionCard.find("#open").html("Anybody can vote!");
    } else {
      $electionCard.find("#open").html("Click on register to check eligiblity.");
    }
    $electionCard.find("#title").html(electionData[2]);
  }
}

$(window).load(() => {
  App.load();
});

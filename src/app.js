App = {

  load: async () => {

    // https://ethereum.org/en/developers/tutorials/set-up-web3js-to-use-ethereum-in-javascript/
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);

      try {
        window.accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
      } catch (error) {
        console.log("User denied account access");
      }
      console.log(window.accounts[0]);
      let voting = await $.getJSON("Voting.json");
      window.votingContract = new window.web3.eth.Contract(voting.abi, voting.networks["5777"].address);
      let numberOfElections = await window.votingContract.methods.getNumberOfElections().call();
      let $electionTemplate = $("#election_template");

      for (let i = numberOfElections - 1; i >= Math.max(0, numberOfElections - 3); i--) {
        let $newElectionTemplate = $electionTemplate.clone();
        await App.loadElectionCard($newElectionTemplate, i, false, false);
        $("#recent_elections_list").append($newElectionTemplate);
        $newElectionTemplate.show();
      }
      let numberOfElectionsCreatedByUser =  await window.votingContract.methods.getNumberOfElectionsCreatedByUser(window.accounts[0]).call();
      console.log(numberOfElectionsCreatedByUser);

      for(let i = numberOfElectionsCreatedByUser - 1; i >= Math.max(0, numberOfElectionsCreatedByUser - 3); i--) {
        let $newElectionTemplate = $electionTemplate.clone();
        console.log("Testing load");
        let electionID = await window.votingContract.methods.postedElections(window.accounts[0], i).call();
        console.log("Testing load 2");
        await App.loadElectionCard($newElectionTemplate, electionID, false, true);
        $("#elections_created_by_user_list").append($newElectionTemplate);
        $newElectionTemplate.show();
      }


    } else {
      console.log("Can't find Metamask")
    }
  },

  search: async () => {


    // https://blockchain.oodles.io/dev-blog/interacting-with-ethereum-smart-contracts-through-web3js-library/
    $("#searchResult").html("");
    let $electionTemplate = $("#election_template");
    let $newElectionTemplate = $electionTemplate.clone();
    await App.loadElectionCard($newElectionTemplate, $("#search").val(), true, false);
    $("#searchResult").html($newElectionTemplate);
    $newElectionTemplate.show();
  },

  loadElectionCard: async ($electionCard, electionID, searchResult, electionCreatedByUser) => {
    let electionData = await window.votingContract.methods.getElection(electionID).call();
    let candidates = electionData[0].map(c => web3.utils.hexToAscii(c));
    let candidateString = "";

    for (let i = 0; i < candidates.length; i++) {
      $electionCard.find("#candidates").append("<option>" + candidates[i] + "</option>");
    }
    $electionCard.find("#election_id").html("#" + electionID);

    if (electionData[1]) {
      $electionCard.find("#open").html("Anybody can vote!");
    } else {
      $electionCard.find("#open").html("Only some can vote.");
    }
    $electionCard.find("#title").html(electionData[2]);
    let eligible = await window.votingContract.methods.isEligibleToVote(electionID, window.accounts[0]).call();

    if (eligible) {
      $electionCard.find("#vote_button").attr("class", "btn btn-primary");
      $electionCard.find("#vote_button").prop("disabled", false);
    } else {
      $electionCard.find("#vote_button").attr("class", "btn btn-primary disabled");
      $electionCard.find("#vote_button").prop("disabled", true);
    }
    $electionCard.find("#vote_form").attr("onSubmit", "App.vote(" + electionID + ", " + searchResult + ", " + electionCreatedByUser + "); return false;");
    let voted = await window.votingContract.methods.voted(electionID, window.accounts[0]).call();

    $electionCard.find("#results").empty();
    if (voted) {

      for (let i = 0; i < candidates.length; i++) {
        let voteCount = await window.votingContract.methods.getNumberOfVotes(electionID, web3.utils.asciiToHex(candidates[i])).call();
        $electionCard.find("#results").append('<li class="list-group-item font-weight-bold">' + candidates[i] + " - " + voteCount + ' votes</li>');
      }
      $electionCard.find("#vote_form").hide();
      $electionCard.find("#results").show();
    } else {
      $electionCard.find("#vote_form").show();
      $electionCard.find("#results").hide();
    }

    if (searchResult) {
      $electionCard.find("#vote_form").attr("id", "vote_form_" + electionID + "_s");
      $electionCard.find("#candidates").attr("id", "candidates_" + electionID + "_s");
    } else if(electionCreatedByUser) {
      $electionCard.find("#vote_form").attr("id", "vote_form_" + electionID + "_r");
      $electionCard.find("#candidates").attr("id", "candidates_" + electionID + "_r");
    } else {
      $electionCard.find("#vote_form").attr("id", "vote_form_" + electionID);
      $electionCard.find("#candidates").attr("id", "candidates_" + electionID);
    }

  },

  vote: async (electionID, searchResult, electionCreatedByUser) => {
    let candidate = "";

    if (searchResult) {
      candidate = $("#candidates_" + electionID + "_s").val();
    } else if (electionCreatedByUser) {
      candidate = $("#candidates_" + electionID + "_r").val();
    } else {
      candidate = $("#candidates_" + electionID).val();
    }
    await window.votingContract.methods.vote(electionID, web3.utils.asciiToHex(candidate)).send({from: window.accounts[0]});
    $("#vote_form_" + electionID).hide();
    $("#vote_form_" + electionID + "_s").hide();
    $("#vote_form_" + electionID + "_r").hide();
  },

  postElection: async () => {
    let name = $("#election_form").find("#name").val();
    let open = false;

    if($("#election_form").find("#open").val() === "Allow everybody to vote") {
      open = true;
    }
    let candidates = $("#election_form").find("#candidates").val().split(", ");
    candidates = candidates.map(c => web3.utils.asciiToHex(c));
    let voters = $("#election_form").find("#voters").val().split(", ");

    if(voters[0] === "") {
      voters = [];
    }

    await window.votingContract.methods.createElection(voters, candidates, open, name).send({from: window.accounts[0]});
    $("#toast").toast("show");
  }
}

$(document).ready(() => {
  App.load();
});

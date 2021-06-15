App = {

  search: async () => {


    // https://ethereum.org/en/developers/tutorials/set-up-web3js-to-use-ethereum-in-javascript/
    // https://blockchain.oodles.io/dev-blog/interacting-with-ethereum-smart-contracts-through-web3js-library/
    if (window.ethereum) {
      document.getElementById("candidates").innerHTML = "";
      document.getElementById("open").innerHTML = "";
      window.web3 = new Web3(window.ethereum);
      let voting = await $.getJSON("Voting.json");
      let votingContract = new window.web3.eth.Contract(voting.abi, voting.networks["5777"].address);
      let election = await votingContract.methods.getElection($("#search").val()).call();
      document.getElementById("candidates").innerHTML = election[0].map(c => web3.utils.hexToAscii(c));
      document.getElementById("open").innerHTML = election[1];

    } else {
      console.log("Can't find a Metamask account")
    }
  }
}

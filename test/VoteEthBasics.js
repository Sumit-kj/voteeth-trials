var ChainList = artifacts.require("./ChainList.sol");

// test suite
contract('ChainList', function(accounts){
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName1 = "article 1";
  var articleDescription1 = "party 1";
  var articlePrice1 = 10;
  var articleName2 = "article 2";
  var articleDescription2 = "party 2";
  var articlePrice2 = 20;
  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  it("should be initialized with empty values", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, "number of candidates must be zero");
      return chainListInstance.getCandidateForVoting();
    }).then(function(data){
      assert.equal(data.length, 0, "there shouldn't be any candidate for voting");
    });
  });

  // add a candidate first
  it("should let us vote to first candidate", function() {
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.addACandidate(
        articleName1,
        articleDescription1,
        web3.toWei(articlePrice1, "ether"),
        {from: seller}
      );
    }).then(function(receipt){
      // check event
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellArticles", "event should be LogSellArticles");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "candidate adder must be " + seller);
      assert.equal(receipt.logs[0].args._name, articleName1, "candidate name must be " + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "voting price must be " + web3.toWei(articlePrice1, "ether"));

      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data, 1, "number of candidates must be one");

      return chainListInstance.getCandidateForVoting();
    }).then(function(data) {
      assert.equal(data.length, 1, "there must be one candidate for voting");
      assert.equal(data[0].toNumber(), 1, "article id must be 1");

      return chainListInstance.articles(data[0]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1], seller, "adder must be " + seller);
      assert.equal(data[2], 0x0, "voter's list must be empty");
      assert.equal(data[3], articleName1, "article name must be " + articleName1);
      assert.equal(data[4], articleDescription1, "article description must be " + articleDescription1);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice1, "ether"), "voting price must be " + web3.toWei(articlePrice1, "ether"));
    });
  });

  // add a second candidate
  it("should let us add second candidate", function() {
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.addACandidate(
        articleName2,
        articleDescription2,
        web3.toWei(articlePrice2, "ether"),
        {from: seller}
      );
    }).then(function(receipt){
      // check event
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellArticles", "event should be LogSellArticles");
      assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be 2");
      assert.equal(receipt.logs[0].args._seller, seller, "adder must be " + seller);
      assert.equal(receipt.logs[0].args._name, articleName2, "candidate name must be " + articleName2);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice2, "ether"), "voting price must be " + web3.toWei(articlePrice2, "ether"));

      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data, 2, "number of candidates must be two");

      return chainListInstance.getCandidateForVoting();
    }).then(function(data) {
      assert.equal(data.length, 2, "there must be two candidates for voting");
      assert.equal(data[1].toNumber(), 2, "article id must be 2");

      return chainListInstance.articles(data[1]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 2, "article id must be 2");
      assert.equal(data[1], seller, "adder must be " + seller);
      assert.equal(data[2], 0x0, "voter's list must be empty");
      assert.equal(data[3], articleName2, "article name must be " + articleName2);
      assert.equal(data[4], articleDescription2, "article description must be " + articleDescription2);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice2, "ether"), "voting price must be " + web3.toWei(articlePrice2, "ether"));
    });
  });

  // cast vote to first candidate
  it("should let us cast a vote", function(){
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      // record balances of seller and buyer before the buy
      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();
      return chainListInstance.castAVote(1, {
        from: buyer,
        value: web3.toWei(articlePrice1, "ether")
      });
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogBuyArticles", "event should be LogBuyArticles");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "article id must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "adder must be " + seller);
      assert.equal(receipt.logs[0].args._buyer, buyer, "vomust be " + buyer);
      assert.equal(receipt.logs[0].args._name, articleName1, "candidate name must be " + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event voting price must be " + web3.toWei(articlePrice1, "ether"));

      // record balances of buyer and seller after the buy
      sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      // check the effect of buy on balances of buyer and seller, accounting for gas
      assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice1, "seller should have earned " + articlePrice1 + " ETH");
      assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1, "buyer should have spent " + articlePrice1 + " ETH");

      return chainListInstance.getCandidateForVoting();
    }).then(function(data){
      assert.equal(data.length, 2, "there should now be all the candidates for voting");
      assert.equal(data[0].toNumber(), 1, "article 1 should be the also present for voting");

      return chainListInstance.getNumberOfArticles();
    }).then(function(data){
      assert.equal(data.toNumber(), 2, "there should still be 2 articles in total");
    });
  });
});

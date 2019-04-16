// contract to be tested
var ChainList = artifacts.require("./ChainList.sol");

// test suite
contract("ChainList", function(accounts){
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName = "article 1";
  var articleDescription = "Description for article 1";
  var articlePrice = 10;

  // no candidate  to cast vote
  it("should throw an exception if voter tries to vote when there are no candidates to vote yet", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.castAVote(1, {
        from: buyer,
        value: web3.toWei(articlePrice, "ether")
      });
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, "number of articles must be 0");
    });
  });

  // Cast a vote to non-existant candidate
  it("should throw an exception if voter tries to vote to non-existant candidate", function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.addACandidate(articleName, articleDescription, web3.toWei(articlePrice, "ether"), { from: seller });
    }).then(function(receipt){
      return chainListInstance.castAVote(2, {from: seller, value: web3.toWei(articlePrice, "ether")});
    }).then(assert.fail)
    .catch(function(error) {
      assert(true);
    }).then(function() {
      return chainListInstance.articles(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], articleName, "article name must be " + articleName);
      assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
    });
  });

  // admin casts a vote
  // it("should throw an exception if admin tries to vote", function() {
  //   return ChainList.deployed().then(function(instance){
  //     chainListInstance = instance;
  //
  //     return chainListInstance.castAVote(1, {from: seller, value: web3.toWei(articlePrice, "ether")});
  //   }).then(assert.fail)
  //   .catch(function(error){
  //     assert(true);
  //   }).then(function() {
  //     return chainListInstance.articles(1);
  //   }).then(function(data) {
  //     assert.equal(data[0].toNumber(), 1, "article id must be 1");
  //     assert.equal(data[1], seller, "seller must be " + seller);
  //     assert.equal(data[2], 0x0, "buyer must be empty");
  //     assert.equal(data[3], articleName, "article name must be " + articleName);
  //     assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
  //     assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
  //   });
  // });
  //
  // // incorrect value
  // it("should throw an exception if voter tries to vote for a different value", function() {
  //   return ChainList.deployed().then(function(instance){
  //     chainListInstance = instance;
  //     return chainListInstance.castA(1, {from: buyer, value: web3.toWei(articlePrice + 1, "ether")});
  //   }).then(assert.fail)
  //   .catch(function(error){
  //     assert(true);
  //   }).then(function() {
  //     return chainListInstance.articles(1);
  //   }).then(function(data) {
  //     assert.equal(data[0].toNumber(), 1, "article id must be 1");
  //     assert.equal(data[1], seller, "seller must be " + seller);
  //     assert.equal(data[2], 0x0, "buyer must be empty");
  //     assert.equal(data[3], articleName, "article name must be " + articleName);
  //     assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
  //     assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
  //   });
  // });


});

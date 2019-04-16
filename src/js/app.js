App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  balance:0x0,
  loading: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // initialize web3
    if(typeof web3 !== 'undefined') {
      //reuse the provider of the Web3 object injected by Metamask
      App.web3Provider = web3.currentProvider;
    } else {
      //create a new provider and plug it directly into our local node
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    App.displayAccountInfo();

    return App.initContract();
  },

  defineAdmin: function(){
    web3.eth.getAccounts(function(err,accounts){
      console.log(err);
      console.log(accounts);
    })
  },

  displayAccountInfo: function() {
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        App.defineAdmin();
        $('#account').text(account);
        web3.eth.getBalance(account, function(err, balance) {
          if(err === null) {
            $('#accountBalance').text(web3.fromWei(balance, "ether") + " ETH");
            // $("#articleTemplate").find('.btn-buy').hide();
            App.balance = balance;
          }
        })
      }
    });
  },

  initContract: function() {
    $.getJSON('ChainList.json', function(chainListArtifact) {
      // get the contract artifact file and use it to instantiate a truffle contract abstraction
      App.contracts.ChainList = TruffleContract(chainListArtifact);
      // set the provider for our contracts
      App.contracts.ChainList.setProvider(App.web3Provider);
      // listen to events
      App.listenToEvents();
      // retrieve the article from the contract
      return App.reloadArticles();
    });
  },

  reloadArticles: function() {
    // avoid reentry
    if(App.loading) {
      return;
    }
    App.loading = true;

    // refresh account information because the balance might have changed
    App.displayAccountInfo();

    var chainListInstance;

    App.contracts.ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.getCandidateForVoting();
    }).then(function(articleIds) {
      // retrieve the article placeholder and clear it
      $('#articlesRow').empty();

      for(var i = 0; i < articleIds.length; i++) {
        var articleId = articleIds[i];
        chainListInstance.articles(articleId.toNumber()).then(function(article){
          App.displayArticle(article[0], article[1], article[3], article[4], article[6]);
        });
      }
      App.loading = false;
    }).catch(function(error) {
      console.error(error.message);
      App.loading = false;
    });
  },

  displayArticle: function(id, seller, name, description, count) {
    var articlesRow = $('#articlesRow');

    var etherPrice = web3.fromWei(60, "ether");

    var articleTemplate = $("#articleTemplate");
    articleTemplate.find('.panel-title').text(name);
    articleTemplate.find('.article-description').text(description);
    articleTemplate.find('.article-price').text(etherPrice + " ETH");
    articleTemplate.find('.article-count').text(count);
    articleTemplate.find('.btn-buy').attr('data-id', id);
    articleTemplate.find('.btn-buy').attr('data-value', etherPrice);

    var articleTools = $("#article-tools");
    var panelTitle  =articleTools.find('.panel-title');

    // voter
    if (seller == App.account) {
      articleTemplate.find('.article-seller').text("You");
      articleTemplate.find('.btn-buy').hide();
      $('#articles-tools').show();
    } else {
      articleTemplate.find('.article-seller').text(seller);
      articleTemplate.find('.btn-buy').show();
      $('#articles-tools').hide();
    }

    // add this new candidate
    articlesRow.append(articleTemplate.html());
  },

  addACandidate: function() {
    // retrieve the detail of the candidate
    var _article_name = $('#article_name').val();
    var _description = $('#article_description').val();
    var _price = web3.toWei(60, "ether");

    console.log("Cast Vote Price: "+_price);

    if((_article_name.trim() == '') || (_price == 0)) {
      // none to vote, no candidates
      return false;
    }

    App.contracts.ChainList.deployed().then(function(instance) {
      return instance.addACandidate(_article_name, _description, 60000000000000000, {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {

    }).catch(function(err) {
      // console.error(err.message);
    });
  },

  // listen to events triggered by the contract
  listenToEvents: function() {
    App.contracts.ChainList.deployed().then(function(instance) {
      instance.LogSellArticles({}, {}).watch(function(error, event) {
        if (!error) {
          $("#events").append('<li class="list-group-item">' + event.args._name + ' is now a candidate</li>');
        } else {
          console.error(error);
        }
        App.reloadArticles();
      });

      instance.LogBuyArticles({}, {}).watch(function(error, event) {
        if (!error) {
          $("#events").append('<li class="list-group-item">' + event.args._buyer + ' voted ' + event.args._name + '</li>');
        } else {
          console.error(error);
        }
        App.reloadArticles();
      });
    });
  },

  castAVote: function() {
    event.preventDefault();

    // retrieve the candidates
    var _articleId = $(event.target).data('id');
    var _price_wei1 = parseFloat($(event.target).data('value'));
    var _price_wei = web3.toWei(_price_wei1, "ether");
    var _price = web3.toWei(_price_wei, "ether");

    console.log("Price Wei"+_price_wei);
    console.log("Price Eth"+_price);
    console.log("Account "+App.account);
    console.log("ID "+_articleId);

    App.contracts.ChainList.deployed().then(function(instance){
      return instance.castAVote(_articleId, {
        from: App.account,
        value: _price,
        gas: 5000000
      });
    }).catch(function(error) {
      console.error(error);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

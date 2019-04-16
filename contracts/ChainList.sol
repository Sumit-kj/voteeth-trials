pragma solidity ^0.4.15;
contract ChainList{

  struct Article{
    uint id;
    address seller;
    address buyer;
    string name;
    string party;
    uint256 price;
    uint256 count;
  }

  modifier onlyAdmin(){
    require(msg.sender == admin);
    _;
  }

  address admin;

  mapping(uint => Article) public articles;
  uint articleCounter;

//Add a candidate
  event LogSellArticles(
    uint indexed _id,
    address indexed _seller,
    string _name,
    uint256 _price
  );

  //cast a vote
  event LogBuyArticles(
    uint indexed _id,
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price
  );

  function ChainList() public {
    admin == msg.sender;
  }

  function addACandidate(string _name, string _party, uint256 _price) public {
    articleCounter++;

    articles[articleCounter] = Article(
      articleCounter,
      msg.sender,
      0x0,
      _name,
      _party,
      _price,
      0x0
    );

    LogSellArticles(articleCounter, msg.sender, _name, _price);
  }

  function getNumberOfArticles() public view returns (uint){
    return articleCounter;
  }

  function getCandidateForVoting() public view returns (uint[]){
    uint[] memory articleIds = new uint[](articleCounter);
    uint numberOfCandidatesForVoting = 0;
    uint i=0;

    for(i =1; i<=articleCounter; i++){
        articleIds[numberOfCandidatesForVoting] = articles[i].id;
        numberOfCandidatesForVoting++;
    }
    return articleIds;
  }


  function castAVote(uint _id) payable public {
    require(articleCounter > 0);
    require(_id > 0 && _id <= articleCounter);
    Article storage article = articles[_id];

    article.buyer = msg.sender;
    article.seller.transfer(msg.value);
    article.count++;
    LogBuyArticles(_id, article.seller, article.buyer, article.name, article.price);
  }
}

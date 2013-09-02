// A keyword threshold based optimization algorithm.
// It checks the performance of a keyword
// and updates its bid accordingly.
// Poor performing "Enabled" keywords will be paused.

// The campaigns to which the algorithm is applied to.
var campaigns={
  'Search.Brand': true  // true is just a pseudovalue
};
// Start and end date in for the performance data of a campaign.
var startDate='20130712';
var endDate = '20130731';

function main() {
  var keywords=getKeywords();
  applyBiddingStrategy(keywords);
}
// get all "enabled" keywords for all the "enabled" adwords campaigns specified in the "campaigns" object.
function getKeywords(){    
  var keywords=[];
  var campaignIt = AdWordsApp.campaigns()
  .withCondition("Status = ENABLED ")
  .get();
  while(campaignIt.hasNext()){
    var campaign = campaignIt.next();
    var name = campaign.getName();
    if(campaigns[name]){  
      var keywordIt = campaign.keywords()
      .withCondition("Status = ENABLED")
      .get();
      while(keywordIt.hasNext()){
        var keyword = keywordIt.next();
        keywords.push(keyword);   
      }
    }
  }
  return keywords;
}
// Apply the threshold based optimization algorithm for each keyword.
function applyBiddingStrategy(keywords){
  for(var i=0;i<keywords.length;i++){
    var keyword = keywords[i];
    var stats = keyword.getStatsFor(startDate,endDate);
    checkConversions(keyword,stats);
  }
}

function checkConversions(keyword,stats){
  var conversions = stats.getConversions();
  var cost = stats.getCost();
  if(conversions==0){
    checkCost(keyword,cost);
  }
  else if(0 < conversions && conversions <= 4){  
    var cpa = cost/ conversions;
    checkCPALower(keyword,cpa);
  }
  else{
    var cpa = cost/ conversions;
    checkCPAUpper(keyword,cpa);
  }
}

function checkCPALower(keyword,cpa){
  if(cpa<6){
    changeBid(keyword,0.15);
  }
  else if (6<=cpa && cpa<7.5){
    // nothing to do
  }
  else if(7.5<= cpa && cpa<=10){
    changeBid(keyword,-0.2);
  }
  else{
    changeBid(keyword,-0.25);
  }
}

function checkCPAUpper(keyword,cpa){
  if(cpa<6){
    changeBid(keyword,0.2);
  }
  else if (6<=cpa && cpa<7.5){
    // nothing to do 
  }
  else if(7.5<= cpa && cpa<=10){
    changeBid(keyword,-0.2);
  }
  else{
    changeBid(keyword,-0.3);
  }
}

function checkCost(keyword,cost){
  if(cost<10){
    // nothing to do
  }
  else if(10<=cost && cost<=18){
    changeBid(keyword,-0.3);
  }
  else{
     pause(keyword);
  }
}
// Change default keyword bid by "cpc" units.
function changeBid(keyword,cpc){     
  var keywordCpc = keyword.getMaxCpc();
  keywordCpc = keywordCpc + keywordCpc * cpc;
  keywordCpc = Number(keywordCpc.toFixed(4));
  keyword.setMaxCpc(keywordCpc);
  Logger.log('Changing keyword: '+keyword.getId()+' '+keyword.getText()+' from:'+keyword.getMaxCpc()+' to:'+keywordCpc);
}

function pause(keyword){
  keyword.pause();
  Logger.log('Pausing keyword: '+keyword.getId()+' '+keyword.getText());
}
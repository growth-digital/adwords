// An ad group threshold based optimization algorithm.
// It checks the performance of an ad group 
// and updates its bid accordingly.
// Poor performing "Enabled" ad groups will be paused.

// The campaigns to which the algorithm is applied to.
var campaigns={
  'GDN.Remarketing': true  // true is just a pseudovalue
};

// Start and end date in for the performance data of a campaign.
var startDate='20130712';
var endDate = '20130731';

function main() {
  var adGroups=getAdGroups();
  applyBiddingStrategy(adGroups);
}

// get all "enabled" ad groups for all the "enabled" adwords campaigns specified in the "campaigns" object.
function getAdGroups(){    
  var adGroups=[];
  var campaignIt = AdWordsApp.campaigns()
  .withCondition("Status = ENABLED ")
  .get();
  while(campaignIt.hasNext()){
    var campaign = campaignIt.next();
    var name = campaign.getName();
    if(campaigns[name]){   
      var adGroupIt = campaign.adGroups()
      .withCondition("Status = ENABLED")
      .get();
      while(adGroupIt.hasNext()){
        var adGroup = adGroupIt.next();
        adGroups.push(adGroup);   
      }
    }
  }
  return adGroups;
}

// Apply the threshold based optimization algorithm for each ad group.
function applyBiddingStrategy(adGroups){
  for(var i=0;i<adGroups.length;i++){
    var adGroup = adGroups[i];
    var stats = adGroup.getStatsFor(startDate,endDate);
    checkConversions(adGroup,stats); 
  }
}

function checkConversions(adGroup,stats){
  var conversions = stats.getConversions();
  var cost = stats.getCost();
  if(conversions==0){
    checkCost(adGroup,cost);
  }
  else if(0 < conversions && conversions <= 4){   // den einai redundant to "0<= conversions"?
    var cpa = cost/ conversions;
    checkCPALower(adGroup,cpa);
  }
  else{
    var cpa = cost/ conversions;
    checkCPAUpper(adGroup,cpa);
  }
}

function checkCPALower(adGroup,cpa){
  if(cpa<6){
    changeBid(adGroup,0.15);
  }
  else if (6<=cpa && cpa<7.5){
    // nothing to do
  }
  else if(7.5<= cpa && cpa<=10){
    changeBid(adGroup,-0.2);
  }
  else{
    changeBid(adGroup,-0.25);
  }
}

function checkCPAUpper(adGroup,cpa){
  if(cpa<6){
    changeBid(adGroup,0.2);
  }
  else if (6<=cpa && cpa<7.5){
    // nothing to do 
  }
  else if(7.5<= cpa && cpa<=10){
    changeBid(adGroup,-0.2);
  }
  else{
    changeBid(adGroup,-0.3);
  }
}

function checkCost(adGroup,cost){
  if(cost<10){
    // nothing to do
  }
  else if(10<=cost && cost<=18){
    changeBid(adGroup,-0.3);
  }
  else{
    pause(adGroup);
  }
}

// Change default ad group bid by "cpc" units.
function changeBid(adGroup,cpc){    
  var adGroupCpc = adGroup.getKeywordMaxCpc();
  adGroupCpc = adGroupCpc + adGroupCpc * cpc;
  adGroupCpc = Number(adGroupCpc.toFixed(4));   // set precision
  adGroup.setKeywordMaxCpc(adGroupCpc);
  Logger.log('Changing adGroup: '+adGroup.getId()+' '+adGroup.getName()+' from:'+adGroup.getKeywordMaxCpc()+' to:'+adGroupCpc);
}


function pause(adGroup){
  adGroup.pause();
  Logger.log('Pausing adGroup:'+adGroup.getName());
}
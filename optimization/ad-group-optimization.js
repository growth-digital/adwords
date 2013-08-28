/*
Copyright (c) 2013, Growth
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met: 

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer. 
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution. 

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


// An ad group threshold based optimization algorithm.
// It checks the performance of an ad group 
// and updates its bid accordingly.
// Poor performing "Enabled" ad groups will be paused.

// Used for logging the messages to a spreadsheet
var SPREADSHEET_LOG_URL= 'some_spreadsheet_url';
var SCRIPT_NAME ='Name of the Script';
var ACCOUNT='Name of the account';

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
    var msg='Pausing adGroup: '+adGroup.getName();
    Logger.log(msg);
    log(msg);
    adGroup.pause();
  }
}

// Change default ad group bid by "cpc" units.
function changeBid(adGroup,cpc){    
  var adGroupCpc = adGroup.getKeywordMaxCpc();
  adGroupCpc = adGroupCpc + adGroupCpc * cpc;
  adGroupCpc = Number(adGroupCpc.toFixed(4));   // set precision
  var msg='Changing adGroup cpc: '+adGroup.getName()+' from:'+adGroup.getKeywordMaxCpc()+' to:'+adGroupCpc;
  Logger.log(msg);
  log(msg);
  adGroup.setKeywordMaxCpc(adGroupCpc);
}

// Log the messages to a spreadsheet
function log(msg){
  var spreadsheet=SpreadsheetApp.openByUrl(SPREADSHEET_LOG_URL);
  var sheet=spreadsheet.getActiveSheet();
  var range = sheet.getRange(sheet.getLastRow()+1,1,1,4);
  var formattedDate = Utilities.formatDate(new Date(), "GMT+3", "yyyy-MM-dd");
  range.setValues([[formattedDate,ACCOUNT,SCRIPT_NAME,msg]]);
}
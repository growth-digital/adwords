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

// Gets all of the positive keywords for a specified ad group in a specified campaign
// and adds them as exact negative keywords in the other ad groups of the same campaign.

var SPREADSHEET_LOG_URL= 'SPREADSHEET_URL';
var SCRIPT_NAME ='Adgroup negative keywords';
var ACCOUNT='ACCOUNT_NAME';

var campaignName='';

var adGroupName='';

var adGroups={};

function main() {
  fillAdGroups();
  var keywords=getPositiveKeywords();
  format(keywords);
  keywords=removeDuplicates(keywords);
  addNegativeKeywords(keywords);
}

function fillAdGroups(){
  var adGroupIt=AdWordsApp
  .adGroups()
  .withCondition('CampaignName = "'+campaignName+'"')
  .get();
  while(adGroupIt.hasNext()){
    var adGroup=adGroupIt.next();
    adGroups[adGroup.getName()]=adGroup;
  }
}

function getPositiveKeywords(){
  var positiveKeywords=[];
  var adGroup=adGroups[adGroupName];
  var keywords=adGroup.keywords().get();
  while(keywords.hasNext()){
    var keyword=keywords.next();
    var text=keyword.getText();
    if(text.charAt(0) != '-'){
      positiveKeywords.push(text);
    }
  }
  return positiveKeywords;
}

function format(keywords){
  for(var i=0;i<keywords.length;i++){
    var keyword=keywords[i];
    // change the keyword to exact match 
    if(keyword.charAt(0) != '['){
      if(keyword.charAt(0) == '"'){
        keyword=setCharAt(keyword,0,'[');
        keyword=setCharAt(keyword,keyword.length-1,']');
      }
      else{
        keyword='['+keyword+']';
      }
    }
    // change the keyword from positive to negative
    keyword='-'+keyword;
    keywords[i]=keyword;
  }
}

function setCharAt(str,index,chr) {
  if(index > str.length-1) return str;
  return str.substr(0,index) + chr + str.substr(index+1);
}

function removeDuplicates(keywords){
  map = {};
  for (var i = 0; i < keywords.length; i++) {
    map[keywords[i]] = keywords[i];
  }
  newKeywords = [];
  for (var key in map) {
    newKeywords.push(key);
  }
  return newKeywords;
}

function addNegativeKeywords(keywords){
  for(var name in adGroups){
    if(name != adGroupName){
      var adGroup=adGroups[name];
      for(var i=0;i<keywords.length;i++){
        var keyword=keywords[i];
        adGroup.createKeyword(keyword);
        var msg='Adding keyword: '+keyword+' to adGroup: "'+adGroup.getCampaign().getName()+'"  "'+adGroup.getName()+'"';
        Logger.log(msg);
      }
    }
  }
}

function log(msg){
  var spreadsheet=SpreadsheetApp.openByUrl(SPREADSHEET_LOG_URL);
  var sheet=spreadsheet.getActiveSheet();
  var range = sheet.getRange(sheet.getLastRow()+1,1,1,4);
  var formattedDate = Utilities.formatDate(new Date(), "GMT+3", "yyyy-MM-dd");
  range.setValues([[formattedDate,ACCOUNT,SCRIPT_NAME,msg]]);
}
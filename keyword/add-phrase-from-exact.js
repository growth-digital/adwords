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

// Gets the "exact" keywords of the specified campaigns (1) or the "exact" keywords from all of the account (2)
// in which the script is executed, creates the same text "phrase" keywords and adds them to their corresponding
// ad groups with a bid 30% lower than the corresponding "exact" keyword bid. 

// If execAll is false then execute (1) else execute (2).
var execAll= false;

// Works only when execAll=false
var campaigns={
  'CAMPAIGN_NAME' :true
};

function main() {
  var adGroups=getAdGroups();
  for(var i=0;i<adGroups.length;i++){
    var adGroup = adGroups[i];
    var keywords = adGroup.keywords();
    var exactKeywords=[];
    var phraseTexts={}; // used for checking duplicate "PHRASE" match type keywords
    fillKeywords(keywords,exactKeywords,phraseTexts);
    var phraseTextToExactMap=mapPhraseTextToExact(exactKeywords);
    for(var phraseKeywordText in phraseTextToExactMap){
      if(!phraseTexts[phraseKeywordText]){
        var exactKeyword = phraseTextToExactMap[phraseKeywordText];
        var bid = exactKeyword.getMaxCpc()*0.7;
        adGroup.createKeyword(phraseKeywordText,bid);
      }
    }
  }
}

//Get all adGroups (from the specified campaigns or from all of the account)
function getAdGroups(){
  var adGroups=[];
  if(execAll){
    var campaignIt=AdWordsApp
    .campaigns('Status = ENABLED')
    .get();
    
    while(campaignIt.hasNext()){
      var campaign = campaignIt.next();
      var campaignAdGroups = campaign.
      adGroups().
      withCondition('Status = ENABLED').
      get(); 
      while(campaignAdGroups.hasNext()){
        var adGroup=campaignAdGroups.next();
        adGroups.push(adGroup);
      }  
    }
  }
  else{
    for(var campaign in campaigns){
      var adGroupIt=AdWordsApp
      .adGroups()
      .withCondition("CampaignName = '"+campaign+"'")
      .get();
      if(!adGroupIt.hasNext()){
        throw 'Could not find campaign: '+campaign;
      }
      while(adGroupIt.hasNext()){
        adGroups.push(adGroupIt.next());
      }
    }
  }
  return adGroups;
}

// For all of the enabled keywords for an adGroup add the keyword object to
// the exactKeywords array if its match type is "EXACT" or add the keyword name
// to the phraseTexts object if its match type is "PHRASE".
function fillKeywords(keywords,exactKeywords,phraseTexts){
  var keywordIt=keywords.get();
  while(keywordIt.hasNext()){
    var keyword = keywordIt.next();
    var text= keyword.getText();
    if(keyword.getMatchType() == 'PHRASE' ){
      phraseTexts[text]=true;
    }
    else if (keyword.getMatchType() == 'EXACT' ){
      exactKeywords.push(keyword);
    }
  }
}

// Returns an object where its keys are the "PHRASE" match type keyword names created from
// the exact keyword objects and its values are the "EXACT" match type keyword objects.
function mapPhraseTextToExact(exactKeywords){
  var mappedKeywords={};
  for(var i=0;i<exactKeywords.length;i++){
    var exactKeyword=exactKeywords[i];
    var phraseKeywordText= createPhaseKeywordText(exactKeyword);
    mappedKeywords[phraseKeywordText]=exactKeyword;
  }
  return mappedKeywords;
}

// Create a "PHRASE" match type keyword name from the corresponding "EXACT" match type
// keyword object.
function createPhaseKeywordText(exactKeyword){
  var phraseKeywordText;
  phraseKeywordText=setCharAt(exactKeyword.getText(),0,'"');
  phraseKeywordText=setCharAt(phraseKeywordText,phraseKeywordText.length-1,'"');
  return phraseKeywordText;
}

function setCharAt(str,index,chr) {
  if(index > str.length-1) return str;
  return str.substr(0,index) + chr + str.substr(index+1);
}

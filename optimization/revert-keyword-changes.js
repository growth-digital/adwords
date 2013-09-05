// Reverts the keywords that were modified from a budget optimization script.
// The keywords modified need to be stored in the first column of a spreadsheet in the following formats:
// If the keyword is paused: "Pausing keyword: {id} {name}"
// If the keyword maxCPC is changed: "Changing keyword: {id} {name} from:{before-value} to:{after-value}"
// Each change needs to be in a different row.
// The spreadsheet in which the log messages of the modified keywords are stored.
var SPREADSHEET_REVERT_KEYWORDS_URL = 'URL';

var campaigns = {
    'Some Campaign': true
};

// Stores all of the to be reverted keywords
var toRevert = [];

function main() {
    var keywords = getKeywords();
    fillRevert();
    for (var i = 0; i < toRevert.length; i++) {
        var obj = toRevert[i];
        var keyword = keywords[obj.id];
        if (keyword) {
            if (obj.command == 'pause') {
                revertPause(keyword);
            } else {
                revertChange(keyword, obj.before);
            }
        } else {
            Logger.log('Could not revert keyword:' + obj.id);
        }
    }
    clean();
}

// Get all of the keywords of the specified campaigns.
function getKeywords() {
    var keywords = {};
    var campaignIt = AdWordsApp.campaigns()
        .withCondition("Status = ENABLED ")
        .get();
    while (campaignIt.hasNext()) {
        var campaign = campaignIt.next();
        var name = campaign.getName();
        if (campaigns[name]) {
            var keywordIt = campaign.keywords()
                .get();

            while (keywordIt.hasNext()) {
                var keyword = keywordIt.next();
                var id = keyword.getId().toString();
                keywords[id] = keyword;
            }
        }
    }
    return keywords;
}

// Fill the "toRevert" array with the to be reverted keywords.
function fillRevert() {
    var spreadsheet = SpreadsheetApp.openByUrl(SPREADSHEET_REVERT_KEYWORDS_URL);
    var sheet = spreadsheet.getActiveSheet();
    var range = sheet.getRange(1, 1, sheet.getLastRow(), 1);
    var lines = range.getValues();
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i][0];
        var obj = parse(line);
        toRevert.push(obj);
    }
}

// Parse each message and return an object that contains the revert command.
function parse(str) {
    var newObj = {};
    var tokens = str.split(" ");
    var command = tokens[0];
    if (command == 'Pausing') {
        newObj.command = 'pause';
        newObj.id = tokens[2];
    } else {
        newObj.command = 'change';
        var last = str.lastIndexOf('from:');
        newObj.id = tokens[2];
        newObj.before = Number(str.charAt(last + 5));
    }
    return newObj;
}

function revertPause(keyword) {
    Logger.log(keyword.getCampaign() + ' ' + keyword.getAdGroup() + ' ' + keyword.getText() + ' UNPAUSED');
    keyword.enable();
}

function revertChange(keyword, value) {
    Logger.log(keyword.getCampaign() + ' ' + keyword.getAdGroup() + ' ' + keyword.getText() + ' RESET - ' + value);
    keyword.setMaxCpc(value);
}

// Removes all occupied cells from the sheet
function clean() {
    var spreadsheet = SpreadsheetApp.openByUrl(SPREADSHEET_REVERT_KEYWORDS_URL);
    var sheet = spreadsheet.getActiveSheet();
    sheet.clear();
}
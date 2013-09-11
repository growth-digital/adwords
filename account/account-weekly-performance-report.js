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

// Outputs the performance of an account during the previous week (Sun-Mon) 
// to a google spreadsheet.
// If scheduled, every week the program appends the new performance data to
// the specified spreadsheet.
var REPORT_URL = '*******';

function main() {
    var spreadsheet = SpreadsheetApp.openByUrl(REPORT_URL);

    var sheet = spreadsheet.getActiveSheet();

    var fields = [
        "Impressions",
        "Clicks",
        "Cost",
        "Conversions",
        "CostPerConversion",
        "ConversionRate",
        "ViewThroughConversions"
    ];

    var awql = "SELECT " + fields.join(",") +
        " FROM ACCOUNT_PERFORMANCE_REPORT " +
        " DURING LAST_WEEK";

    var report = AdWordsApp.report(awql);

    var rows = report.rows();
    var row = rows.next();
    // Format date
    var date = new Date();
    var formattedDate = Utilities.formatDate(new Date(), "GMT+3", "E");
    var dateString = date.toDateString();
    var day = dateString.substr(0, 3);
    var mon = dateString.substr(4, 3);
    date = "Week of " + formattedDate + ", " + mon + " " + date.getDate() + ", " + date.getYear();

    // Export result
    var result = [
        [date,
            row.Impressions,
            row.Clicks,
            row.Cost,
            row.Conversions,
            row.CostPerConversion,
            row.ConversionRate,
            row.ViewThroughConversions
        ]
    ];

    var range = sheet.getRange(sheet.getLastRow() + 1, 1, 1, result[0].length);
    range.setValues(result);
}
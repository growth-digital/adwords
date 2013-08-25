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
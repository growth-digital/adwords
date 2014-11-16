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

/**
 *
 * @author George Zografos
 * @name Account weekly performance report
 * @description  Outputs the performance of an account during the previous week (Sun-Mon)
 *               to a google spreadsheet. If scheduled, every week the program
 *               appends the new performance data to the specified spreadsheet.
 */

/**
 * The url of the spreadsheet to export the data to
 */
var SPREADSHEET_URL = 'http://...';

/**
 * The name of the sheet in which to add the data in.
 * If no name is supplied then then the first sheet of the spreadsheet will be used
 */
var SHEET_NAME = '';

/**
 * Used when formatting the current date. For more info check the following url:
 * https://docs.oracle.com/javase/7/docs/api/java/text/SimpleDateFormat.html
 */
var TIMEZONE = '+3';
var DATE_FORMAT = 'E, MMM d, YYYY';

/**
 * The account performance fields that will be exported to the spreadsheet
 */
var PERFORMANCE_FIELDS = [
    'Impressions',
    'Clicks',
    'Cost',
    'Conversions',
    'CostPerConversion',
    'ConversionRate',
    'ViewThroughConversions'
];

function main() {
    var performanceResults = getAccountPerformanceResults();

    performanceResults.unshift( getFormattedDate() );

    exportToSpreadsheet( performanceResults );
}

function getAccountPerformanceResults() {

    var awql = 'SELECT ' + PERFORMANCE_FIELDS.join( ',' ) +
        ' FROM ACCOUNT_PERFORMANCE_REPORT ' +
        ' DURING LAST_WEEK';

    var report = AdWordsApp.report( awql );

    var row = report.rows().next();

    return [
        row.Impressions,
        row.Clicks,
        row.Cost,
        row.Conversions,
        row.CostPerConversion,
        row.ConversionRate,
        row.ViewThroughConversions
    ];
}

// For example: Week of Sat, Nov 15, 2014
function getFormattedDate() {
    var formattedDate = Utilities.formatDate( new Date(), TIMEZONE, DATE_FORMAT )
    return Utilities.formatString( 'Week of %s', formattedDate );
}

function exportToSpreadsheet( performanceResults ) {
    var spreadsheet = SpreadsheetApp.openByUrl( SPREADSHEET_URL );
    var sheet = SHEET_NAME ? spreadsheet.getSheetByName( SHEET_NAME ) : spreadsheet.getSheets()[ 0 ];
    sheet.appendRow( performanceResults );
}

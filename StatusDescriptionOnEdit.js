function onEditStatus(e) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var statussenSheet = spreadsheet.getSheetByName("Statussen");

  var range = e.range; // This is the cell that was edited.
  var sheet = range.getSheet();

 // Define the sheets to watch and the corresponding columns in StatussenSheet
  var sheetsToWatch = {
    "BedrijvenOverzicht": ["A", "B"], // For BedrijvenOverzicht, look at columns A and B in StatussenSheet
    "ContactpersonenOverzicht": ["D", "E"],
    "LogboekContact": ["G", "H"],
    "Sales": ["J", "K"],
    "Voorraad": ["M", "N"]
  };

  // If the edit was not on one of the specified sheets, or not in column B, we don't need to do anything.
  if (!(sheet.getName() in sheetsToWatch) || range.getColumn() !== 2) {
    return;
  }

  var statusColumns = sheetsToWatch[sheet.getName()];
  var statusRange = statussenSheet.getRange(statusColumns[0] + "2:" + statusColumns[1] + statussenSheet.getLastRow()); 
  var statusValues = statusRange.getValues();
  var statusDict = {};
  for (var i = 0; i < statusValues.length; i++) {
    statusDict[statusValues[i][0]] = statusValues[i][1];
  }

  var status = range.getValue();
  if (status in statusDict) {
    range.setNote(statusDict[status]);
  }
}

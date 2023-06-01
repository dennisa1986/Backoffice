function onEditID(e) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(); // Get the active spreadsheet
  var sheet = spreadsheet.getActiveSheet(); // Get the active sheet within the spreadsheet
  var name = sheet.getName(); // Get the name of the sheet
  var prefix = "";
  
  switch(name) {
    case 'BedrijvenOverzicht':
      prefix = "COMP-";
      break;
    case 'ContactpersonenOverzicht':
      prefix = "PERS-";
      break;
    case 'LogboekContact':
      prefix = "LOG-";
      break;
    case 'Sales':
      prefix = "SALE-";
      break;
    case 'Voorraad':
      prefix = "INV-";
      break;
    // add more cases as needed for each sheet
    default:
      prefix = name.substring(0, 4).toUpperCase() + "-";
  }

  var row = e.range.getRow();
  Logger.log('Row: ' + row + ', Type: ' + typeof row); // add this line
  var idCell = sheet.getRange(row, 1); // Call getRange on the sheet, not the spreadsheet
  
  if (idCell.getValue() == '') {
    var idNumber = (row - 1).toString();
    while (idNumber.length < 5) {
      idNumber = "0" + idNumber;
    }
    idCell.setValue(prefix + idNumber);
  }
}

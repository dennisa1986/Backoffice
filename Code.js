const SPREADSHEET_ID = "1kIp9zhkYqy4YDLHTtUCTpUqXQpclkdb2Gt7Kfc88VN4";
const Files = {
  CSS: 'css.html',
  SCRIPT: 'script.html',
  SCRIPT_BEDRIJFSOVERZICHT: 'scriptBedrijfsoverzicht.html',
  SCRIPT_CONTACTPERSONEN: 'scriptContactpersonen.html',
  SCRIPT_LOGBOEK: 'scriptLogboekContact.html',
  SCRIPT_SALES: 'scriptSales.html',
  INDEX: 'index.html'
}

var previousValues = {}; // Store the previous field values for reverting changes
var isEditing = false; // Track the editing state

const SheetColumns = Object.freeze({
  CompID: columnToNumber('A'),
  STATUS: columnToNumber('B'),
  BEDRIJFSNAAM: columnToNumber('D'),
  STRAAT: columnToNumber('E'),
  POSTCODE: columnToNumber('F'),
  STAD: columnToNumber('G'),
  LAND: columnToNumber('H'),
  PROVINCIE: columnToNumber('I'),
  TELEFOONNUMMER: columnToNumber('J'),
  WEBSITE: columnToNumber('K'),
  LATITUDE: columnToNumber('L'),
  LONGITUDE: columnToNumber('M'),
  TYPEWINKEL: columnToNumber('N'),
  SUBLABELS: columnToNumber('O'),
  AANTALFILIALEN: columnToNumber('P'),
  NOTITIES: columnToNumber('T'),

  PersID: columnToNumber('A'),
  STATUS_ContactpersonenOverzicht: columnToNumber('B'),
  ACHTERNAAM: columnToNumber('D'),
  NAAM: columnToNumber('E'),
  TELEFOONNUMMER_ContactpersonenOverzicht: columnToNumber('F'),
  EMAIL_ContactpersonenOverzicht: columnToNumber('G'),
  LINKEDIN: columnToNumber('H'),
  WERKZAAMBEDRIJF: columnToNumber('I'),
  INKOOPBEVOEGD: columnToNumber('J'),
  FUNCTIE: columnToNumber('K'),
  NOTITIES_ContactpersonenOverzicht: columnToNumber('L'),

  LogID: columnToNumber('A'),
  Status_LogboekData: columnToNumber('B'),
  TypeContact: columnToNumber('E'),
  Notities_LogboekData: columnToNumber('F'),

  SaleID: columnToNumber('A'),
  STATUS_Sales: columnToNumber('B'),
  BESTELDATUM: columnToNumber('C'),
  KLANT: columnToNumber('D'),
  CONTACTPERSOON: columnToNumber('F'),
  AANTAL_BA: columnToNumber('H'),
  STUKSPRIJS_BA: columnToNumber('I'),
  SUBTOTAAL_BA: columnToNumber('J'),
  AANTAL_GB: columnToNumber('K'),
  STUKSPRIJS_GB: columnToNumber('L'),
  SUBTOTAAL_GB: columnToNumber('M'),
  AANTAL_3LB: columnToNumber('N'),
  STUKSPRIJS_3LB: columnToNumber('O'),
  SUBTOTAAL_3LB: columnToNumber('P'),
  EENMALIGE_KORTING: columnToNumber('Q'),
  STAFFELKORTING: columnToNumber('R'),
  TOTAAL_VERKOOP: columnToNumber('S'),
  BTW: columnToNumber('T'),
  TOTAAL_INCL_BTW: columnToNumber('U')
});

function doGet() {
  const template = HtmlService.createTemplateFromFile(Files.INDEX);
  Object.values(Files).forEach(file => {
    if (file !== Files.INDEX) {
      template[`${file.split('.')[0]}Content`] = HtmlService.createTemplateFromFile(file).getRawContent();
    }
  })
  return template.evaluate().setTitle('Fusie Backoffice');
}

function columnToNumber(column) {
  return [...column].reduce((accumulator, currentValue, index) =>
    accumulator * 26 + currentValue.charCodeAt() - 'A'.charCodeAt(0) + 1
    , 0);
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getData(sheetName) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  return sheet.getDataRange().getValues();
}

function getValuesFromColumn(sheetName, column) {
  const ss = getSpreadsheet();
  const ws = ss.getSheetByName(sheetName);
  const data = ws.getRange(`${column}2:${column}${ws.getLastRow()}`).getValues();

  return data.flat().filter(value => value !== "");
}

function getCompStatusValues() {
  return getValuesFromColumn("Statussen", "A");
}

function getContactpersonStatusValues() {
  return getValuesFromColumn("Statussen", "D");
}

function getLogStatusValues() {
  return getValuesFromColumn("Statussen", "G");
}

function getSaleStatusValues() {
  return getValuesFromColumn("Statussen", "J");
}

function getCompaniesData() {
  try {
    const data = getData('BedrijvenOverzicht');

    const companies = data.map(function (row) {
      return {
        CompID: row[SheetColumns.CompID - 1],
        Status: row[SheetColumns.STATUS - 1],
        Bedrijfsnaam: row[SheetColumns.BEDRIJFSNAAM - 1],
        Straat: row[SheetColumns.STRAAT - 1],
        Postcode: row[SheetColumns.POSTCODE - 1],
        Stad: row[SheetColumns.STAD - 1],
        Land: row[SheetColumns.LAND - 1],
        Provincie: row[SheetColumns.PROVINCIE - 1],
        Telefoonnummer: row[SheetColumns.TELEFOONNUMMER - 1],
        Website: row[SheetColumns.WEBSITE - 1],
        Latitude: row[SheetColumns.LATITUDE - 1],
        Longitude: row[SheetColumns.LONGITUDE - 1],
        TypeWinkel: row[SheetColumns.TYPEWINKEL - 1],
        SubLabels: row[SheetColumns.SUBLABELS - 1],
        AantalFilialen: row[SheetColumns.AANTALFILIALEN - 1],
        Notities: row[SheetColumns.NOTITIES - 1]
      };
    });

    return companies;
  } catch (error) {
    throw new Error("Failed to retrieve companies data. " + error.message);
  }
}


function saveCompany(company) {
  const ws = getSpreadsheet().getSheetByName("BedrijvenOverzicht");
  const data = ws.getDataRange().getValues();

  // Find the row with the given CompID
  const rowIndex = data.findIndex(row => row[SheetColumns.CompID - 1] == company.CompID);

  let newRow = Array(16).fill(""); // Adjust the size according to your number of columns
  newRow[SheetColumns.CompID - 1] = company.CompID;
  newRow[SheetColumns.STATUS - 1] = company.Status;
  newRow[SheetColumns.BEDRIJFSNAAM - 1] = company.Bedrijfsnaam;
  newRow[SheetColumns.STRAAT - 1] = company.Straat;
  newRow[SheetColumns.POSTCODE - 1] = company.Postcode;
  newRow[SheetColumns.STAD - 1] = company.Stad;
  newRow[SheetColumns.LAND - 1] = company.Land;
  newRow[SheetColumns.PROVINCIE - 1] = company.Provincie;
  newRow[SheetColumns.TELEFOONNUMMER - 1] = company.Telefoonnummer;
  newRow[SheetColumns.WEBSITE - 1] = company.Website;
  newRow[SheetColumns.LATITUDE - 1] = company.Latitude;
  newRow[SheetColumns.LONGITUDE - 1] = company.Longitude;
  newRow[SheetColumns.TYPEWINKEL - 1] = company.TypeWinkel;
  newRow[SheetColumns.SUBLABELS - 1] = company.SubLabels;
  newRow[SheetColumns.AANTALFILIALEN - 1] = company.AantalFilialen;
  newRow[SheetColumns.NOTITIES - 1] = company.Notities;
  // Continue assigning the rest of the columns

  let compID;
  let newCompanyData = null;  // Initialize newCompanyData

  if (rowIndex === -1) {
    // If the CompID doesn't exist, append a new row
    ws.appendRow(newRow);

    // Get the last row number and generate the CompID
    let lastRow = ws.getLastRow();
    let idNumber = (lastRow - 1).toString();
    while (idNumber.length < 5) {
      idNumber = "0" + idNumber;
    }
    compID = "COMP-" + idNumber;
    ws.getRange(lastRow, SheetColumns.CompID).setValue(compID);

    // Assign new company data
    newCompanyData = { ...company, CompID: compID };
  } else {
    // If the CompID exists, update the existing row
    newRow[SheetColumns.CompID - 1] = company.CompID;
    const range = ws.getRange(rowIndex + 1, 1, 1, newRow.length);
    range.setValues([newRow]);
    compID = company.CompID;
  }

  return {
    companiesData: getData("BedrijvenOverzicht"),
    compID: compID,
    newCompany: newCompanyData  // Include the new company data in the return
  };
}

function getContactpersonenData() {
  try {
    var data = getData('ContactpersonenOverzicht');

    var contactpersons = data.map(function (row) {
      return {
        PersID: row[SheetColumns.PersID - 1],
        Status: row[SheetColumns.STATUS_ContactpersonenOverzicht - 1],
        Achternaam: row[SheetColumns.ACHTERNAAM - 1],
        Naam: row[SheetColumns.NAAM - 1],
        Telefoonnummer: row[SheetColumns.TELEFOONNUMMER_ContactpersonenOverzicht - 1],
        Email: row[SheetColumns.EMAIL_ContactpersonenOverzicht - 1],
        LinkedIn: row[SheetColumns.LINKEDIN - 1],
        WerkzaamBij: row[SheetColumns.WERKZAAMBEDRIJF - 1],
        Inkoopbevoegd: row[SheetColumns.INKOOPBEVOEGD - 1],
        Functie: row[SheetColumns.FUNCTIE - 1],
        Notities: row[SheetColumns.NOTITIES_ContactpersonenOverzicht - 1]
      };
    });

    return contactpersons;
  } catch (error) {
    console.error(error); // Log the error message
    throw new Error("Failed to retrieve contactpersons data. " + error.message);
  }
}

function saveContactperson(contactperson) {
  try {
    const ws = getSpreadsheet().getSheetByName("ContactpersonenOverzicht");
    const data = ws.getDataRange().getValues();

    const rowIndex = data.findIndex(function (row) {
      return row[SheetColumns.PersID - 1] == contactperson.PersID;
    });

    let newRow = Array(11).fill("");
    newRow[SheetColumns.PersID - 1] = contactperson.PersID;
    newRow[SheetColumns.STATUS_ContactpersonenOverzicht - 1] = contactperson.Status;
    newRow[SheetColumns.ACHTERNAAM - 1] = contactperson.Achternaam;
    newRow[SheetColumns.NAAM - 1] = contactperson.Naam;
    newRow[SheetColumns.TELEFOONNUMMER_ContactpersonenOverzicht - 1] = contactperson.Telefoonnummer;
    newRow[SheetColumns.EMAIL_ContactpersonenOverzicht - 1] = contactperson.Email;
    newRow[SheetColumns.LINKEDIN - 1] = contactperson.LinkedIn;
    newRow[SheetColumns.WERKZAAMBEDRIJF - 1] = contactperson.WerkzaamBij;
    newRow[SheetColumns.INKOOPBEVOEGD - 1] = contactperson.Inkoopbevoegd;
    newRow[SheetColumns.FUNCTIE - 1] = contactperson.Functie;
    newRow[SheetColumns.NOTITIES_ContactpersonenOverzicht - 1] = contactperson.Notities;

    let persID;
    let newContactpersonData = null;

    if (rowIndex === -1) {
      ws.appendRow(newRow);

      let lastRow = ws.getLastRow();
      let idNumber = (lastRow - 1).toString();
      while (idNumber.length < 5) {
        idNumber = "0" + idNumber;
      }
      persID = "PERS-" + idNumber;
      ws.getRange(lastRow, SheetColumns.PersID).setValue(persID);

      newContactpersonData = {
        PersID: persID,
        Status: contactperson.Status,
        Achternaam: contactperson.Achternaam,
        Naam: contactperson.Naam,
        Telefoonnummer: contactperson.Telefoonnummer,
        Email: contactperson.Email,
        LinkedIn: contactperson.LinkedIn,
        WerkzaamBij: contactperson.WerkzaamBij,
        Inkoopbevoegd: contactperson.Inkoopbevoegd,
        Functie: contactperson.Functie,
        Notities: contactperson.Notities
      };
    } else {
      newRow[SheetColumns.PersID - 1] = contactperson.PersID;
      const range = ws.getRange(rowIndex + 1, 1, 1, newRow.length);
      range.setValues([newRow]);
      persID = contactperson.PersID;
    }

    return {
      contactpersonsData: getContactpersonenData(),
      persID: persID,
      newContactperson: newContactpersonData
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to save contactperson. " + error.message);
  }
}

function getLogboekData() {
  try {
    const data = getData('LogboekContact');

    const logboek = data.map(function (row) {
      return {
        LogID: row[SheetColumns.LogID - 1],
        Status: row[SheetColumns.Status_LogboekData - 1],
        TypeContact: row[SheetColumns.TypeContact - 1],
        Notities: row[SheetColumns.Notities_LogboekData - 1]
      };
    });

    return logboek;
  } catch (error) {
    console.error(error); // Log the error message
    throw new Error("Failed to retrieve logboek data. " + error.message);
  }
}

function saveLogEntry(logEntry) {
  try {
    const ws = getSpreadsheet().getSheetByName("LogboekContact");
    const data = ws.getDataRange().getValues();

    const rowIndex = data.findIndex(function (row) {
      return row[SheetColumns.LogID - 1] == logEntry.LogID;
    });

    let newRow = Array(4).fill("");
    newRow[SheetColumns.LogID - 1] = logEntry.LogID;
    newRow[SheetColumns.Status_LogboekData - 1] = logEntry.Status;
    newRow[SheetColumns.TypeContact - 1] = logEntry.TypeContact;
    newRow[SheetColumns.Notities_LogboekData - 1] = logEntry.Notities;

    let logID;
    let newLogEntryData = null;

    if (rowIndex === -1) {
      ws.appendRow(newRow);

      let lastRow = ws.getLastRow();
      let idNumber = (lastRow - 1).toString();
      while (idNumber.length < 5) {
        idNumber = "0" + idNumber;
      }
      logID = "LOG-" + idNumber;
      ws.getRange(lastRow, SheetColumns.LogID).setValue(logID);

      newLogEntryData = {
        LogID: logID,
        Status: logEntry.Status,
        TypeContact: logEntry.TypeContact,
        Notities: logEntry.Notities
      };
    } else {
      newRow[SheetColumns.LogID - 1] = logEntry.LogID;
      const range = ws.getRange(rowIndex + 1, 1, 1, newRow.length);
      range.setValues([newRow]);
      logID = logEntry.LogID;
    }

    return {
      logboekData: getLogboekData(),
      logID: logID,
      newLogEntry: newLogEntryData
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to save log entry. " + error.message);
  }
}

function getSalesData() {
  try {
    const data = getData('Sales');

    const sales = data.map(function (row) {
      return {
        SaleID: row[SheetColumns.SaleID - 1],
        STATUS_Sales: row[SheetColumns.STATUS_Sales - 1],
        BESTELDATUM: row[SheetColumns.BESTELDATUM - 1],
        KLANT: row[SheetColumns.KLANT - 1],
        CONTACTPERSOON: row[SheetColumns.CONTACTPERSOON - 1],
        AANTAL_BA: row[SheetColumns.AANTAL_BA - 1],
        STUKSPRIJS_BA: row[SheetColumns.STUKSPRIJS_BA - 1],
        SUBTOTAAL_BA: row[SheetColumns.SUBTOTAAL_BA - 1],
        AANTAL_GB: row[SheetColumns.AANTAL_GB - 1],
        STUKSPRIJS_GB: row[SheetColumns.STUKSPRIJS_GB - 1],
        SUBTOTAAL_GB: row[SheetColumns.SUBTOTAAL_GB - 1],
        AANTAL_3LB: row[SheetColumns.AANTAL_3LB - 1],
        STUKSPRIJS_3LB: row[SheetColumns.STUKSPRIJS_3LB - 1],
        SUBTOTAAL_3LB: row[SheetColumns.SUBTOTAAL_3LB - 1],
        EENMALIGE_KORTING: row[SheetColumns.EENMALIGE_KORTING - 1],
        STAFFELKORTING: row[SheetColumns.STAFFELKORTING - 1],
        TOTAAL_VERKOOP: row[SheetColumns.TOTAAL_VERKOOP - 1],
        BTW: row[SheetColumns.BTW - 1],
        TOTAAL_INCL_BTW: row[SheetColumns.TOTAAL_INCL_BTW - 1]
      };
    });
    Logger.log("Sales Data:", getSalesData());
    return sales;
  } catch (error) {
    throw new Error("Failed to retrieve sales data. " + error.message);
  }
}

function saveSale(sale) {
  try {
    const ws = getSpreadsheet().getSheetByName("Sales");
    const data = ws.getDataRange().getValues();

    const rowIndex = data.findIndex(function (row) {
      return row[SheetColumns.SaleID - 1] == sale.SaleID;
    });

    let newRow = Array(19).fill("");
    newRow[SheetColumns.SaleID - 1] = sale.SaleID;
    newRow[SheetColumns.STATUS_Sales - 1] = sale.Status;
    newRow[SheetColumns.BESTELDATUM - 1] = sale.Besteldatum;
    newRow[SheetColumns.KLANT - 1] = sale.Klant;
    newRow[SheetColumns.CONTACTPERSOON - 1] = sale.Contactpersoon;
    newRow[SheetColumns.AANTAL_BA - 1] = sale.Aantal_ba;
    newRow[SheetColumns.STUKSPRIJS_BA - 1] = sale.Stuksprijs_ba;
    newRow[SheetColumns.SUBTOTAAL_BA - 1] = sale.Subtotaal_ba;
    newRow[SheetColumns.AANTAL_GB - 1] = sale.Aantal_gb;
    newRow[SheetColumns.STUKSPRIJS_GB - 1] = sale.Stuksprijs_gb;
    newRow[SheetColumns.SUBTOTAAL_GB - 1] = sale.Subtotaal_gb;
    newRow[SheetColumns.AANTAL_3LB - 1] = sale.Aantal_3lb;
    newRow[SheetColumns.STUKSPRIJS_3LB - 1] = sale.Stuksprijs_3lb;
    newRow[SheetColumns.SUBTOTAAL_3LB - 1] = sale.Subtotaal_3lb;
    newRow[SheetColumns.EENMALIGE_KORTING - 1] = sale.Eenmalige_korting;
    newRow[SheetColumns.STAFFELKORTING - 1] = sale.Staffelkorting;
    newRow[SheetColumns.TOTAAL_VERKOOP - 1] = sale.Totaal_verkoop;
    newRow[SheetColumns.BTW - 1] = sale.Btw;
    newRow[SheetColumns.TOTAAL_INCL_BTW - 1] = sale.Totaal_incl_btw;

    let saleID;
    let newSaleData = null;

    if (rowIndex === -1) {
      ws.appendRow(newRow);

      let lastRow = ws.getLastRow();
      let idNumber = (lastRow - 1).toString();
      while (idNumber.length < 5) {
        idNumber = "0" + idNumber;
      }
      saleID = "SALE-" + idNumber;
      ws.getRange(lastRow, SheetColumns.SaleID).setValue(saleID);

      newSaleData = {
        SaleID: saleID,
        STATUS_Sales: sale.Status,
        BESTELDATUM: sale.Besteldatum,
        KLANT: sale.Klant,
        CONTACTPERSOON: sale.Contactpersoon,
        AANTAL_BA: sale.Aantal_ba,
        STUKSPRIJS_BA: sale.Stuksprijs_ba,
        SUBTOTAAL_BA: sale.Subtotaal_ba,
        AANTAL_GB: sale.Aantal_gb,
        STUKSPRIJS_GB: sale.Stuksprijs_gb,
        SUBTOTAAL_GB: sale.Subtotaal_gb,
        AANTAL_3LB: sale.Aantal_3lb,
        STUKSPRIJS_3LB: sale.Stuksprijs_3lb,
        SUBTOTAAL_3LB: sale.Subtotaal_3lb,
        EENMALIGE_KORTING: sale.Eenmalige_korting,
        STAFFELKORTING: sale.Staffelkorting,
        TOTAAL_VERKOOP: sale.Totaal_verkoop,
        BTW: sale.Btw,
        TOTAAL_INCL_BTW: sale.Totaal_incl_btw
      };
    } else {
      newRow[SheetColumns.SaleID - 1] = sale.SaleID;
      const range = ws.getRange(rowIndex + 1, 1, 1, newRow.length);
      range.setValues([newRow]);
      saleID = sale.SaleID;
    }

    return {
      salesData: getSalesData(),
      saleID: saleID,
      newSale: newSaleData
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to save sales data. " + error.message);
  }
}
function getStuksprijsByShortname(shortname) {
  const sheetName = "SKUprijzen";
  const shortnameColumn = "B";
  const stuksprijsColumn = "C";

  const ws = getSpreadsheet().getSheetByName(sheetName);
  const data = ws.getRange(`${shortnameColumn}2:${stuksprijsColumn}`).getValues();

  for (let i = 0; i < data.length; i++) {
    const rowShortname = data[i][0];
    const stuksprijs = data[i][1];

    if (rowShortname === shortname) {
      Logger.log("Found stuksprijs: " + stuksprijs);
      return stuksprijs;
    }
  }

  Logger.log("Stuksprijs not found for shortname: " + shortname);
  return null; // Return null if no matching shortname is found
}


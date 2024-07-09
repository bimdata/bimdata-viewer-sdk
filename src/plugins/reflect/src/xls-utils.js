import * as ExcelImport from "exceljs/dist/exceljs.min.js";
import FileSaver from "file-saver";
import iconReflect from "../assets/reflect.png";
import iconRivp from "../assets/rivp.png";
import iconTipee from "../assets/tipee.png";

let ExcelJS;
if (ExcelImport.default) {
  ExcelJS = ExcelImport.default;
} else {
  ExcelJS = ExcelImport;
}

/**
 * Sub-function to autofitColums function
 *
 * @param {*} ws
 * @param {*} col1
 * @param {*} col2
 * @param {*} cb
 */
function eachColumnInRange(ws, col1, col2, cb) {
  for (let c = col1; c <= col2; c++) {
    let col = ws.getColumn(c);
    cb(col);
  }
}

/**
 * Function autofitColumns auto-adjust the length of the cell accordingly to the column max length
 *
 * @param {*} ws
 */
function autofitColumns(ws) {
  // no good way to get text widths
  eachColumnInRange(ws, 1, ws.columnCount, (column) => {
    let maxWidth = 10;
    column.eachCell((cell) => {
      if (!cell.isMerged && cell.value) {
        // doesn't handle merged cells

        let text = '';
        if (typeof cell.value != 'object') {
          // string, number, ...
          text = cell.value.toString();
        } else if (cell.value.richText) {
          // richText
          text = cell.value.richText.reduce((text, obj) => text + obj.text.toString(), '');
        }

        // handle new lines -> don't forget to set wrapText: true
        let values = text.split(/[\n\r]+/);

        for (let value of values) {
          let width = value.length;

          if (cell.font && cell.font.bold) {
            width *= 1.08; // bolding increases width
          }

          maxWidth = Math.max(maxWidth, width);
        }
      }
    });

    maxWidth += 0.71; // compensate for observed reduction
    maxWidth += 1; // buffer space

    column.width = maxWidth;
  });
}

async function generateAndDownloadXLS(columnsData, rowsData, validation, name) {
  const sizeColumns = columnsData.length;
  let workbook = new ExcelJS.Workbook();
  workbook.creator = "Reflect";
  workbook.lastModifiedBy = "Reflect";
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.lastPrinted = new Date();
  workbook.calcProperties.fullCalcOnLoad = true;

  const uniqueRule = [
    ...new Set(rowsData.map(item => item.code_regle)),
  ];

  let ws = workbook.addWorksheet("REFLECT", {
    headerFooter: { firstHeader: "REFLECT", firstFooter: "REFLECT EXPORT" },
    properties: { tabColor: { argb: "FF63BE7B" } },
  });

  const getData = async url => {
    const res = await fetch(url).then(response =>
      response.arrayBuffer()
    );
    return res;
  };

  // add image to workbook by buffer
  const imageTipee = workbook.addImage({
    buffer: getData(iconTipee),
    extension: "png",
  });

  const imageReflect = workbook.addImage({
    buffer: getData(iconReflect),
    extension: "png",
  });

  const imageRivp = workbook.addImage({
    buffer: getData(iconRivp),
    extension: "png",
  });

  // insert an image over A1:D6
  ws.addImage(imageRivp, "A1:B2");
  // ws.addImage(imageTipee, "M1:Q6");
  ws.addImage(imageReflect, "I1:K2");

  ws.mergeCells("C2:G2");

  const C2 = ws.getCell("C2");
  C2.value =
    "CONTRÔLE DES MAQUETTES NUMERIQUES SUR LA BASE DU CAHIER DE PRECONISATIONS";
  C2.style.font = {
    bold: true,
    color: { argb: "000000" },
    family: 2,
    size: 18,
    name: "Calibri Light (En-têtes)",
  };
  C2.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };

  // add a table to a sheet
  ws.addTable({
    name: "MyTable",
    ref: "C18",
    headerRow: true,
    totalsRow: true,
    style: {
      theme: "TableStyleLight1",
      showRowStripes: true,
      font: {
        bold: true,
        color: { argb: "000000" },
        family: 2,
        size: 28,
        name: "Calibri Light (En-têtes)",
      },
    },
    columns: [
      { name: "numero_chapitre", filterButton: false, width: 40 },
      { name: "titre", filterButton: false, width: 40 },
      { name: "code_regle", filterButton: false, width: 40 },
      {
        name: "validation_finale",
        filterButton: false,
        width: 40,
      },
    ],
    rows: validation.map(item => Object.values(item)),
  });

  const uniqueWs = uniqueRule.map(item => {
    const name_ws = item;
    // Create worksheets with headers and footers
    let ws = workbook.addWorksheet(name_ws, {
      headerFooter: {
        firstHeader: `${name_ws}`,
        firstFooter: `${name_ws} EXPORT`,
      },
    });

    // adjust properties afterwards (not supported by worksheet-writer)
    ws.properties.outlineLevelCol = 2;
    ws.properties.defaultRowHeight = 15;

    // Set the left footer to 18px and italicize. Result: "Page 2 of 16"
    ws.headerFooter.oddFooter = "&LPage &P of &N";

    // Set the left, center, and right text of the footer. Result: “Exceljs” in the footer left. “demo.xlsx” in the footer center. “Page 2” in the footer right
    ws.headerFooter.oddFooter = "&LREFLECT&C&F&RPage &P";

    // ws.autoFilter = `A2:B${sizeColumns}`;

    // Set an auto filter from D3 to the
    // cell in row 7 and column 5
    ws.autoFilter = {
      from: "A1",
      to: {
        row: 1,
        column: sizeColumns,
      },
    };

    // add a checkerboard pattern to A1:E7 based on row + col being even or odd
    ws.addConditionalFormatting({
      ref: "A2:BP1016",
      rules: [
        {
          type: "colorScale",
          cfvo: [{ type: "min" }, { type: "max" }],
          color: [{ argb: "FFF8696B" }, { argb: "FF63BE7B" }],
        },
        {
          type: "containsText",
          operator: "containsText",
          text: "true",
          style: {
            fill: {
              type: "pattern",
              pattern: "solid",
              bgColor: { argb: "FF63BE7B" },
              fgColor: { argb: "FFFFFF" },
            },
          },
        },
        {
          type: "containsText",
          operator: "containsText",
          text: "false",
          style: {
            fill: {
              type: "pattern",
              pattern: "solid",
              bgColor: { argb: "FFF8696B" },
              fgColor: { argb: "FFFFFF" },
            },
          },
        },
      ],
    });

    return { name: item, ws: ws };
  });

  const columnsFormat = [];

  const rows = [];
  // Sanitize data that is impossible to serialize
  rowsData.forEach((r, index) => {
    const row = [];

    for (const [k, v] of Object.entries(r)) {
      let formatter = function (d) {
        if (typeof d == "boolean") {
          return d === true ? "true" : "false";
        }
        return d;
      };
      const formatted = formatter(v);
      row.push(formatted);
    }
    rows.push(row);
  });

  uniqueWs.forEach(unique_worksheet => {
    autofitColumns(unique_worksheet.ws);

    unique_worksheet.ws.columns = columnsFormat;

    unique_worksheet.ws.eachRow(r =>
      r.eachCell(cell => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.font = {
          bold: false,
          name: "Calibri Light (Corps)",
          color: { argb: "000000" },
          family: 2,
          size: 12,
        };
      })
    );
    // Apply styles to the header row
    unique_worksheet.ws.getRow(1).eachCell(cell => {
      cell.fill = {
        type: "pattern",
        pattern: "lightGrid",
        fgColor: { argb: "d3d3d3" },
        bgColor: { argb: "ffffff" },
      };
      cell.font = {
        bold: true,
        name: "Calibri Light (Corps)",
        color: { argb: "000000" },
        family: 2,
        size: 14,
      };
    });
  });

  rows.forEach((row, index) => {
    const ws_current = uniqueWs.find(x => x.name === row[2]);
    ws_current.ws.addRow(row);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const now = new Date();
  FileSaver.saveAs(
    blob,
    `${name}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}.xlsx`
  );
}

export {
  generateAndDownloadXLS
};

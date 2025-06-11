const path = require('path');
const xlsx = require('xlsx');

function getHeadersFromExcel(relativePath) {
  const excelPath = path.join(__dirname, '../../', relativePath);
  const workbook = xlsx.readFile(excelPath);
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  return data[0];
}

function getRowsFromExcel(relativePath) {
  const excelPath = path.join(__dirname, '../../', relativePath);
  const workbook = xlsx.readFile(excelPath);
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  // Retorna como objetos con claves igual a cabeceras
  return xlsx.utils.sheet_to_json(worksheet, { defval: null });
}

module.exports = { getHeadersFromExcel, getRowsFromExcel };

const { getHeadersFromExcel } = require('./utils/excelReader');

// const excelRelativePath = 'public/data/2025_1v.xlsx';
const excelRelativePath = 'public/data/Segunda-Vuelta-2025.xlsx';

const headers = getHeadersFromExcel(excelRelativePath);

console.log('Cabeceras del archivo Excel:');
headers.forEach((header, index) => {
  console.log(`${index + 1}. ${header}`);
});

console.log(`Total de cabeceras: ${headers.length}`);
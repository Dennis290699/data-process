const { getRowsFromExcel } = require('./utils/excelReader');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Parámetros
const provinciaCodigoBuscado = Number(process.argv[2]) || 5;
const excelRelativePath = 'public/data/Segunda-Vuelta-2025.xlsx';
const outputDir = `public/output/segunda-vuelta/Provincia_${provinciaCodigoBuscado}`;
const outputPrefix = `${outputDir}/parroquias_resultado_prov_${provinciaCodigoBuscado}`;

// Leer datos
const rows = getRowsFromExcel(excelRelativePath);

// Filtrar PRESIDENTE Y VICEPRESIDENTE (segunda vuelta)
const presidenciales = rows.filter(
  r => r.PROVINCIA_CODIGO === provinciaCodigoBuscado && Number(r.DIGNIDAD_CODIGO) === 11
);

// === PARROQUIAS ===
const parroquiaStats = {};
const winnerStats = {};

presidenciales.forEach(r => {
  const key = `${r.PROVINCIA_CODIGO}-${r.CANTON_CODIGO}-${r.PARROQUIA_CODIGO}`;
  if (!parroquiaStats[key]) {
    parroquiaStats[key] = {
      PROVINCIA_CODIGO: r.PROVINCIA_CODIGO,
      PROVINCIA_NOMBRE: r.PROVINCIA_NOMBRE || 'SIN_PROVINCIA',
      CANTON_CODIGO: r.CANTON_CODIGO,
      CANTON_NOMBRE: r.CANTON_NOMBRE || 'SIN_CANTON',
      PARROQUIA_CODIGO: r.PARROQUIA_CODIGO,
      PARROQUIA_NOMBRE: r.PARROQUIA_NOMBRE || 'SIN_PARROQUIA',
      VOTOS: 0,
      BLANCOS: 0,
      NULOS: 0
    };
    winnerStats[key] = {};
  }

  parroquiaStats[key].VOTOS += Number(r.VOTOS) || 0;
  parroquiaStats[key].BLANCOS += Number(r.BLANCOS) || 0;
  parroquiaStats[key].NULOS += Number(r.NULOS) || 0;

  const candKey = `${r.OP_CODIGO || 'SIN_PARTIDO'}||${r.CANDIDATO_NOMBRE || 'DESCONOCIDO'}`;
  winnerStats[key][candKey] = (winnerStats[key][candKey] || 0) + (Number(r.VOTOS) || 0);
});

const parroquiaData = Object.values(parroquiaStats).map(item => ({
  ...item,
  TOTAL: item.VOTOS + item.BLANCOS + item.NULOS
}));

// === GANADORES POR PARROQUIA ===
const ganadores = Object.entries(winnerStats).map(([key, candMap]) => {
  const stats = parroquiaStats[key];
  let ganador = { votos: 0, sigla: 'N/A', candidato: 'N/A' };

  for (const [cand, votos] of Object.entries(candMap)) {
    if (votos > ganador.votos) {
      const [sigla, candidato] = cand.split('||');
      ganador = { votos, sigla, candidato };
    }
  }

  return {
    PROVINCIA_CODIGO: stats.PROVINCIA_CODIGO,
    PROVINCIA_NOMBRE: stats.PROVINCIA_NOMBRE,
    CANTON_CODIGO: stats.CANTON_CODIGO,
    CANTON_NOMBRE: stats.CANTON_NOMBRE,
    PARROQUIA_CODIGO: stats.PARROQUIA_CODIGO,
    PARROQUIA_NOMBRE: stats.PARROQUIA_NOMBRE,
    PARTIDO: ganador.sigla,
    CANDIDATO: ganador.candidato,
    VOTOS: ganador.votos
  };
});

// === RESUMEN POR PARTIDO ===
const partidoStats = {};
let totalGeneralVotos = 0;

presidenciales.forEach(r => {
  const key = `${r.OP_CODIGO}||${r.CANDIDATO_NOMBRE}`;
  const votos = Number(r.VOTOS) || 0;
  if (!partidoStats[key]) {
    partidoStats[key] = {
      sigla: r.OP_CODIGO || 'SIN_PARTIDO',
      candidato: r.CANDIDATO_NOMBRE || 'DESCONOCIDO',
      votos: 0
    };
  }
  partidoStats[key].votos += votos;
  totalGeneralVotos += votos;
});

const partidoData = Object.values(partidoStats)
  .map(p => ({
    PARTIDO: p.sigla,
    CANDIDATO: p.candidato,
    VOTOS: p.votos,
    '% TOTAL': ((p.votos / totalGeneralVotos) * 100).toFixed(2) + '%'
  }))
  .sort((a, b) => b.VOTOS - a.VOTOS);

partidoData.push({
  PARTIDO: 'TOTALES',
  CANDIDATO: '',
  VOTOS: totalGeneralVotos,
  '% TOTAL': '100.00%'
});

// === EXPORTACIONES ===
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Excel
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(parroquiaData), 'Parroquias');
xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(ganadores), 'GanadoresPorParroquia');
xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(partidoData), 'ResumenPorPartido');
xlsx.writeFile(workbook, `${outputPrefix}.xlsx`);
console.log(`✅ Archivo Excel generado: ${outputPrefix}.xlsx`);

// JSON
fs.writeFileSync(`${outputPrefix}.json`, JSON.stringify(parroquiaData, null, 2));
fs.writeFileSync(`${outputPrefix.replace('parroquias', 'ganadores')}.json`, JSON.stringify(ganadores, null, 2));
fs.writeFileSync(`${outputPrefix.replace('parroquias', 'partidos')}.json`, JSON.stringify(partidoData, null, 2));

console.log(`✅ Archivos JSON generados:
  - ${outputPrefix}.json
  - ${outputPrefix.replace('parroquias', 'ganadores')}.json
  - ${outputPrefix.replace('parroquias', 'partidos')}.json`);

const { getRowsFromExcel } = require('./utils/excelReader');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const provinciaCodigoBuscado = Number(process.argv[2]) || 5;
const excelRelativePath = 'public/data/2025_1v.xlsx';
const outputPrefix = `public/output/Provincia_${provinciaCodigoBuscado}/parroquias_resultado_prov_${provinciaCodigoBuscado}`;
const rows = getRowsFromExcel(excelRelativePath);

// Filtrar PRESIDENTE Y VICEPRESIDENTE
const presidenciales = rows.filter(
  r =>
    r.PROVINCIA_CODIGO === provinciaCodigoBuscado &&
    r.DIGNIDAD_NOMBRE?.trim().toUpperCase() === 'PRESIDENTE Y VICEPRESIDENTE'
);

// === PARROQUIAS ===
const parroquiaStats = {};
const winnerStats = {}; // Ganador por parroquia

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
      PARROQUIA_ESTADO: r.PARROQUIA_ESTADO || 'SIN_ESTADO',
      VOTOS: 0,
      BLANCOS: 0,
      NULOS: 0
    };
    winnerStats[key] = {};
  }

  parroquiaStats[key].VOTOS += Number(r.VOTOS) || 0;
  parroquiaStats[key].BLANCOS += Number(r.BLANCOS) || 0;
  parroquiaStats[key].NULOS += Number(r.NULOS) || 0;

  const candKey = `${r.OP_SIGLAS}||${r.CANDIDATO_NOMBRE}`;
  winnerStats[key][candKey] = (winnerStats[key][candKey] || 0) + (Number(r.VOTOS) || 0);
});

const parroquiaData = Object.values(parroquiaStats).map(item => ({
  ...item,
  TOTAL: item.VOTOS + item.BLANCOS + item.NULOS
}));

// === GANADORES POR PARROQUIA ===
const ganadores = Object.entries(winnerStats).map(([key, candMap]) => {
  const [prov, canton, parroquia] = key.split('-');
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

// === RESUMEN GENERAL POR PARTIDO ===
const partidoStats = {};
let totalGeneralVotos = 0;

presidenciales.forEach(r => {
  const key = `${r.OP_SIGLAS}||${r.CANDIDATO_NOMBRE}`;
  const votos = Number(r.VOTOS) || 0;
  if (!partidoStats[key]) {
    partidoStats[key] = {
      sigla: r.OP_SIGLAS || 'SIN_PARTIDO',
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

// === EXPORTAR A EXCEL ===
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(parroquiaData), 'Parroquias');
xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(ganadores), 'GanadoresPorParroquia');
xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(partidoData), 'ResumenPorPartido');

// Crear carpeta si no existe
const outputDir = path.dirname(outputPrefix);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

xlsx.writeFile(workbook, `${outputPrefix}.xlsx`);
console.log(`✅ Archivo Excel generado: ${outputPrefix}.xlsx`);

// === EXPORTAR A JSON ===
fs.writeFileSync(`${outputPrefix}.json`, JSON.stringify(parroquiaData, null, 2));
fs.writeFileSync(`${outputPrefix.replace('parroquias', 'ganadores')}.json`, JSON.stringify(ganadores, null, 2));
fs.writeFileSync(`${outputPrefix.replace('parroquias', 'partidos')}.json`, JSON.stringify(partidoData, null, 2));

console.log(`✅ Archivos JSON generados:
  - ${outputPrefix}.json
  - ${outputPrefix.replace('parroquias', 'ganadores')}.json
  - ${outputPrefix.replace('parroquias', 'partidos')}.json`);

const { getRowsFromExcel } = require('./utils/excelReader');

const excelRelativePath = 'public/data/Segunda-Vuelta-2025.xlsx';
const provinciaCodigoBuscado = Number(process.argv[2]) || 5;

const rows = getRowsFromExcel(excelRelativePath);

// Filtrar registros de segunda vuelta (DIGNIDAD_CODIGO = 11) y por provincia
const filtrados = rows.filter(row =>
  row.PROVINCIA_CODIGO === provinciaCodigoBuscado &&
  Number(row.DIGNIDAD_CODIGO) === 11
);

// Inicializar contadores
let totalVotos = 0;
let totalBlancos = 0;
let totalNulos = 0;

const votosPorCandidato = {};

// Sumar votos válidos por candidato y totales
filtrados.forEach(row => {
  const candidato = (row.CANDIDATO_NOMBRE || 'DESCONOCIDO').trim();
  const votos = Number(row.VOTOS) || 0;

  votosPorCandidato[candidato] = (votosPorCandidato[candidato] || 0) + votos;
  totalVotos += votos;
  totalBlancos += Number(row.BLANCOS) || 0;
  totalNulos += Number(row.NULOS) || 0;
});

const totalGeneral = totalVotos + totalBlancos + totalNulos;

// Crear tabla de resultados
const resultados = Object.entries(votosPorCandidato)
  .map(([candidato, votos]) => ({
    candidato,
    votos,
    porcentaje: (votos / totalGeneral) * 100
  }))
  .sort((a, b) => b.votos - a.votos);

// Agregar blancos y nulos como "candidatos"
resultados.push(
  {
    candidato: 'VOTOS EN BLANCO',
    votos: totalBlancos,
    porcentaje: (totalBlancos / totalGeneral) * 100
  },
  {
    candidato: 'VOTOS NULOS',
    votos: totalNulos,
    porcentaje: (totalNulos / totalGeneral) * 100
  }
);

// Mostrar resultados
console.log(`🔍 Análisis para PROVINCIA_CODIGO = ${provinciaCodigoBuscado} (SEGUNDA VUELTA - DIGNIDAD_CODIGO = 11)`);
console.log(`Registros encontrados: ${filtrados.length}`);
console.log(`Total VOTOS   : ${totalVotos.toLocaleString()}`);
console.log(`Total BLANCOS : ${totalBlancos.toLocaleString()}`);
console.log(`Total NULOS   : ${totalNulos.toLocaleString()}`);
console.log(`🧮 Total General (VOTOS + BLANCOS + NULOS): ${totalGeneral.toLocaleString()}`);
console.log('='.repeat(80));
console.log(`📊 Resultados por candidato en la provincia ${provinciaCodigoBuscado}:\n`);
console.log('CANDIDATO                    | VOTOS       | % TOTAL');
console.log('-'.repeat(60));

let sumaTotal = 0;
resultados.forEach(({ candidato, votos, porcentaje }) => {
  sumaTotal += votos;
  console.log(
    `${candidato.padEnd(28)}| ${votos.toLocaleString().padStart(11)} | ${porcentaje.toFixed(2).padStart(6)}%`
  );
});

console.log('-'.repeat(60));
console.log(
  `${'TOTALES'.padEnd(28)}| ${sumaTotal.toLocaleString().padStart(11)} | ${(sumaTotal / totalGeneral * 100).toFixed(2).padStart(6)}%`
);
console.log('🚀 Proceso terminado');

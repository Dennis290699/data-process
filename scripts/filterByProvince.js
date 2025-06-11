const { getRowsFromExcel } = require('./utils/excelReader');

const excelRelativePath = 'Public/data/2025_1v.xlsx';
const provinciaCodigoBuscado = Number(process.argv[2]) || 5;

const rows = getRowsFromExcel(excelRelativePath);

// Filtrar registros para PRESIDENTE Y VICEPRESIDENTE en la provincia especificada
const filtrados = rows.filter(row =>
  row.PROVINCIA_CODIGO === provinciaCodigoBuscado &&
  row.DIGNIDAD_NOMBRE?.trim().toUpperCase() === 'PRESIDENTE Y VICEPRESIDENTE'
);

// Inicializar acumuladores
let totalVotos = 0;
let totalBlancos = 0;
let totalNulos = 0;

// Sumar votos, blancos y nulos
filtrados.forEach(row => {
  totalVotos += Number(row.VOTOS) || 0;
  totalBlancos += Number(row.BLANCOS) || 0;
  totalNulos += Number(row.NULOS) || 0;
});

const totalGeneral = totalVotos + totalBlancos + totalNulos;

console.log(`🔍 Análisis para PROVINCIA_CODIGO = ${provinciaCodigoBuscado} (PRESIDENTE Y VICEPRESIDENTE)`);
console.log(`Registros encontrados: ${filtrados.length}`);
console.log(`Total VOTOS   : ${totalVotos.toLocaleString()}`);
console.log(`Total BLANCOS : ${totalBlancos.toLocaleString()}`);
console.log(`Total NULOS   : ${totalNulos.toLocaleString()}`);
console.log(`🧮 Total General (VOTOS + BLANCOS + NULOS): ${totalGeneral.toLocaleString()}`);
console.log('='.repeat(80));

// Agrupar por OP_SIGLAS + CANDIDATO_NOMBRE
const votosPorPartido = {};

filtrados.forEach(row => {
  const sigla = (row.OP_SIGLAS || 'SIN_PARTIDO').trim();
  const candidato = (row.CANDIDATO_NOMBRE || 'DESCONOCIDO').trim();
  const votos = Number(row.VOTOS) || 0;

  const key = `${sigla}||${candidato}`;

  if (!votosPorPartido[key]) {
    votosPorPartido[key] = 0;
  }

  votosPorPartido[key] += votos;
});

// Ordenar resultados por votos descendentes
const resultados = Object.entries(votosPorPartido)
  .map(([key, votos]) => {
    const [sigla, candidato] = key.split('||');
    const porcentaje = (votos / totalGeneral) * 100;
    return { sigla, candidato, votos, porcentaje };
  })
  .sort((a, b) => b.votos - a.votos);

// Mostrar tabla de resultados
console.log(`📊 Resultados por partido y candidato en la provincia ${provinciaCodigoBuscado} (Presidenciales):\n`);
console.log('PARTIDO       | CANDIDATO                    | VOTOS       | % TOTAL');
console.log('-'.repeat(80));

let totalTabla = 0;
resultados.forEach(({ sigla, candidato, votos, porcentaje }) => {
  totalTabla += votos;
  console.log(
    `${sigla.padEnd(13)}| ${candidato.padEnd(28)}| ${votos.toLocaleString().padStart(11)} | ${porcentaje.toFixed(2).padStart(6)}%`
  );
});

// Mostrar total final de la tabla
console.log('-'.repeat(80));
console.log(
  `${'TOTALES'.padEnd(13)}| ${''.padEnd(28)}| ${totalTabla.toLocaleString().padStart(11)} | ${(totalTabla / totalGeneral * 100).toFixed(2).padStart(6)}%`
);

console.log('🚀 Proceso terminado');

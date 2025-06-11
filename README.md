# 📊 Procesador de Datos Electorales - Elecciones 2025 🇪🇨

Este proyecto tiene como objetivo procesar datos electorales provenientes de un archivo `.xlsx`, específicamente para la dignidad de **PRESIDENTE Y VICEPRESIDENTE**, filtrando por provincia y generando estadísticas agregadas como:

- Total de votos válidos
- Blancos y nulos
- Total general
- Resultados por partido y candidato
- Porcentaje sobre el total

---

## 📁 Estructura del Proyecto

```

data-process/
├── Public/
│   └── data/
│       └── 2025\_1v.xlsx  ← archivo original de datos (no debe modificarse)
├── scripts/
│   ├── filterByProvince.js  ← script principal para filtrar y mostrar resultados
│   ├── readHeaders.js       ← utilidad para explorar columnas del Excel
│   └── utils/
│       └── excelReader.js   ← función auxiliar para leer el Excel
├── package.json
├── package-lock.json
└── README.md  ← este archivo

````

---

## ⚙️ Requisitos

- Node.js (v16+ recomendado)
- npm

---

## 🧪 Instalación

1. Clona este repositorio:

```bash
git clone https://github.com/Dennis290699/data-process.git
cd data-process
````

2. Instala las dependencias:

```bash
npm install
```

3. Asegúrate de tener el archivo Excel en la siguiente ruta:

```
Public/data/2025_1v.xlsx
```

---

## 🚀 Ejecución

Para procesar los datos de una provincia específica, modifica el código en `filterByProvince.js`, cambiando el valor de `provinciaCodigoBuscado` por el código deseado (por ejemplo: `5` para Cotopaxi).

Luego ejecuta:

```bash
node scripts/filterByProvince.js
```

### 📌 Notas

* Solo se procesan registros cuya columna `DIGNIDAD_NOMBRE` sea **"PRESIDENTE Y VICEPRESIDENTE"**.
* Los resultados se ordenan por número de votos descendente.
* Se calcula el % total respecto al total general.

---

## 🧰 Scripts útiles

### Leer encabezados del Excel:

```bash
node scripts/readHeaders.js
```

Esto es útil si no estás seguro de cómo se llaman las columnas (por ejemplo: `PROVINCIA_CODIGO`, `DIGNIDAD_NOMBRE`, `VOTOS`, etc.).

---

## 📄 Licencia

Este proyecto es libre para uso académico y análisis electoral. Se recomienda respetar la fuente de los datos oficiales.

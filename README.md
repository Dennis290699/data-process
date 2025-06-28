# 📊 Procesador de Datos Electorales - Elecciones 2025 🇪🇨

Este proyecto tiene como objetivo procesar datos electorales provenientes de archivos `.xlsx`, específicamente para la dignidad de **PRESIDENTE Y VICEPRESIDENTE**, filtrando por provincia y generando estadísticas agregadas como:

- Total de votos válidos, blancos y nulos
- Resultados por partido y candidato
- Porcentaje de participación
- Ganadores por parroquia
- Exportación a `.xlsx` y `.json` organizados por vuelta y provincia

## 📁 Estructura del Proyecto

```

data-process/
├── public/
│   ├── data/
│   │   ├── 2025\_1v.xlsx
│   │   └── Segunda-Vuelta-2025.xlsx
│   └── output/
│       ├── primera-vuelta/
│       │   └── Provincia\_<CODIGO>/
│       │       ├── parroquias\_resultado\_prov\_<CODIGO>.json
│       │       ├── ganadores\_resultado\_prov\_<CODIGO>.json
│       │       ├── partidos\_resultado\_prov\_<CODIGO>.json
│       │       └── parroquias\_resultado\_prov\_<CODIGO>.xlsx
│       └── segunda-vuelta/
│           └── Provincia\_<CODIGO>/
│               ├── parroquias\_resultado\_prov\_<CODIGO>.json
│               ├── ganadores\_resultado\_prov\_<CODIGO>.json
│               ├── partidos\_resultado\_prov\_<CODIGO>.json
│               └── parroquias\_resultado\_prov\_<CODIGO>.xlsx
├── scripts/
│   ├── utils/
│   │   └── excelReader.js
│   ├── readHeaders.js
│   ├── primeraVueltaExplorar.js
│   ├── primeraVueltaExportar.js
│   ├── segundaVueltaExplorar.js
│   └── segundaVueltaExportar.js
├── package.json
└── README.md

````

## ⚙️ Requisitos

- Node.js (v16+ recomendado)
- npm

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

3. Asegúrate de tener los archivos `.xlsx` en:

```
public/data/2025_1v.xlsx
public/data/Segunda-Vuelta-2025.xlsx
```

## 🚀 Comandos disponibles

### 📌 Leer columnas del archivo Excel (útil para exploración inicial):

```bash
npm run headers
```

### 🔍 Exploración de resultados **sin generar archivos**

#### Primera vuelta:

```bash
npm run explorarPrimera -- <CODIGO_PROVINCIA>
```

#### Segunda vuelta:

```bash
npm run explorarSegunda -- <CODIGO_PROVINCIA>
```

Ejemplo:

```bash
npm run explorarSegunda -- 5
```

### 📤 Exportar resultados a JSON y Excel

#### Primera vuelta:

```bash
npm run exportarPrimera -- <CODIGO_PROVINCIA>
```

#### Segunda vuelta:

```bash
npm run exportarSegunda -- <CODIGO_PROVINCIA>
```

Esto generará los archivos:

* `.xlsx` con resumen por parroquia, ganadores por parroquia y resumen por partido.
* `.json` correspondientes, organizados en:

```
public/output/primera-vuelta/Provincia_<CODIGO>/
public/output/segunda-vuelta/Provincia_<CODIGO>/
```

Ejemplo:

```bash
npm run exportarSegunda -- 17
```

## 📌 Notas importantes

* Solo se procesan registros con `DIGNIDAD_NOMBRE = "PRESIDENTE Y VICEPRESIDENTE"`.
* El código de provincia se pasa como argumento. Ejemplo: `5` para Cotopaxi, `17` para Pichincha.
* El script detecta votos por partido y candidato agrupando por `OP_SIGLAS` y `CANDIDATO_NOMBRE`.
* Si un valor no existe, se asignan etiquetas como `SIN_PARTIDO` o `DESCONOCIDO`.
* Los archivos `.xlsx` se generan en `public/output/primera-vuelta/` y `public/output/segunda-vuelta/`.
* Los archivos `.json` se generan en `public/output/primera-vuelta/` y `public/output/segunda-vuelta/`.

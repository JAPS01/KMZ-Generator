Resumen
Crear una aplicación web progresiva (PWA) con React y Tailwind CSS para generar archivos KMZ de Google Earth desde el navegador. La app permitirá capturar fotos, extraer coordenadas GPS de metadatos EXIF, y exportar placemarks con imágenes comprimidas.
Estado Actual

Proyecto vacío (solo existe .claude/settings.local.json)
No hay estructura de React ni dependencias instaladas


Arquitectura de la Solución
Stack Tecnológico
TecnologíaVersiónPropósitoVite + React5.x + 18.xBundler rápido y framework UITailwind CSS3.xEstilos responsive mobile-firstexifreader4.xExtracción de metadatos GPSjszip3.xGeneración de archivos KMZlucide-reactlatestIconografía
Estructura de Archivos
/Proyecto Cables
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── icons/           # Iconos de Google Earth
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── CoordinateInput.jsx
    │   ├── PhotoUploader.jsx
    │   ├── PlacemarkForm.jsx
    │   ├── PlacemarkList.jsx
    │   ├── IconSelector.jsx
    │   ├── MapPreview.jsx
    │   └── ExportButton.jsx
    └── utils/
        ├── geoConverters.js
        ├── kmlGenerator.js
        ├── exifReader.js
        └── imageCompressor.js

Plan de Implementación
Fase 1: Configuración del Proyecto

Crear proyecto con Vite + React
Instalar dependencias (tailwindcss, exifreader, jszip, lucide-react)
Configurar Tailwind CSS con configuración mobile-first
Crear estructura de carpetas

Fase 2: Utilidades Core

geoConverters.js - Conversión GMS ↔ Decimal

dmsToDecimal(degrees, minutes, seconds, direction)
decimalToDms(decimal)
Validación de rangos (lat: -90 a 90, lon: -180 a 180)


exifReader.js - Extracción de GPS

Wrapper de ExifReader para obtener GPSLatitude, GPSLongitude
Manejo de fotos sin metadatos GPS


imageCompressor.js - Compresión de imágenes

Redimensionar a max 1024px de lado mayor
Calidad JPEG 80%
Uso de Canvas API


kmlGenerator.js - Generador de KML/KMZ

Construcción del XML KML con placemarks
Empaquetado con JSZip (doc.kml + files/)



Fase 3: Componentes UI

CoordinateInput.jsx

Toggle Decimal/GMS
Inputs para lat/lon en ambos formatos
Conversión en tiempo real
Validación visual (bordes rojos si inválido)


PhotoUploader.jsx

Input file con capture="environment" para móvil
Drag & drop para escritorio
Preview de imagen
Extracción automática de EXIF
Indicador de "GPS encontrado" o "Sin GPS"


PlacemarkForm.jsx

Campos: nombre, descripción
Integración de CoordinateInput
Integración de PhotoUploader
Integración de IconSelector
Botón "Agregar Punto"


IconSelector.jsx

Grid de iconos de Google Earth
Selección visual con borde destacado
Iconos principales: pushpin, star, flag, etc.


PlacemarkList.jsx

Lista de puntos agregados
Miniatura de foto, nombre, coordenadas
Botones editar/eliminar
Vista grid en móvil, lista en desktop


ExportButton.jsx

Genera el KMZ
Descarga automática del archivo
Indicador de progreso durante empaquetado



Fase 4: App Principal y Estado

App.jsx

Estado global: array de placemarks
Layout responsive:

Mobile: formulario arriba, lista abajo
Desktop: panel izquierdo (formulario), panel derecho (lista + preview)


Manejo de CRUD de placemarks



Fase 5: PWA Completa (Offline-First)

manifest.json - Metadatos de la app

name, short_name, icons (192x192, 512x512)
start_url, display: standalone
theme_color, background_color


Service Worker (sw.js)

Estrategia cache-first para assets estáticos
Pre-cache de HTML, CSS, JS en install
Fallback offline funcional


Registro del SW en main.jsx

navigator.serviceWorker.register()


Meta tags en index.html

viewport, theme-color
apple-mobile-web-app-capable
Link al manifest




Detalles Técnicos Clave
Formato KML para Placemarks con Imagen
xml<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Proyecto</name>
    <Placemark>
      <name>Punto 1</name>
      <description><![CDATA[
        <img src="files/foto1.jpg" width="400"/>
        <p>Descripción del punto</p>
      ]]></description>
      <Point>
        <coordinates>-69.123456,18.456789,0</coordinates>
      </Point>
      <Style>
        <IconStyle>
          <Icon><href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href></Icon>
        </IconStyle>
      </Style>
    </Placemark>
  </Document>
</kml>
Conversión GMS a Decimal
javascriptdecimal = degrees + (minutes / 60) + (seconds / 3600)
// Negativo si direction es S o W
Estructura KMZ
archivo.kmz (ZIP)
├── doc.kml
└── files/
    ├── foto1.jpg
    └── foto2.jpg

Verificación
Pruebas Manuales

Subir foto con GPS: Verificar que coordenadas se extraen automáticamente
Subir foto sin GPS: Verificar que permite entrada manual
Conversión GMS: Ingresar 18°27'30"N y verificar que convierte a 18.458333
Exportar KMZ: Descargar y abrir en Google Earth Pro
Responsive: Probar en viewport móvil (375px) y desktop (1200px)

Comando de Desarrollo
bashnpm run dev
Build de Producción
bashnpm run build

Archivos Críticos a Crear

package.json - Dependencias
vite.config.js - Configuración Vite
tailwind.config.js - Configuración Tailwind
src/utils/kmlGenerator.js - Core de generación KMZ
src/utils/geoConverters.js - Lógica de coordenadas
src/App.jsx - Componente principal con estado
src/components/PlacemarkForm.jsx - Formulario principal
src/components/ExportButton.jsx - Exportación KMZ
public/manifest.json - Configuración PWA
public/sw.js - Service Worker para offline
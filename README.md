# KMZ Generator PWA

Aplicación web progresiva (PWA) para generar archivos KMZ de Google Earth desde el navegador. Permite capturar fotos, extraer coordenadas GPS de metadatos EXIF, y exportar placemarks con imágenes comprimidas.

## 🚀 Características

- ✅ **Captura de fotos con GPS**: Toma fotos directamente desde el móvil y extrae coordenadas GPS automáticamente
- ✅ **Entrada manual de coordenadas**: Soporta formato Decimal y GMS (Grados-Minutos-Segundos)
- ✅ **Compresión de imágenes**: Optimiza automáticamente las imágenes para reducir el tamaño del archivo
- ✅ **Exportación KMZ**: Genera archivos KMZ compatibles con Google Earth
- ✅ **Funciona offline**: PWA con service worker para uso sin conexión
- ✅ **Responsive**: Diseño mobile-first que funciona en todos los dispositivos
- ✅ **Iconos personalizables**: Selecciona entre múltiples iconos de Google Earth

## 📋 Requisitos

- Node.js (versión 16 o superior)
- npm o yarn

## 🛠️ Instalación

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador**:
   - La aplicación se abrirá automáticamente en `http://localhost:3000`

## 📦 Build de Producción

Para crear una versión optimizada para producción:

```bash
npm run build
```

Los archivos generados estarán en la carpeta `dist/`.

Para previsualizar el build:

```bash
npm run preview
```

## 📱 Uso

1. **Agregar un punto**:
   - Ingresa el nombre del punto
   - (Opcional) Agrega una descripción
   - Toma una foto o sube una imagen
   - Si la foto tiene GPS, las coordenadas se extraerán automáticamente
   - Si no, ingresa las coordenadas manualmente en formato Decimal o GMS
   - Selecciona un icono para el marcador
   - Haz clic en "Agregar Punto"

2. **Editar/Eliminar puntos**:
   - Usa los botones de editar/eliminar en cada punto de la lista

3. **Exportar KMZ**:
   - Haz clic en "Exportar KMZ" para descargar el archivo
   - Abre el archivo en Google Earth Pro o Google Earth Web

## 🏗️ Estructura del Proyecto

```
/
├── public/
│   ├── manifest.json       # Configuración PWA
│   ├── sw.js              # Service Worker
│   └── icons/             # Iconos de la aplicación (crear según ICONOS_NECESARIOS.txt)
├── src/
│   ├── components/
│   │   ├── CoordinateInput.jsx    # Input de coordenadas con toggle Decimal/GMS
│   │   ├── PhotoUploader.jsx      # Subida de fotos con extracción EXIF
│   │   ├── IconSelector.jsx       # Selector de iconos de Google Earth
│   │   ├── PlacemarkForm.jsx      # Formulario principal
│   │   ├── PlacemarkList.jsx      # Lista de puntos agregados
│   │   └── ExportButton.jsx       # Botón de exportación KMZ
│   ├── utils/
│   │   ├── geoConverters.js       # Conversión Decimal ↔ GMS
│   │   ├── exifReader.js          # Extracción de GPS de EXIF
│   │   ├── imageCompressor.js     # Compresión de imágenes
│   │   └── kmlGenerator.js        # Generación de archivos KML/KMZ
│   ├── App.jsx            # Componente principal
│   ├── main.jsx           # Punto de entrada
│   └── index.css          # Estilos globales
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── ICONOS_NECESARIOS.txt  # Lista de iconos a crear
```

## 🎨 Iconos Necesarios

Consulta el archivo `ICONOS_NECESARIOS.txt` para ver la lista completa de iconos que necesitas crear para la PWA.

Los iconos principales son:
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)
- `vite.svg` (favicon)

## 🌐 Tecnologías Utilizadas

- **React 18**: Framework de UI
- **Vite 5**: Build tool y dev server
- **Tailwind CSS 3**: Framework de estilos
- **exifr**: Extracción de metadatos GPS (moderna y confiable)
- **JSZip**: Generación de archivos KMZ
- **Lucide React**: Iconografía

## 📝 Formato KMZ

El archivo KMZ generado tiene la siguiente estructura:

```
archivo.kmz (ZIP)
├── doc.kml              # Archivo KML con los placemarks
└── files/
    ├── foto1.jpg        # Imágenes comprimidas
    └── foto2.jpg
```

## 🧪 Pruebas

Para probar la aplicación:

1. Sube una foto con GPS y verifica que las coordenadas se extraen automáticamente
2. Sube una foto sin GPS y verifica que permite entrada manual
3. Prueba la conversión entre formatos Decimal y GMS
4. Exporta un KMZ y ábrelo en Google Earth
5. Prueba la aplicación en diferentes tamaños de pantalla (móvil y desktop)

## 🔧 Solución de Problemas

### Node.js no está instalado
Si recibes errores de que `npm` o `node` no se reconocen:
1. Descarga e instala Node.js desde https://nodejs.org/
2. Reinicia tu terminal/PowerShell
3. Verifica la instalación: `node --version`

### Error al instalar dependencias
```bash
# Limpia la caché de npm
npm cache clean --force

# Elimina node_modules y package-lock.json
rm -rf node_modules package-lock.json

# Reinstala
npm install
```

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso personal y comercial.

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerencias o mejoras.

---

**Desarrollado con ❤️ para facilitar la creación de archivos KMZ para Google Earth**

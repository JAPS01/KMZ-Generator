import JSZip from 'jszip';

/**
 * Genera un archivo KMZ (KML comprimido) con placemarks e imágenes
 */

/**
 * Genera y descarga un archivo KMZ
 * @param {Array} placemarks - Array de objetos placemark
 * @param {string} projectName - Nombre del proyecto
 * @returns {Promise<Blob>} Archivo KMZ como Blob
 */
export async function generateKMZ(placemarks, projectName = 'Proyecto') {
  const zip = new JSZip();

  // Generar el contenido KML
  const kmlContent = generateKML(placemarks, projectName);
  zip.file('doc.kml', kmlContent);

  // Agregar imágenes a la carpeta files/
  const filesFolder = zip.folder('files');

  for (let i = 0; i < placemarks.length; i++) {
    const placemark = placemarks[i];
    if (placemark.image) {
      const filename = `foto${i + 1}.jpg`;
      filesFolder.file(filename, placemark.image);
    }
  }

  // Generar el archivo ZIP (KMZ)
  const kmzBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6
    }
  });

  return kmzBlob;
}

/**
 * Genera el contenido XML del archivo KML con placemarks agrupados por icono
 * @param {Array} placemarks - Array de placemarks
 * @param {string} projectName - Nombre del proyecto
 * @returns {string} Contenido KML en formato XML
 */
function generateKML(placemarks, projectName) {
  const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(projectName)}</name>
    <description>Generado con KMZ Generator PWA</description>`;

  const kmlFooter = `
  </Document>
</kml>`;

  // Agrupar placemarks por tipo de icono
  const groupedByIcon = groupPlacemarksByIcon(placemarks);

  // Generar carpetas (folders) para cada tipo de icono
  const folderElements = Object.entries(groupedByIcon).map(([iconType, iconPlacemarks]) => {
    const iconName = getIconDisplayName(iconType);
    return generateFolderXML(iconName, iconPlacemarks, iconType);
  }).join('\n');

  return kmlHeader + '\n' + folderElements + kmlFooter;
}

/**
 * Agrupa placemarks por tipo de icono
 * @param {Array} placemarks - Array de placemarks
 * @returns {Object} Objeto con placemarks agrupados por icono
 */
function groupPlacemarksByIcon(placemarks) {
  const grouped = {};

  placemarks.forEach((pm, index) => {
    const iconType = pm.icon || 'pushpin';
    if (!grouped[iconType]) {
      grouped[iconType] = [];
    }
    grouped[iconType].push({ ...pm, originalIndex: index });
  });

  return grouped;
}

/**
 * Obtiene el nombre de visualización del icono
 * @param {string} iconType - Tipo de icono
 * @returns {string} Nombre para mostrar
 */
function getIconDisplayName(iconType) {
  const nameMap = {
    'pushpin': 'Pins',
    'star': 'Estrellas',
    'flag': 'Banderas',
    'placemark_circle': 'Círculos',
    'target': 'Objetivos',
    'square': 'Cuadrados',
    'triangle': 'Triángulos',
    'camera': 'Cámaras',
    'bird': 'Aves',
    'tree': 'Árboles',
  };

  return nameMap[iconType] || 'Otros';
}

/**
 * Genera el XML de una carpeta (folder) con sus placemarks
 * @param {string} folderName - Nombre de la carpeta
 * @param {Array} placemarks - Placemarks de esta carpeta
 * @param {string} iconType - Tipo de icono
 * @returns {string} XML de la carpeta
 */
function generateFolderXML(folderName, placemarks, iconType) {
  const placemarkElements = placemarks.map((pm) => {
    return generatePlacemarkXML(pm, pm.originalIndex);
  }).join('\n');

  return `    <Folder>
      <name>${escapeXml(folderName)}</name>
      <description>Puntos con icono: ${escapeXml(folderName)}</description>
${placemarkElements}
    </Folder>`;
}

/**
 * Genera el XML de un placemark individual
 * @param {object} placemark - Objeto placemark
 * @param {number} index - Índice del placemark
 * @returns {string} XML del placemark
 */
function generatePlacemarkXML(placemark, index) {
  const { name, description, latitude, longitude, icon, image } = placemark;

  // Construir la descripción con imagen si existe
  let descriptionHTML = '';
  if (image) {
    descriptionHTML += `<img src="files/foto${index + 1}.jpg" width="400"/><br/>`;
  }
  if (description) {
    descriptionHTML += `<p>${escapeXml(description)}</p>`;
  }

  // Seleccionar icono de Google Earth
  const iconUrl = getGoogleEarthIconUrl(icon || 'pushpin');

  return `      <Placemark>
        <name>${escapeXml(name)}</name>
        <description><![CDATA[
          ${descriptionHTML}
        ]]></description>
        <Point>
          <coordinates>${longitude},${latitude},0</coordinates>
        </Point>
        <Style>
          <IconStyle>
            <Icon>
              <href>${iconUrl}</href>
            </Icon>
          </IconStyle>
        </Style>
      </Placemark>`;
}

/**
 * Obtiene la URL del icono de Google Earth
 * @param {string} iconType - Tipo de icono
 * @returns {string} URL del icono
 */
function getGoogleEarthIconUrl(iconType) {
  const iconMap = {
    'pushpin': 'http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png',
    'star': 'http://maps.google.com/mapfiles/kml/shapes/star.png',
    'flag': 'http://maps.google.com/mapfiles/kml/shapes/flag.png',
    'placemark_circle': 'http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png',
    'target': 'http://maps.google.com/mapfiles/kml/shapes/target.png',
    'square': 'http://maps.google.com/mapfiles/kml/shapes/placemark_square.png',
    'triangle': 'http://maps.google.com/mapfiles/kml/shapes/triangle.png',
    'camera': 'http://maps.google.com/mapfiles/kml/shapes/camera.png',
    'bird': 'http://maps.google.com/mapfiles/kml/pal4/icon56.png',
    'tree': 'http://maps.google.com/mapfiles/kml/pal4/icon50.png',
  };

  return iconMap[iconType] || iconMap['pushpin'];
}

/**
 * Escapa caracteres especiales para XML
 * @param {string} text - Texto a escapar
 * @returns {string} Texto escapado
 */
function escapeXml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Descarga un archivo KMZ
 * @param {Blob} kmzBlob - Blob del archivo KMZ
 * @param {string} filename - Nombre del archivo
 */
export function downloadKMZ(kmzBlob, filename = 'proyecto.kmz') {
  const url = URL.createObjectURL(kmzBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

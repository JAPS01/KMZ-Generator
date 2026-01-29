import JSZip from 'jszip';

/**
 * Parsea un archivo KMZ para unificación
 * @param {File} file - Archivo KMZ
 * @returns {Promise<{placemarks: Array, images: Object}>}
 */
export async function parseKMZForMerge(file) {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);

    // Buscar el archivo KML
    let kmlFile = null;
    contents.forEach((relativePath, zipEntry) => {
        if (relativePath.endsWith('.kml')) {
            kmlFile = zipEntry;
        }
    });

    if (!kmlFile) {
        throw new Error('No se encontró archivo KML en el KMZ');
    }

    // Leer el KML
    const kmlContent = await kmlFile.async('string');

    // Parsear XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlContent, 'text/xml');

    // Extraer imágenes del archivo
    const images = {};
    for (const [path, entry] of Object.entries(contents.files)) {
        if (!entry.dir && (path.match(/\.(jpg|jpeg|png|gif)$/i))) {
            images[path] = await entry.async('blob');
        }
    }

    // Extraer placemarks
    const placemarks = [];
    const placemarkElements = xmlDoc.getElementsByTagName('Placemark');

    for (let i = 0; i < placemarkElements.length; i++) {
        const pm = placemarkElements[i];

        // Nombre
        const nameEl = pm.getElementsByTagName('name')[0];
        const name = nameEl ? nameEl.textContent : `Punto ${i + 1}`;

        // Descripción
        const descEl = pm.getElementsByTagName('description')[0];
        const description = descEl ? descEl.textContent : '';

        // Coordenadas
        const coordEl = pm.getElementsByTagName('coordinates')[0];
        if (!coordEl) continue;

        const coords = coordEl.textContent.trim().split(',');
        const longitude = parseFloat(coords[0]);
        const latitude = parseFloat(coords[1]);

        // Icono
        const iconEl = pm.getElementsByTagName('href')[0];
        let icon = 'pushpin';
        let iconUrl = '';
        if (iconEl) {
            iconUrl = iconEl.textContent;
            icon = detectIconType(iconUrl);
        }

        // Buscar imágenes referenciadas en la descripción
        let imageRef = null;
        const imgMatch = description.match(/src="([^"]+\.(jpg|jpeg|png|gif))"/i);
        if (imgMatch) {
            imageRef = imgMatch[1];
        }

        placemarks.push({
            name,
            description,
            latitude,
            longitude,
            icon,
            iconUrl,
            imageRef,
            sourceFile: file.name
        });
    }

    return { placemarks, images };
}

/**
 * Detecta el tipo de icono basado en la URL
 */
function detectIconType(url) {
    if (url.includes('star')) return 'star';
    if (url.includes('flag')) return 'flag';
    if (url.includes('circle')) return 'placemark_circle';
    if (url.includes('target')) return 'target';
    if (url.includes('square')) return 'square';
    if (url.includes('triangle')) return 'triangle';
    if (url.includes('camera')) return 'camera';
    if (url.includes('icon56')) return 'bird';
    if (url.includes('icon50')) return 'tree';
    return 'pushpin';
}

/**
 * Obtiene el nombre de visualización del icono
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
 * Obtiene la URL del icono de Google Earth
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
 * Escapa caracteres XML
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
 * Unifica múltiples archivos KMZ en uno solo
 * @param {Array} kmzFiles - Array de objetos con placemarks e imágenes
 * @param {string} outputName - Nombre del archivo de salida
 * @returns {Promise<Blob>} Archivo KMZ unificado
 */
export async function mergeKMZFiles(kmzFiles, outputName) {
    const zip = new JSZip();
    const filesFolder = zip.folder('files');

    // Combinar todos los placemarks
    const allPlacemarks = [];
    let imageIndex = 0;
    const imageMapping = {}; // Mapeo de ruta original a nueva ruta

    for (const kmzFile of kmzFiles) {
        for (const placemark of kmzFile.placemarks) {
            const newPlacemark = { ...placemark };

            // Si tiene imagen, copiarla con un nuevo nombre único
            if (placemark.imageRef && kmzFile.images) {
                // Buscar la imagen en el archivo original
                const originalPath = placemark.imageRef;
                let imageBlob = null;

                // Buscar la imagen por diferentes rutas posibles
                for (const [path, blob] of Object.entries(kmzFile.images)) {
                    if (path.endsWith(originalPath) || originalPath.endsWith(path.split('/').pop())) {
                        imageBlob = blob;
                        break;
                    }
                }

                if (imageBlob) {
                    const newImageName = `image_${imageIndex++}.jpg`;
                    filesFolder.file(newImageName, imageBlob);
                    newPlacemark.newImageRef = `files/${newImageName}`;
                }
            }

            allPlacemarks.push(newPlacemark);
        }
    }

    // Agrupar placemarks por icono
    const groupedByIcon = {};
    allPlacemarks.forEach((pm, index) => {
        const iconType = pm.icon || 'pushpin';
        if (!groupedByIcon[iconType]) {
            groupedByIcon[iconType] = [];
        }
        groupedByIcon[iconType].push({ ...pm, mergedIndex: index });
    });

    // Generar KML
    const kmlContent = generateMergedKML(groupedByIcon, outputName);
    zip.file('doc.kml', kmlContent);

    // Generar KMZ
    const kmzBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
    });

    return kmzBlob;
}

/**
 * Genera el contenido KML para el archivo unificado
 */
function generateMergedKML(groupedByIcon, projectName) {
    const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(projectName)}</name>
    <description>Archivo KMZ unificado - Generado con KMZ Generator PWA</description>`;

    const kmlFooter = `
  </Document>
</kml>`;

    // Generar carpetas por tipo de icono
    const folderElements = Object.entries(groupedByIcon).map(([iconType, placemarks]) => {
        const iconName = getIconDisplayName(iconType);
        const placemarkElements = placemarks.map((pm) => {
            return generateMergedPlacemarkXML(pm, iconType);
        }).join('\n');

        return `    <Folder>
      <name>${escapeXml(iconName)}</name>
      <description>Puntos con icono: ${escapeXml(iconName)} (${placemarks.length} puntos)</description>
${placemarkElements}
    </Folder>`;
    }).join('\n');

    return kmlHeader + '\n' + folderElements + kmlFooter;
}

/**
 * Genera el XML de un placemark individual para el archivo unificado
 */
function generateMergedPlacemarkXML(placemark, iconType) {
    const { name, description, latitude, longitude, newImageRef } = placemark;

    // Construir descripción con imagen si existe
    let descriptionContent = '';
    if (newImageRef) {
        descriptionContent += `<img src="${newImageRef}" width="400"/><br/>`;
    }

    // Limpiar la descripción original de referencias de imagen antiguas y CDATA
    let cleanDescription = description || '';
    cleanDescription = cleanDescription.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '');
    cleanDescription = cleanDescription.replace(/<img[^>]*>/gi, '');
    cleanDescription = cleanDescription.trim();

    if (cleanDescription) {
        // Si ya tiene tags HTML, usarlo directamente
        if (cleanDescription.includes('<') && cleanDescription.includes('>')) {
            descriptionContent += cleanDescription;
        } else {
            descriptionContent += `<p>${escapeXml(cleanDescription)}</p>`;
        }
    }

    const iconUrl = getGoogleEarthIconUrl(iconType);

    return `      <Placemark>
        <name>${escapeXml(name)}</name>
        <description><![CDATA[
          ${descriptionContent}
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

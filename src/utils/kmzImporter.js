import JSZip from 'jszip';

/**
 * Importa y parsea un archivo KMZ existente
 * @param {File} file - Archivo KMZ
 * @returns {Promise<Array>} Array de placemarks
 */
export async function importKMZ(file) {
    try {
        const zip = new JSZip();
        const contents = await zip.loadAsync(file);

        // Buscar el archivo KML dentro del KMZ
        let kmlFile = null;
        contents.forEach((relativePath, zipEntry) => {
            if (relativePath.endsWith('.kml')) {
                kmlFile = zipEntry;
            }
        });

        if (!kmlFile) {
            throw new Error('No se encontró archivo KML en el KMZ');
        }

        // Leer el contenido del KML
        const kmlContent = await kmlFile.async('string');

        // Parsear el XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(kmlContent, 'text/xml');

        // Extraer placemarks
        const placemarks = [];
        const placemarkElements = xmlDoc.getElementsByTagName('Placemark');

        for (let i = 0; i < placemarkElements.length; i++) {
            const pm = placemarkElements[i];

            // Extraer nombre
            const nameEl = pm.getElementsByTagName('name')[0];
            const name = nameEl ? nameEl.textContent : `Punto ${i + 1}`;

            // Extraer descripción
            const descEl = pm.getElementsByTagName('description')[0];
            const description = descEl ? descEl.textContent : '';

            // Extraer coordenadas
            const coordEl = pm.getElementsByTagName('coordinates')[0];
            if (!coordEl) continue;

            const coords = coordEl.textContent.trim().split(',');
            const longitude = parseFloat(coords[0]);
            const latitude = parseFloat(coords[1]);

            // Extraer icono
            const iconEl = pm.getElementsByTagName('href')[0];
            let icon = 'pushpin';
            if (iconEl) {
                const iconUrl = iconEl.textContent;
                icon = detectIconType(iconUrl);
            }

            // Intentar extraer imagen si existe
            let image = null;
            let imagePreview = null;

            // Buscar imagen en el KMZ
            const imageName = `images/image_${i}.jpg`;
            if (contents.files[imageName]) {
                const imageBlob = await contents.files[imageName].async('blob');
                image = imageBlob;
                imagePreview = URL.createObjectURL(imageBlob);
            }

            placemarks.push({
                id: Date.now() + i,
                name,
                description,
                latitude,
                longitude,
                icon,
                image,
                imagePreview
            });
        }

        console.log('Placemarks importados:', placemarks);
        return placemarks;

    } catch (error) {
        console.error('Error al importar KMZ:', error);
        throw error;
    }
}

/**
 * Detecta el tipo de icono basado en la URL
 * @param {string} url - URL del icono
 * @returns {string} Tipo de icono
 */
function detectIconType(url) {
    if (url.includes('campground')) return 'campground';
    if (url.includes('ranger_station')) return 'ranger_station';
    if (url.includes('parks')) return 'parks';
    if (url.includes('pushpin')) return 'pushpin';
    return 'pushpin';
}

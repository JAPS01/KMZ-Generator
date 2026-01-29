import exifr from 'exifr';

/**
 * Extrae coordenadas GPS de los metadatos EXIF de una imagen usando exifr
 * @param {File} file - Archivo de imagen
 * @returns {Promise<{latitude: number, longitude: number} | null>} Coordenadas o null si no hay GPS
 */
export async function extractGPSFromImage(file) {
    try {
        console.log('Iniciando extracción de GPS...');

        // Extraer datos GPS usando exifr
        const gps = await exifr.gps(file);

        console.log('Datos GPS extraídos:', gps);

        if (!gps) {
            console.log('No se encontraron datos GPS en la imagen');
            return null;
        }

        // exifr ya devuelve las coordenadas en formato decimal
        const { latitude, longitude } = gps;

        if (latitude === undefined || longitude === undefined) {
            console.log('Coordenadas GPS incompletas');
            return null;
        }

        console.log('Latitude:', latitude);
        console.log('Longitude:', longitude);

        return {
            latitude,
            longitude
        };
    } catch (error) {
        console.error('Error al extraer GPS:', error);
        return null;
    }
}

/**
 * Verifica si un archivo tiene metadatos GPS
 * @param {File} file - Archivo de imagen
 * @returns {Promise<boolean>} true si tiene GPS
 */
export async function hasGPSData(file) {
    const coords = await extractGPSFromImage(file);
    return coords !== null;
}

/**
 * Conversión entre coordenadas Decimales y Grados-Minutos-Segundos (DMS)
 */

/**
 * Convierte coordenadas DMS a formato decimal
 * @param {number} degrees - Grados
 * @param {number} minutes - Minutos
 * @param {number} seconds - Segundos
 * @param {string} direction - Dirección (N, S, E, W)
 * @returns {number} Coordenada en formato decimal
 */
export function dmsToDecimal(degrees, minutes, seconds, direction) {
    let decimal = Math.abs(degrees) + minutes / 60 + seconds / 3600;

    // Hacer negativo si es Sur u Oeste
    if (direction === 'S' || direction === 'W') {
        decimal = -decimal;
    }

    return decimal;
}

/**
 * Convierte coordenadas decimales a formato DMS
 * @param {number} decimal - Coordenada en formato decimal
 * @param {boolean} isLatitude - true si es latitud, false si es longitud
 * @returns {object} Objeto con degrees, minutes, seconds, direction
 */
export function decimalToDms(decimal, isLatitude = true) {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesDecimal = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = ((minutesDecimal - minutes) * 60).toFixed(2);

    let direction;
    if (isLatitude) {
        direction = decimal >= 0 ? 'N' : 'S';
    } else {
        direction = decimal >= 0 ? 'E' : 'W';
    }

    return {
        degrees,
        minutes,
        seconds: parseFloat(seconds),
        direction
    };
}

/**
 * Valida si una latitud está en el rango válido (-90 a 90)
 * @param {number} lat - Latitud a validar
 * @returns {boolean} true si es válida
 */
export function isValidLatitude(lat) {
    return !isNaN(lat) && lat >= -90 && lat <= 90;
}

/**
 * Valida si una longitud está en el rango válido (-180 a 180)
 * @param {number} lon - Longitud a validar
 * @returns {boolean} true si es válida
 */
export function isValidLongitude(lon) {
    return !isNaN(lon) && lon >= -180 && lon <= 180;
}

/**
 * Formatea coordenadas decimales a string con precisión
 * @param {number} coord - Coordenada decimal
 * @param {number} precision - Número de decimales (default: 6)
 * @returns {string} Coordenada formateada
 */
export function formatDecimal(coord, precision = 6) {
    return parseFloat(coord).toFixed(precision);
}

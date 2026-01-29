/**
 * Comprime y redimensiona imágenes para optimizar el tamaño del KMZ
 */

/**
 * Comprime una imagen a un tamaño máximo y calidad específica
 * @param {File} file - Archivo de imagen original
 * @param {number} maxSize - Tamaño máximo del lado mayor en píxeles (default: 1024)
 * @param {number} quality - Calidad JPEG 0-1 (default: 0.8)
 * @returns {Promise<Blob>} Imagen comprimida como Blob
 */
export async function compressImage(file, maxSize = 1024, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                // Calcular nuevas dimensiones manteniendo aspect ratio
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }

                // Crear canvas para redimensionar
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir a blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Error al comprimir imagen'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = () => {
                reject(new Error('Error al cargar imagen'));
            };

            img.src = e.target.result;
        };

        reader.onerror = () => {
            reject(new Error('Error al leer archivo'));
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Obtiene las dimensiones de una imagen
 * @param {File} file - Archivo de imagen
 * @returns {Promise<{width: number, height: number}>} Dimensiones
 */
export async function getImageDimensions(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                resolve({
                    width: img.width,
                    height: img.height
                });
            };

            img.onerror = () => {
                reject(new Error('Error al cargar imagen'));
            };

            img.src = e.target.result;
        };

        reader.onerror = () => {
            reject(new Error('Error al leer archivo'));
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Convierte un Blob a base64
 * @param {Blob} blob - Blob a convertir
 * @returns {Promise<string>} String en base64
 */
export async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

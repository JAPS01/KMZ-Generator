import React, { useState, useRef, useEffect } from 'react';
import { Loader2, X, Upload, Image as ImageIcon } from 'lucide-react';
import { extractGPSFromImage } from '../utils/exifReader';
import { compressImage } from '../utils/imageCompressor';

const CATEGORIES = [
    {
        id: 'cableado',
        icon: 'pushpin',
        label: 'Cableado',
        iconUrl: 'http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png',
        defaultName: 'Cableado desordenado'
    },
    {
        id: 'arbol',
        icon: 'parks',
        label: 'Árbol',
        iconUrl: 'http://maps.google.com/mapfiles/kml/shapes/parks.png',
        defaultName: 'Arbol/Rama En el cableado'
    },
    {
        id: 'ave',
        icon: 'campground',
        label: 'Ave',
        iconUrl: 'http://maps.google.com/mapfiles/kml/shapes/campground.png',
        defaultName: 'Nido en poste o Cableado'
    },
    {
        id: 'casa',
        icon: 'ranger_station',
        label: 'Casa',
        iconUrl: 'http://maps.google.com/mapfiles/kml/shapes/ranger_station.png',
        defaultName: 'Cableado cercano a casas'
    }
];

export default function BatchUploader({ onAddPlacemarks }) {
    const [categoryData, setCategoryData] = useState({
        cableado: { customName: '', images: [], previews: [] },
        arbol: { customName: '', images: [], previews: [] },
        ave: { customName: '', images: [], previews: [] },
        casa: { customName: '', images: [], previews: [] }
    });

    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState({
        current: 0,
        total: 0,
        currentFile: '',
        errors: []
    });

    const fileInputRefs = {
        cableado: useRef(null),
        arbol: useRef(null),
        ave: useRef(null),
        casa: useRef(null)
    };

    // Cleanup: revocar URLs de previews al desmontar
    useEffect(() => {
        return () => {
            Object.values(categoryData).forEach(cat => {
                cat.previews.forEach(url => {
                    if (url.startsWith('blob:')) {
                        URL.revokeObjectURL(url);
                    }
                });
            });
        };
    }, []);

    const handleImageSelect = async (categoryId, event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        // Filtrar solo imágenes
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            alert('Por favor selecciona solo archivos de imagen');
            return;
        }

        // Crear previews
        const newPreviews = [];
        for (const file of imageFiles) {
            const reader = new FileReader();
            const preview = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
            newPreviews.push(preview);
        }

        // Actualizar estado
        setCategoryData(prev => ({
            ...prev,
            [categoryId]: {
                ...prev[categoryId],
                images: [...prev[categoryId].images, ...imageFiles],
                previews: [...prev[categoryId].previews, ...newPreviews]
            }
        }));

        // Reset input
        event.target.value = '';
    };

    const handleRemoveImage = (categoryId, index) => {
        setCategoryData(prev => {
            const category = prev[categoryId];
            const preview = category.previews[index];

            // Revocar URL del preview
            if (preview && preview.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
            }

            return {
                ...prev,
                [categoryId]: {
                    ...category,
                    images: category.images.filter((_, i) => i !== index),
                    previews: category.previews.filter((_, i) => i !== index)
                }
            };
        });
    };

    const handleNameChange = (categoryId, value) => {
        setCategoryData(prev => ({
            ...prev,
            [categoryId]: {
                ...prev[categoryId],
                customName: value
            }
        }));
    };

    const handleProcessAll = async () => {
        // Contar total de imágenes
        const totalImages = Object.values(categoryData).reduce(
            (sum, cat) => sum + cat.images.length,
            0
        );

        if (totalImages === 0) {
            alert('No hay imágenes para procesar. Agrega al menos una imagen en alguna categoría.');
            return;
        }

        setProcessing(true);
        setProgress({ current: 0, total: totalImages, currentFile: '', errors: [] });

        const placemarks = [];
        let currentIndex = 0;

        // Procesar cada categoría
        for (const category of CATEGORIES) {
            const categoryId = category.id;
            const data = categoryData[categoryId];

            if (data.images.length === 0) continue;

            const categoryName = data.customName || category.defaultName;

            // Procesar cada imagen
            for (let i = 0; i < data.images.length; i++) {
                const file = data.images[i];
                currentIndex++;

                setProgress(prev => ({
                    ...prev,
                    current: currentIndex,
                    currentFile: file.name
                }));

                try {
                    // Extraer GPS
                    const gpsData = await extractGPSFromImage(file);

                    if (!gpsData) {
                        setProgress(prev => ({
                            ...prev,
                            errors: [...prev.errors, `${file.name}: Sin datos GPS`]
                        }));
                        continue;
                    }

                    // Comprimir imagen
                    const compressedBlob = await compressImage(file);

                    // Crear placemark
                    placemarks.push({
                        name: categoryName,
                        description: file.name,
                        latitude: gpsData.latitude,
                        longitude: gpsData.longitude,
                        icon: category.icon,
                        image: compressedBlob,
                        imagePreview: data.previews[i]
                    });

                } catch (error) {
                    console.error(`Error procesando ${file.name}:`, error);
                    setProgress(prev => ({
                        ...prev,
                        errors: [...prev.errors, `${file.name}: ${error.message}`]
                    }));
                }
            }
        }

        // Enviar placemarks al padre
        if (placemarks.length > 0) {
            onAddPlacemarks(placemarks);
        }

        // Mostrar resumen
        const errorsCount = progress.errors.length;
        const successCount = placemarks.length;

        let message = `Procesamiento completo:\n\n✅ ${successCount} imágenes procesadas correctamente`;
        if (errorsCount > 0) {
            message += `\n❌ ${errorsCount} imágenes con errores\n\nRevisa los detalles abajo.`;
        }
        alert(message);

        // Resetear si hubo éxito
        if (successCount > 0) {
            resetCategories();
        }

        setProcessing(false);
    };

    const resetCategories = () => {
        // Revocar URLs
        Object.values(categoryData).forEach(cat => {
            cat.previews.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        });

        // Resetear estado
        setCategoryData({
            cableado: { customName: '', images: [], previews: [] },
            arbol: { customName: '', images: [], previews: [] },
            ave: { customName: '', images: [], previews: [] },
            casa: { customName: '', images: [], previews: [] }
        });

        // Resetear progress
        setProgress({ current: 0, total: 0, currentFile: '', errors: [] });
    };

    const getTotalImages = () => {
        return Object.values(categoryData).reduce(
            (sum, cat) => sum + cat.images.length,
            0
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Subir por Grupos</h2>
                <p className="text-slate-600">
                    Organiza tus imágenes por categoría y procesa múltiples imágenes a la vez.
                    Cada imagen debe tener datos GPS en sus metadatos EXIF.
                </p>
            </div>

            {/* Grid de categorías */}
            <div className="grid md:grid-cols-2 gap-6">
                {CATEGORIES.map(category => {
                    const data = categoryData[category.id];
                    return (
                        <div key={category.id} className="card space-y-4">
                            {/* Header con icono */}
                            <div className="flex items-center gap-3">
                                <img
                                    src={category.iconUrl}
                                    alt={category.label}
                                    className="w-10 h-10"
                                />
                                <h3 className="text-lg font-bold text-slate-800">{category.label}</h3>
                            </div>

                            {/* Input de nombre */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Nombre del punto
                                </label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder={category.defaultName}
                                    value={data.customName}
                                    onChange={(e) => handleNameChange(category.id, e.target.value)}
                                    disabled={processing}
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Se aplicará a todas las imágenes de esta categoría
                                </p>
                            </div>

                            {/* File input (hidden) */}
                            <input
                                ref={fileInputRefs[category.id]}
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageSelect(category.id, e)}
                                disabled={processing}
                            />

                            {/* Botón seleccionar */}
                            <button
                                onClick={() => fileInputRefs[category.id].current.click()}
                                className="btn-secondary w-full flex items-center justify-center gap-2"
                                disabled={processing}
                            >
                                <Upload className="w-4 h-4" />
                                Seleccionar Imágenes
                            </button>

                            {/* Grid de previews */}
                            {data.images.length > 0 && (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-4 gap-2">
                                        {data.previews.map((preview, idx) => (
                                            <div key={idx} className="relative group">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${idx + 1}`}
                                                    className="w-full h-20 object-cover rounded border border-slate-200"
                                                />
                                                <button
                                                    onClick={() => handleRemoveImage(category.id, idx)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                                    disabled={processing}
                                                    aria-label="Eliminar imagen"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-600 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" />
                                        {data.images.length} {data.images.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}
                                    </p>
                                </div>
                            )}

                            {data.images.length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded">
                                    No hay imágenes seleccionadas
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Botón procesar */}
            <div className="card bg-slate-50">
                <button
                    onClick={handleProcessAll}
                    disabled={processing || getTotalImages() === 0}
                    className={`w-full btn-primary flex items-center justify-center gap-2 text-lg py-4 ${
                        processing || getTotalImages() === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {processing ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Procesando imágenes...
                        </>
                    ) : (
                        <>
                            <Upload className="w-6 h-6" />
                            Procesar todas las imágenes ({getTotalImages()})
                        </>
                    )}
                </button>

                {getTotalImages() === 0 && (
                    <p className="text-sm text-slate-500 text-center mt-2">
                        Agrega al menos una imagen en alguna categoría para procesar
                    </p>
                )}
            </div>

            {/* Progress bar */}
            {processing && (
                <div className="card bg-blue-50 border-2 border-blue-200">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                            <div className="flex-1">
                                <div className="flex justify-between text-sm font-medium text-slate-800">
                                    <span>Procesando imágenes...</span>
                                    <span>{progress.current} / {progress.total}</span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1 truncate">
                                    {progress.currentFile}
                                </p>
                            </div>
                        </div>

                        {/* Barra de progreso */}
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(progress.current / progress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Lista de errores */}
            {progress.errors.length > 0 && !processing && (
                <div className="card bg-amber-50 border-2 border-amber-300">
                    <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                        <X className="w-5 h-5" />
                        Imágenes con errores ({progress.errors.length})
                    </h4>
                    <ul className="text-sm text-amber-700 space-y-1 max-h-40 overflow-y-auto">
                        {progress.errors.map((error, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="text-amber-500">•</span>
                                <span>{error}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle, XCircle, Image } from 'lucide-react';
import { extractGPSFromImage } from '../utils/exifReader';
import { compressImage } from '../utils/imageCompressor';

/**
 * Componente para subir fotos con extracción automática de GPS
 */
export default function PhotoUploader({ onPhotoSelect, className = '' }) {
    const [preview, setPreview] = useState(null);
    const [hasGPS, setHasGPS] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    const handleFile = async (file) => {
        if (!file || !file.type.startsWith('image/')) {
            alert('Por favor selecciona un archivo de imagen válido');
            return;
        }

        setLoading(true);

        try {
            // Crear preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target.result);
            };
            reader.readAsDataURL(file);

            // Extraer GPS
            const gpsData = await extractGPSFromImage(file);
            setHasGPS(gpsData !== null);

            // Comprimir imagen
            const compressedBlob = await compressImage(file);

            // Notificar al componente padre
            onPhotoSelect({
                file: compressedBlob,
                preview: URL.createObjectURL(compressedBlob),
                gpsData,
                originalName: file.name
            });
        } catch (error) {
            console.error('Error al procesar imagen:', error);
            alert('Error al procesar la imagen');
        } finally {
            setLoading(false);
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleCameraClick = () => {
        cameraInputRef.current?.click();
    };

    const handleGalleryClick = () => {
        galleryInputRef.current?.click();
    };

    return (
        <div className={className}>
            {/* Input para cámara */}
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileInput}
                className="hidden"
            />

            {/* Input para galería */}
            <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
            />

            {!preview ? (
                <div>
                    {/* Área de drag & drop */}
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`
              border-2 border-dashed rounded-xl p-6 text-center
              transition-all duration-200
              ${dragActive
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-slate-300 bg-slate-50'
                            }
            `}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-primary-100 rounded-full">
                                <Image className="w-8 h-8 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-slate-700">
                                    Selecciona una imagen
                                </p>
                                <p className="text-sm text-slate-500 mt-1">
                                    Arrastra una imagen o usa los botones
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Botones para móvil y desktop */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <button
                            type="button"
                            onClick={handleCameraClick}
                            className="btn-primary flex items-center justify-center gap-2 py-3"
                        >
                            <Camera className="w-5 h-5" />
                            <span>Tomar Foto</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleGalleryClick}
                            className="btn-secondary flex items-center justify-center gap-2 py-3"
                        >
                            <Upload className="w-5 h-5" />
                            <span>Galería</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden shadow-lg">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-64 object-cover"
                        />
                        {loading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                            </div>
                        )}
                    </div>

                    {/* Indicador de GPS */}
                    {hasGPS !== null && (
                        <div className={`
              flex items-center gap-2 p-3 rounded-lg
              ${hasGPS ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}
            `}>
                            {hasGPS ? (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">
                                        GPS encontrado - Coordenadas extraídas automáticamente
                                    </span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">
                                        Sin datos GPS - Ingresa las coordenadas manualmente
                                    </span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Botones para cambiar foto */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={handleCameraClick}
                            className="btn-secondary flex items-center justify-center gap-2"
                        >
                            <Camera className="w-4 h-4" />
                            Tomar otra
                        </button>
                        <button
                            type="button"
                            onClick={handleGalleryClick}
                            className="btn-secondary flex items-center justify-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Cambiar foto
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

import React from 'react';
import { MapPin, Edit2, Trash2 } from 'lucide-react';

/**
 * Lista de placemarks agregados
 */
export default function PlacemarkList({ placemarks, onEdit, onDelete, className = '' }) {
    if (placemarks.length === 0) {
        return (
            <div className={`card text-center py-12 ${className}`}>
                <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">
                    No hay puntos agregados aún
                </p>
                <p className="text-slate-400 text-sm mt-2">
                    Agrega tu primer punto usando el formulario
                </p>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
                Puntos Agregados ({placemarks.length})
            </h2>

            <div className="grid grid-cols-1 gap-4">
                {placemarks.map((placemark, index) => (
                    <div
                        key={index}
                        className="card card-hover flex flex-col sm:flex-row gap-4"
                    >
                        {/* Imagen preview */}
                        {placemark.imagePreview && (
                            <div className="w-full sm:w-32 h-32 flex-shrink-0">
                                <img
                                    src={placemark.imagePreview}
                                    alt={placemark.name}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>
                        )}

                        {/* Información */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-slate-800 truncate">
                                {placemark.name}
                            </h3>
                            {placemark.description && (
                                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                    {placemark.description}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>
                                        {typeof placemark.latitude === 'number'
                                            ? placemark.latitude.toFixed(6)
                                            : placemark.latitude},
                                        {typeof placemark.longitude === 'number'
                                            ? placemark.longitude.toFixed(6)
                                            : placemark.longitude}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex sm:flex-col gap-2">
                            <button
                                onClick={() => onEdit(index)}
                                className="flex-1 sm:flex-none btn-secondary flex items-center justify-center gap-2 text-sm"
                                title="Editar"
                            >
                                <Edit2 className="w-4 h-4" />
                                <span className="sm:hidden">Editar</span>
                            </button>
                            <button
                                onClick={() => onDelete(index)}
                                className="flex-1 sm:flex-none btn-danger flex items-center justify-center gap-2 text-sm"
                                title="Eliminar"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="sm:hidden">Eliminar</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

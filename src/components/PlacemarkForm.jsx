import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import CoordinateInput from './CoordinateInput';
import PhotoUploader from './PhotoUploader';
import IconSelector from './IconSelector';

/**
 * Formulario principal para agregar placemarks
 */
export default function PlacemarkForm({ onAddPlacemark, editingPlacemark, onCancelEdit }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        latitude: '',
        longitude: '',
        icon: 'pushpin',
        image: null,
        imagePreview: null
    });

    const [photoKey, setPhotoKey] = useState(0); // Key para resetear PhotoUploader

    // Cargar datos si estamos editando
    useEffect(() => {
        if (editingPlacemark) {
            setFormData(editingPlacemark);
        }
    }, [editingPlacemark]);

    const handlePhotoSelect = (photoData) => {
        console.log('Photo data received:', photoData);
        console.log('GPS data:', photoData.gpsData);

        // Usar un solo setState para evitar race conditions en móvil
        setFormData(prev => {
            const newData = {
                ...prev,
                image: photoData.file,
                imagePreview: photoData.preview
            };

            // Si hay GPS, agregar coordenadas en el mismo update
            if (photoData.gpsData) {
                console.log('Setting GPS coordinates:', photoData.gpsData.latitude, photoData.gpsData.longitude);
                newData.latitude = photoData.gpsData.latitude;
                newData.longitude = photoData.gpsData.longitude;
            }

            return newData;
        });
    };

    const handleCoordinateChange = ({ latitude, longitude }) => {
        setFormData(prev => ({
            ...prev,
            latitude,
            longitude
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar campos requeridos
        if (!formData.name.trim()) {
            alert('Por favor ingresa un nombre para el punto');
            return;
        }

        if (!formData.latitude || !formData.longitude) {
            alert('Por favor ingresa las coordenadas');
            return;
        }

        // Enviar al componente padre
        onAddPlacemark(formData);

        // Resetear formulario completamente
        setFormData({
            name: '',
            description: '',
            latitude: '',
            longitude: '',
            icon: 'pushpin',
            image: null,
            imagePreview: null
        });

        // Incrementar key para forzar reset del PhotoUploader
        setPhotoKey(prev => prev + 1);
    };

    const handleCancel = () => {
        setFormData({
            name: '',
            description: '',
            latitude: '',
            longitude: '',
            icon: 'pushpin',
            image: null,
            imagePreview: null
        });
        setPhotoKey(prev => prev + 1); // Reset PhotoUploader
        if (onCancelEdit) {
            onCancelEdit();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">
                {editingPlacemark ? 'Editar Punto' : 'Agregar Nuevo Punto'}
            </h2>

            {/* Nombre */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre del punto *
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                    placeholder="Ej: Torre de telecomunicaciones"
                    required
                />
            </div>

            {/* Descripción */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Descripción (opcional)
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field resize-none"
                    rows="3"
                    placeholder="Agrega detalles adicionales..."
                />
            </div>

            {/* Subir foto */}
            <PhotoUploader key={photoKey} onPhotoSelect={handlePhotoSelect} />

            {/* Coordenadas */}
            <CoordinateInput
                latitude={formData.latitude}
                longitude={formData.longitude}
                onChange={handleCoordinateChange}
            />

            {/* Selector de icono */}
            <IconSelector
                selectedIcon={formData.icon}
                onSelect={(icon) => setFormData(prev => ({ ...prev, icon }))}
            />

            {/* Botones */}
            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    {editingPlacemark ? 'Actualizar Punto' : 'Agregar Punto'}
                </button>
                {editingPlacemark && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="btn-secondary"
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
}

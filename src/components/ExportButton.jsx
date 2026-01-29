import React, { useState } from 'react';
import { Download, Loader2, Edit2 } from 'lucide-react';
import { generateKMZ, downloadKMZ } from '../utils/kmlGenerator';

/**
 * Botón para exportar y descargar el archivo KMZ
 */
export default function ExportButton({ placemarks, projectName = 'Proyecto', className = '' }) {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(false);
    const [customFilename, setCustomFilename] = useState('');
    const [isEditingFilename, setIsEditingFilename] = useState(false);

    const handleExport = async () => {
        if (placemarks.length === 0) {
            alert('No hay puntos para exportar. Agrega al menos un punto.');
            return;
        }

        setLoading(true);
        setProgress(0);

        try {
            // Simular progreso
            setProgress(30);

            // Generar KMZ
            const kmzBlob = await generateKMZ(placemarks, projectName);
            setProgress(80);

            // Usar nombre personalizado o generar uno automático
            const baseFilename = customFilename || projectName.replace(/\s+/g, '_');
            const filename = `${baseFilename}_${new Date().toISOString().split('T')[0]}.kmz`;
            downloadKMZ(kmzBlob, filename);

            setProgress(100);

            // Mostrar mensaje de éxito
            setTimeout(() => {
                alert(`✅ Archivo KMZ generado exitosamente!\n\nPuntos exportados: ${placemarks.length}\nArchivo: ${filename}`);
                setLoading(false);
                setProgress(0);
            }, 500);

        } catch (error) {
            console.error('Error al generar KMZ:', error);
            alert('❌ Error al generar el archivo KMZ. Por favor intenta nuevamente.');
            setLoading(false);
            setProgress(0);
        }
    };

    return (
        <div className={className}>
            {/* Campo para nombre personalizado del archivo */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre del archivo KMZ
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={customFilename}
                        onChange={(e) => setCustomFilename(e.target.value)}
                        placeholder={projectName.replace(/\s+/g, '_')}
                        className="input-field flex-1"
                    />
                    <button
                        type="button"
                        onClick={() => setCustomFilename('')}
                        className="btn-secondary px-3"
                        title="Usar nombre del proyecto"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                    Se agregará la fecha automáticamente: {(customFilename || projectName.replace(/\s+/g, '_'))}_YYYY-MM-DD.kmz
                </p>
            </div>

            {/* Botón de exportación */}
            <button
                onClick={handleExport}
                disabled={loading || placemarks.length === 0}
                className={`
          w-full btn-primary flex items-center justify-center gap-2 text-lg py-4
          ${loading || placemarks.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Generando KMZ... {progress}%
                    </>
                ) : (
                    <>
                        <Download className="w-6 h-6" />
                        Exportar KMZ ({placemarks.length} {placemarks.length === 1 ? 'punto' : 'puntos'})
                    </>
                )}
            </button>

            {placemarks.length === 0 && (
                <p className="text-sm text-slate-500 text-center mt-2">
                    Agrega al menos un punto para exportar
                </p>
            )}

            {loading && (
                <div className="mt-3">
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-primary-600 h-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Información sobre agrupación */}
            {placemarks.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                        ℹ️ Los puntos se agruparán por tipo de icono en Google Earth para facilitar el filtrado
                    </p>
                </div>
            )}
        </div>
    );
}

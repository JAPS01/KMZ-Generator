import React, { useState, useRef } from 'react';
import { Upload, Trash2, Download, FileArchive, AlertCircle } from 'lucide-react';
import { parseKMZForMerge, mergeKMZFiles } from '../utils/kmzMerger';

/**
 * Componente para unificar múltiples archivos KMZ en uno solo
 */
function KmzMerger() {
    const [kmzFiles, setKmzFiles] = useState([]);
    const [outputFileName, setOutputFileName] = useState('archivo_unificado');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Manejar la carga de archivos
    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setError(null);
        setIsProcessing(true);

        try {
            const newFiles = [];

            for (const file of files) {
                if (!file.name.toLowerCase().endsWith('.kmz')) {
                    continue;
                }

                // Parsear el archivo KMZ
                const parsedData = await parseKMZForMerge(file);

                newFiles.push({
                    id: Date.now() + Math.random(),
                    name: file.name,
                    originalFile: file,
                    placemarks: parsedData.placemarks,
                    images: parsedData.images,
                    placemarksCount: parsedData.placemarks.length
                });
            }

            setKmzFiles(prev => [...prev, ...newFiles]);
        } catch (err) {
            console.error('Error al cargar archivos:', err);
            setError('Error al cargar uno o más archivos KMZ');
        } finally {
            setIsProcessing(false);
            // Limpiar el input para permitir cargar el mismo archivo de nuevo
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Eliminar un archivo de la lista
    const handleRemoveFile = (fileId) => {
        setKmzFiles(prev => prev.filter(f => f.id !== fileId));
    };

    // Unificar y descargar
    const handleMergeAndDownload = async () => {
        if (kmzFiles.length === 0) {
            setError('Debes agregar al menos un archivo KMZ');
            return;
        }

        setError(null);
        setIsProcessing(true);

        try {
            const mergedBlob = await mergeKMZFiles(kmzFiles, outputFileName);

            // Descargar el archivo
            const url = URL.createObjectURL(mergedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${outputFileName}.kmz`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error al unificar archivos:', err);
            setError('Error al unificar los archivos KMZ');
        } finally {
            setIsProcessing(false);
        }
    };

    // Calcular total de placemarks
    const totalPlacemarks = kmzFiles.reduce((sum, f) => sum + f.placemarksCount, 0);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Título y descripción */}
            <div className="card">
                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                    Unificar Archivos KMZ
                </h2>
                <p className="text-slate-600 text-sm">
                    Carga varios archivos KMZ para combinarlos en un solo archivo.
                    Los puntos se agruparán automáticamente por categoría (tipo de icono).
                </p>
            </div>

            {/* Zona de carga de archivos */}
            <div className="card">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".kmz"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                />

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="w-full border-2 border-dashed border-slate-300 rounded-lg p-8 hover:border-primary-500 hover:bg-primary-50 transition-colors flex flex-col items-center gap-3 disabled:opacity-50"
                >
                    <Upload className="w-10 h-10 text-slate-400" />
                    <span className="text-slate-600 font-medium">
                        {isProcessing ? 'Procesando...' : 'Haz clic para agregar archivos KMZ'}
                    </span>
                    <span className="text-slate-400 text-sm">
                        Puedes seleccionar múltiples archivos
                    </span>
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Lista de archivos cargados */}
            {kmzFiles.length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                        Archivos cargados ({kmzFiles.length})
                    </h3>

                    <div className="space-y-2">
                        {kmzFiles.map((file) => (
                            <div
                                key={file.id}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <FileArchive className="w-5 h-5 text-primary-600" />
                                    <div>
                                        <p className="font-medium text-slate-800">{file.name}</p>
                                        <p className="text-sm text-slate-500">
                                            {file.placemarksCount} punto{file.placemarksCount !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveFile(file.id)}
                                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Eliminar archivo"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Resumen */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-slate-600">
                            Total: <span className="font-semibold">{totalPlacemarks}</span> puntos en{' '}
                            <span className="font-semibold">{kmzFiles.length}</span> archivo{kmzFiles.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            )}

            {/* Nombre del archivo de salida y botón de descarga */}
            {kmzFiles.length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                        Configuración de salida
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Nombre del archivo unificado
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={outputFileName}
                                    onChange={(e) => setOutputFileName(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Nombre del archivo"
                                />
                                <span className="text-slate-500">.kmz</span>
                            </div>
                        </div>

                        <button
                            onClick={handleMergeAndDownload}
                            disabled={isProcessing || kmzFiles.length === 0}
                            className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
                        >
                            <Download className="w-5 h-5" />
                            {isProcessing ? 'Procesando...' : 'Unificar y Descargar'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default KmzMerger;

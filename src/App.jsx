import React, { useState, useRef } from 'react';
import { Map, Upload, FileInput, Merge, Layers } from 'lucide-react';
import PlacemarkForm from './components/PlacemarkForm';
import PlacemarkList from './components/PlacemarkList';
import ExportButton from './components/ExportButton';
import KmzMerger from './components/KmzMerger';
import BatchUploader from './components/BatchUploader';
import { importKMZ } from './utils/kmzImporter';

/**
 * Componente principal de la aplicación
 */
function App() {
    const [placemarks, setPlacemarks] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [projectName, setProjectName] = useState('Proyecto KMZ');
    const [activeTab, setActiveTab] = useState('entrada');
    const importFileRef = useRef(null);

    // Agregar nuevo placemark
    const handleAddPlacemark = (placemarkData) => {
        if (editingIndex !== null) {
            // Actualizar placemark existente
            const updatedPlacemarks = [...placemarks];
            updatedPlacemarks[editingIndex] = placemarkData;
            setPlacemarks(updatedPlacemarks);
            setEditingIndex(null);
        } else {
            // Agregar nuevo placemark
            setPlacemarks([...placemarks, placemarkData]);
        }
    };

    // Editar placemark
    const handleEditPlacemark = (index) => {
        setEditingIndex(index);
        // Scroll al formulario en móvil
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Eliminar placemark
    const handleDeletePlacemark = (index) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este punto?')) {
            const updatedPlacemarks = placemarks.filter((_, i) => i !== index);
            setPlacemarks(updatedPlacemarks);
            if (editingIndex === index) {
                setEditingIndex(null);
            }
        }
    };

    // Agregar múltiples placemarks (batch upload)
    const handleAddPlacemarks = (newPlacemarks) => {
        setPlacemarks(prev => [...prev, ...newPlacemarks]);
    };

    // Cancelar edición
    const handleCancelEdit = () => {
        setEditingIndex(null);
    };

    // Importar KMZ
    const handleImportKMZ = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const importedPlacemarks = await importKMZ(file);
            setPlacemarks(importedPlacemarks);
            alert(`Se importaron ${importedPlacemarks.length} puntos correctamente`);
        } catch (error) {
            console.error('Error al importar KMZ:', error);
            alert('Error al importar el archivo KMZ. Asegúrate de que sea un archivo válido.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-600 rounded-lg">
                            <Map className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-slate-800">KMZ Generator</h1>
                            <p className="text-sm text-slate-500">Generador de archivos KMZ para Google Earth</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-4 border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('entrada')}
                            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
                                activeTab === 'entrada'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <FileInput className="w-4 h-4" />
                            Entrada de datos
                        </button>
                        <button
                            onClick={() => setActiveTab('batch')}
                            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
                                activeTab === 'batch'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <Layers className="w-4 h-4" />
                            Subir por Grupos
                        </button>
                        <button
                            onClick={() => setActiveTab('unificar')}
                            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
                                activeTab === 'unificar'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <Merge className="w-4 h-4" />
                            Unificar KMZ
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'entrada' && (
                    <>
                        {/* Nombre del proyecto */}
                        <div className="mb-6">
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                className="text-xl font-semibold text-slate-800 bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg px-4 py-2 w-full max-w-md"
                                placeholder="Nombre del proyecto"
                            />
                        </div>

                        {/* Layout responsive */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Panel izquierdo: Formulario */}
                            <div className="space-y-6">
                                <PlacemarkForm
                                    onAddPlacemark={handleAddPlacemark}
                                    editingPlacemark={editingIndex !== null ? placemarks[editingIndex] : null}
                                    onCancelEdit={handleCancelEdit}
                                />
                            </div>

                            {/* Panel derecho: Lista y exportación */}
                            <div className="space-y-6">
                                {/* Botón de exportación e importación */}
                                <div className="card">
                                    <div className="space-y-3">
                                        <ExportButton
                                            placemarks={placemarks}
                                            projectName={projectName}
                                        />

                                        {/* Botón de importación */}
                                        <div className="border-t border-slate-200 pt-3">
                                            <input
                                                ref={importFileRef}
                                                type="file"
                                                accept=".kmz"
                                                onChange={handleImportKMZ}
                                                className="hidden"
                                            />
                                            <button
                                                onClick={() => importFileRef.current?.click()}
                                                className="w-full btn-secondary flex items-center justify-center gap-2"
                                            >
                                                <Upload className="w-5 h-5" />
                                                Importar KMZ Existente
                                            </button>
                                            <p className="text-xs text-slate-500 text-center mt-2">
                                                Carga un archivo KMZ para editar sus puntos
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Lista de placemarks */}
                                <PlacemarkList
                                    placemarks={placemarks}
                                    onEdit={handleEditPlacemark}
                                    onDelete={handleDeletePlacemark}
                                />
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'batch' && (
                    <BatchUploader onAddPlacemarks={handleAddPlacemarks} />
                )}

                {activeTab === 'unificar' && (
                    <KmzMerger />
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-slate-600 text-sm">
                        KMZ Generator PWA - Generador de archivos KMZ para Google Earth
                    </p>
                    <p className="text-center text-slate-500 text-xs mt-2">
                        Funciona offline • Captura fotos con GPS • Exporta a Google Earth
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default App;

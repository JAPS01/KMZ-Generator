import React, { useState, useEffect } from 'react';
import { dmsToDecimal, decimalToDms, isValidLatitude, isValidLongitude } from '../utils/geoConverters';

/**
 * Componente para entrada de coordenadas con toggle entre Decimal y DMS
 */
export default function CoordinateInput({ latitude, longitude, onChange, className = '' }) {
    const [mode, setMode] = useState('decimal'); // 'decimal' o 'dms'

    // Estado para modo decimal
    const [decimalLat, setDecimalLat] = useState(latitude || '');
    const [decimalLon, setDecimalLon] = useState(longitude || '');

    // Estado para modo DMS
    const [latDMS, setLatDMS] = useState({ degrees: '', minutes: '', seconds: '', direction: 'N' });
    const [lonDMS, setLonDMS] = useState({ degrees: '', minutes: '', seconds: '', direction: 'W' });

    // Actualizar cuando cambian las props
    useEffect(() => {
        if (latitude !== undefined && latitude !== '') {
            setDecimalLat(latitude);
            const dms = decimalToDms(parseFloat(latitude), true);
            setLatDMS(dms);
        }
        if (longitude !== undefined && longitude !== '') {
            setDecimalLon(longitude);
            const dms = decimalToDms(parseFloat(longitude), false);
            setLonDMS(dms);
        }
    }, [latitude, longitude]);

    // Manejar cambio en modo decimal
    const handleDecimalChange = (type, value) => {
        if (type === 'lat') {
            setDecimalLat(value);
            const num = parseFloat(value);
            if (!isNaN(num)) {
                onChange({ latitude: num, longitude: parseFloat(decimalLon) || 0 });
                setLatDMS(decimalToDms(num, true));
            }
        } else {
            setDecimalLon(value);
            const num = parseFloat(value);
            if (!isNaN(num)) {
                onChange({ latitude: parseFloat(decimalLat) || 0, longitude: num });
                setLonDMS(decimalToDms(num, false));
            }
        }
    };

    // Manejar cambio en modo DMS
    const handleDMSChange = (type, field, value) => {
        const newDMS = type === 'lat' ? { ...latDMS } : { ...lonDMS };
        newDMS[field] = value;

        if (type === 'lat') {
            setLatDMS(newDMS);
            const decimal = dmsToDecimal(
                parseFloat(newDMS.degrees) || 0,
                parseFloat(newDMS.minutes) || 0,
                parseFloat(newDMS.seconds) || 0,
                newDMS.direction
            );
            setDecimalLat(decimal);
            onChange({ latitude: decimal, longitude: parseFloat(decimalLon) || 0 });
        } else {
            setLonDMS(newDMS);
            const decimal = dmsToDecimal(
                parseFloat(newDMS.degrees) || 0,
                parseFloat(newDMS.minutes) || 0,
                parseFloat(newDMS.seconds) || 0,
                newDMS.direction
            );
            setDecimalLon(decimal);
            onChange({ latitude: parseFloat(decimalLat) || 0, longitude: decimal });
        }
    };

    const latValid = isValidLatitude(parseFloat(decimalLat));
    const lonValid = isValidLongitude(parseFloat(decimalLon));

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Toggle de modo */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setMode('decimal')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${mode === 'decimal'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                >
                    Decimal
                </button>
                <button
                    type="button"
                    onClick={() => setMode('dms')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${mode === 'dms'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                >
                    GMS (Grados-Minutos-Segundos)
                </button>
            </div>

            {/* Inputs según el modo */}
            {mode === 'decimal' ? (
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Latitud
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={decimalLat}
                            onChange={(e) => handleDecimalChange('lat', e.target.value)}
                            onWheel={(e) => e.target.blur()}
                            className={`input-field ${!latValid && decimalLat ? 'input-error' : ''}`}
                            placeholder="-90 a 90"
                        />
                        {!latValid && decimalLat && (
                            <p className="text-red-500 text-xs mt-1">Latitud debe estar entre -90 y 90</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Longitud
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={decimalLon}
                            onChange={(e) => handleDecimalChange('lon', e.target.value)}
                            onWheel={(e) => e.target.blur()}
                            className={`input-field ${!lonValid && decimalLon ? 'input-error' : ''}`}
                            placeholder="-180 a 180"
                        />
                        {!lonValid && decimalLon && (
                            <p className="text-red-500 text-xs mt-1">Longitud debe estar entre -180 y 180</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Latitud DMS */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Latitud
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            <input
                                type="number"
                                value={latDMS.degrees}
                                onChange={(e) => handleDMSChange('lat', 'degrees', e.target.value)}
                                onWheel={(e) => e.target.blur()}
                                className="input-field"
                                placeholder="Grados"
                                min="0"
                                max="90"
                            />
                            <input
                                type="number"
                                value={latDMS.minutes}
                                onChange={(e) => handleDMSChange('lat', 'minutes', e.target.value)}
                                onWheel={(e) => e.target.blur()}
                                className="input-field"
                                placeholder="Minutos"
                                min="0"
                                max="59"
                            />
                            <input
                                type="number"
                                value={latDMS.seconds}
                                onChange={(e) => handleDMSChange('lat', 'seconds', e.target.value)}
                                onWheel={(e) => e.target.blur()}
                                className="input-field"
                                placeholder="Segundos"
                                min="0"
                                max="59.99"
                                step="0.01"
                            />
                            <select
                                value={latDMS.direction}
                                onChange={(e) => handleDMSChange('lat', 'direction', e.target.value)}
                                className="input-field"
                            >
                                <option value="N">N</option>
                                <option value="S">S</option>
                            </select>
                        </div>
                    </div>

                    {/* Longitud DMS */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Longitud
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            <input
                                type="number"
                                value={lonDMS.degrees}
                                onChange={(e) => handleDMSChange('lon', 'degrees', e.target.value)}
                                onWheel={(e) => e.target.blur()}
                                className="input-field"
                                placeholder="Grados"
                                min="0"
                                max="180"
                            />
                            <input
                                type="number"
                                value={lonDMS.minutes}
                                onChange={(e) => handleDMSChange('lon', 'minutes', e.target.value)}
                                onWheel={(e) => e.target.blur()}
                                className="input-field"
                                placeholder="Minutos"
                                min="0"
                                max="59"
                            />
                            <input
                                type="number"
                                value={lonDMS.seconds}
                                onChange={(e) => handleDMSChange('lon', 'seconds', e.target.value)}
                                onWheel={(e) => e.target.blur()}
                                className="input-field"
                                placeholder="Segundos"
                                min="0"
                                max="59.99"
                                step="0.01"
                            />
                            <select
                                value={lonDMS.direction}
                                onChange={(e) => handleDMSChange('lon', 'direction', e.target.value)}
                                className="input-field"
                            >
                                <option value="E">E</option>
                                <option value="W">W</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import React, { useState } from 'react';

/**
 * Selector de iconos de Google Earth
 */
const ICONS = [
    { id: 'pushpin', name: 'Cableado', url: 'http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png' },
    { id: 'campground', name: 'Ave', url: 'http://maps.google.com/mapfiles/kml/shapes/campground.png' },
    { id: 'ranger_station', name: 'Casa', url: 'http://maps.google.com/mapfiles/kml/shapes/ranger_station.png' },
    { id: 'parks', name: 'Árbol', url: 'http://maps.google.com/mapfiles/kml/shapes/parks.png' },
];

export default function IconSelector({ selectedIcon = 'pushpin', onSelect, className = '' }) {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-slate-700 mb-3">
                Icono del marcador
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {ICONS.map((icon) => (
                    <button
                        key={icon.id}
                        type="button"
                        onClick={() => onSelect(icon.id)}
                        className={`
              p-3 rounded-lg border-2 transition-all duration-200
              hover:scale-110 hover:shadow-md
              ${selectedIcon === icon.id
                                ? 'border-primary-500 bg-primary-50 shadow-md'
                                : 'border-slate-200 hover:border-primary-300'
                            }
            `}
                        title={icon.name}
                    >
                        <img
                            src={icon.url}
                            alt={icon.name}
                            className="w-full h-auto"
                            loading="lazy"
                        />
                    </button>
                ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
                Seleccionado: <span className="font-medium">{ICONS.find(i => i.id === selectedIcon)?.name}</span>
            </p>
        </div>
    );
}

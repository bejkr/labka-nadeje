import React, { useEffect, useRef } from 'react';
import { getCoordinates } from '../utils/geoUtils';

interface MiniMapProps {
    location: string;
    className?: string;
}

const MiniMap: React.FC<MiniMapProps> = ({ location, className = '' }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        // @ts-ignore
        const L = window.L;
        if (!L) return;

        const coords = getCoordinates(location);
        if (!coords) return; // If city not found, don't init map (or we could show default Slovakia view)

        if (!mapInstance.current) {
            const map = L.map(mapRef.current, {
                center: coords,
                zoom: 12,
                zoomControl: true,
                dragging: false,
                scrollWheelZoom: false,
                doubleClickZoom: false,
                boxZoom: false,
                attributionControl: false
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap &copy; CARTO'
            }).addTo(map);

            // Add simple marker
            const icon = L.divIcon({
                className: 'custom-map-marker',
                html: `
                    <div style="width: 24px; height: 24px; background-color: #ea580c; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 5px rgba(234, 88, 12, 0.4);"></div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            L.marker(coords, { icon }).addTo(map);

            mapInstance.current = map;
        } else {
            // Update view if location changes
            mapInstance.current.setView(coords, 12);
        }

        return () => {
            // Cleanup if needed, though for a static-ish mini-map it's often fine to keep instance if component doesn't unmount often
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [location]);

    const coords = getCoordinates(location);
    if (!coords) return null;

    return (
        <div className={`relative overflow-hidden rounded-2xl border border-gray-100 shadow-sm ${className}`}>
            <div ref={mapRef} className="w-full h-full" style={{ minHeight: '180px', zIndex: 1 }}></div>
            <div className="absolute inset-0 pointer-events-none border border-black/5 rounded-2xl z-10"></div>
        </div>
    );
};

export default MiniMap;

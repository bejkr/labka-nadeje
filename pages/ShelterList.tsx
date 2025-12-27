
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Shelter } from '../types';
import { MapPin, Phone, Mail, ArrowRight, Building2, Loader2, Search, CheckCircle2, Users, Heart, ExternalLink, ChevronRight, Dog, Sparkles, ShieldCheck, PawPrint } from 'lucide-react';

// Rozšírený zoznam súradníc slovenských miest pre geokódovanie v prototype
const CITY_COORDS: Record<string, [number, number]> = {
    'Bratislava': [48.1486, 17.1077],
    'Košice': [48.7164, 21.2611],
    'Prešov': [49.0018, 21.2393],
    'Žilina': [49.2231, 18.7394],
    'Banská Bystrica': [48.7363, 19.1462],
    'Nitra': [48.3061, 18.0764],
    'Trnava': [48.3709, 17.5826],
    'Trenčín': [48.8945, 18.0444],
    'Martin': [49.0616, 18.9248],
    'Poprad': [49.0561, 20.2960],
    'Prievidza': [48.7721, 18.6252],
    'Zvolen': [48.5763, 19.1276],
    'Považská Bystrica': [49.1170, 18.4509],
    'Nové Zámky': [47.9854, 18.1619],
    'Michalovce': [48.7543, 21.9195],
    'Spišská Nová Ves': [48.9446, 20.5615],
    'Komárno': [47.7636, 18.1267],
    'Levice': [48.2156, 18.6071],
    'Humenné': [48.9370, 21.9163],
    'Bardejov': [49.2918, 21.2727],
    'Liptovský Mikuláš': [49.0820, 19.6133],
    'Piešťany': [48.5915, 17.8282],
    'Ružomberok': [49.0806, 19.3017],
    'Topoľčany': [48.5600, 18.1750],
    'Lučenec': [48.3325, 19.6671],
    'Čadca': [49.4350, 18.7889],
    'Dubnica nad Váhom': [48.9567, 18.1726],
    'Rimavská Sobota': [48.3828, 20.0224],
    'Partizánske': [48.6270, 18.3746],
    'Šaľa': [48.1517, 17.8806],
    'Dunajská Streda': [47.9946, 17.6195],
    'Pezinok': [48.2856, 17.2652],
    'Senec': [48.2194, 17.4001],
    'Senica': [48.6792, 17.3669],
    'Skalica': [48.8444, 17.2253],
    'Malacky': [48.4363, 17.0216],
    'Hlohovec': [48.4323, 17.7979],
    'Galanta': [48.1901, 17.7275],
    'Myjava': [48.7516, 17.5674],
    'Bánovce nad Bebravou': [48.7188, 18.2575],
    'Nové Mesto nad Váhom': [48.7562, 17.8306],
    'Púchov': [49.1246, 18.3262],
    'Kežmarok': [49.1345, 20.4311],
    'Stará Ľubovňa': [49.3013, 20.6896],
    'Detva': [48.5606, 19.4184],
    'Brezno': [48.8043, 19.6456],
    'Dolný Kubín': [49.2089, 19.2974],
    'Trebišov': [48.6293, 21.7224],
    'Snina': [48.9877, 22.1504],
    'Rožňava': [48.6611, 20.5317],
    'Revúca': [48.6835, 20.1171],
    'Veľký Krtíš': [48.2106, 19.3503],
};

const DEFAULT_CENTER: [number, number] = [48.669, 19.699];

const ShelterListPage: React.FC = () => {
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markersLayerRef = useRef<any>(null);

    useEffect(() => {
        const fetchShelters = async () => {
            try {
                const data = await api.getAllShelters();
                setShelters(data);
            } catch (e) {
                console.error("Failed to fetch shelters", e);
            } finally {
                setLoading(false);
            }
        };
        fetchShelters();
    }, []);

    const filteredShelters = useMemo(() => {
        return shelters.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [shelters, searchTerm]);

    useEffect(() => {
        if (loading || !mapRef.current) return;

        // @ts-ignore
        const L = window.L;
        if (!L) return;

        if (!mapInstance.current) {
            const map = L.map(mapRef.current, {
                scrollWheelZoom: false
            }).setView(DEFAULT_CENTER, 7);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap &copy; CARTO'
            }).addTo(map);

            markersLayerRef.current = L.layerGroup().addTo(map);
            mapInstance.current = map;
        }

        const L_inst = L;
        const markersLayer = markersLayerRef.current;
        markersLayer.clearLayers();

        const createCustomIcon = () => {
            return L_inst.divIcon({
                className: 'custom-map-marker',
                html: `
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 36px; height: 46px;">
                <div style="width: 36px; height: 36px; background-color: #ea580c; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(234, 88, 12, 0.4); display: flex; align-items: center; justify-content: center; z-index: 2;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <circle cx="12" cy="14" r="3.5" />
                        <circle cx="7" cy="9" r="2.5" />
                        <circle cx="11" cy="5" r="2.5" />
                        <circle cx="16" cy="6" r="2.5" />
                        <circle cx="20" cy="11" r="2.5" />
                    </svg>
                </div>
                <div style="width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 12px solid #ea580c; margin-top: -6px; z-index: 1;"></div>
              </div>
            `,
                iconSize: [36, 46],
                iconAnchor: [18, 46], // spodok stredu
                popupAnchor: [0, -46]
            });
        };

        filteredShelters.forEach(shelter => {
            let coords = CITY_COORDS[shelter.location];
            if (!coords) {
                const foundCityKey = Object.keys(CITY_COORDS).find(city => shelter.location.toLowerCase().includes(city.toLowerCase()));
                if (foundCityKey) coords = CITY_COORDS[foundCityKey];
            }

            if (coords) {
                const jitterCoords: [number, number] = [
                    coords[0] + (Math.random() - 0.5) * 0.01,
                    coords[1] + (Math.random() - 0.5) * 0.01
                ];
                const marker = L_inst.marker(jitterCoords, { icon: createCustomIcon() });
                const popupContent = `
                <div style="text-align: center; font-family: sans-serif; min-width: 140px; padding: 5px;">
                    <div style="font-weight: 800; color: #111827; margin-bottom: 2px; font-size: 14px;">${shelter.name}</div>
                    <div style="font-size: 11px; color: #6b7280; margin-bottom: 10px;">${shelter.location}</div>
                    <a href="#/shelters/${shelter.id}" style="display: block; padding: 8px 12px; background-color: #ea580c; color: white; font-size: 11px; font-weight: 700; border-radius: 8px; text-decoration: none;">Zobraziť profil</a>
                </div>
            `;
                marker.bindPopup(popupContent).addTo(markersLayer);
            }
        });

        if (searchTerm && filteredShelters.length > 0 && filteredShelters.length < shelters.length) {
            const firstShelter = filteredShelters[0];
            let coords = CITY_COORDS[firstShelter.location];
            if (!coords) {
                const foundCityKey = Object.keys(CITY_COORDS).find(city => firstShelter.location.toLowerCase().includes(city.toLowerCase()));
                if (foundCityKey) coords = CITY_COORDS[foundCityKey];
            }
            if (coords) mapInstance.current.flyTo(coords, 10, { duration: 1.5 });
        }
    }, [loading, filteredShelters, searchTerm]);

    useEffect(() => {
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="p-8 md:p-16 flex flex-col justify-center order-2 lg:order-1">
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                                Mapa útulkov <br />
                                <span className="text-brand-600">Slovenska</span>
                            </h1>
                            <p className="text-lg text-gray-600 mb-8 max-w-lg">
                                Nájdite najbližšie útočisko pre opustené zvieratká vo vašom okolí. Spoločne im dávame šancu na nový domov.
                            </p>
                            <div className="relative max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Hľadať podľa názvu alebo mesta..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 shadow-sm transition-all"
                                />
                            </div>
                        </div>
                        <div className="h-[300px] lg:h-[550px] bg-gray-100 relative order-1 lg:order-2">
                            {loading && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-100/50 backdrop-blur-sm">
                                    <Loader2 className="animate-spin text-brand-600" size={32} />
                                </div>
                            )}
                            <div ref={mapRef} className="w-full h-full" style={{ zIndex: 1 }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Building2 className="text-brand-600" size={28} />
                            Zoznam útulkov
                        </h2>
                        <p className="text-gray-500 mt-1">Zobrazených {filteredShelters.length} partnerov</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600" size={48} /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredShelters.map(shelter => (
                            <Link
                                key={shelter.id}
                                to={`/shelters/${shelter.id}`}
                                className="group bg-white rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:border-brand-200 transition-all duration-500 flex flex-col overflow-hidden transform hover:-translate-y-2"
                            >
                                {/* Card Header - No overflow hidden here to let logo pop out */}
                                <div className="h-32 bg-brand-600 relative">
                                    {/* New Dynamic Paw Pattern */}
                                    <div className="absolute inset-0 overflow-hidden rounded-t-[2.5rem] pointer-events-none">
                                        <div className="absolute top-2 left-4 opacity-[0.08] transform -rotate-12 scale-110"><PawPrint size={48} className="text-white fill-current" /></div>
                                        <div className="absolute top-10 right-10 opacity-[0.04] transform rotate-45 scale-150"><PawPrint size={56} className="text-white fill-current" /></div>
                                        <div className="absolute bottom-4 left-1/4 opacity-[0.06] transform rotate-12 scale-90"><PawPrint size={32} className="text-white fill-current" /></div>
                                        <div className="absolute top-1/2 right-1/4 opacity-[0.03] transform -rotate-90 scale-125"><PawPrint size={40} className="text-white fill-current" /></div>
                                        <div className="absolute -top-4 right-1/2 opacity-[0.05] transform rotate-[160deg] scale-110"><PawPrint size={44} className="text-white fill-current" /></div>
                                    </div>

                                    {/* Centered Logo - Positioned relative to orange header but allowed to overflow below */}
                                    <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-20">
                                        <div className="w-24 h-24 rounded-[2rem] bg-white border-4 border-white shadow-2xl flex-shrink-0 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-110">
                                            {shelter.logoUrl ? (
                                                <img src={shelter.logoUrl} alt={shelter.name} className="w-full h-full object-contain p-1" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50">
                                                    <Building2 size={40} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {shelter.isVerified && (
                                        <div className="absolute top-4 right-6 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 shadow-sm flex items-center gap-1.5 transition-colors group-hover:bg-white/40 z-10">
                                            <ShieldCheck size={14} className="text-white" />
                                            <span className="text-[10px] font-black text-white">Overený</span>
                                        </div>
                                    )}
                                </div>

                                <div className="px-6 pt-16 pb-4 text-center">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-black text-2xl text-gray-900 group-hover:text-brand-600 transition truncate leading-tight">
                                            {shelter.name}
                                        </h3>
                                        <div className="flex items-center justify-center text-xs font-bold text-gray-400 mt-1">
                                            <MapPin size={12} className="mr-1 text-brand-500" />
                                            {shelter.location}
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-6 mt-auto flex flex-col gap-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col p-4 bg-orange-50/50 rounded-[1.5rem] border border-orange-100/50 group-hover:bg-orange-50 transition-colors text-center">
                                            <div className="flex items-center justify-center gap-2 text-orange-700 font-black text-2xl">
                                                <Dog size={20} />
                                                {shelter.stats.currentAnimals || 0}
                                            </div>
                                            <span className="text-[9px] font-black text-orange-400 mt-1">V opateri</span>
                                        </div>
                                        <div className="flex flex-col p-4 bg-green-50/50 rounded-[1.5rem] border border-green-100/50 group-hover:bg-green-50 transition-colors text-center">
                                            <div className="flex items-center justify-center gap-2 text-green-700 font-black text-2xl">
                                                <Heart size={20} />
                                                {shelter.stats.adoptions || 0}
                                            </div>
                                            <span className="text-[9px] font-black text-green-400 mt-1">Doma</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between group/btn bg-gray-50/50 p-2 rounded-2xl border border-transparent group-hover:border-gray-100 transition-all">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-brand-600 ml-4">
                                            Zobraziť útulok <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-gray-300 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-brand-200">
                                            <ChevronRight size={24} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {filteredShelters.length === 0 && (
                            <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-200 animate-in fade-in duration-700">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                                    <Building2 size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Nenašli sme žiadne útulky</h3>
                                <p className="text-gray-500 mt-2 max-w-xs mx-auto font-medium">Skúste zadať iný názov mesta alebo útulku.</p>
                                <button onClick={() => setSearchTerm('')} className="mt-8 text-brand-600 font-black text-xs underline underline-offset-8">Zobraziť všetky</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShelterListPage;

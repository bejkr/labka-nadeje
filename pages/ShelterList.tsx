import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Shelter } from '../types';
import { MapPin, Phone, Mail, ArrowRight, Building2, Loader2, Search, CheckCircle2, Users, Heart, ExternalLink, ChevronRight, Dog } from 'lucide-react';

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
                          Mapa útulkov <br/>
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
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600" size={48}/></div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredShelters.map(shelter => (
                      <Link 
                        key={shelter.id} 
                        to={`/shelters/${shelter.id}`} 
                        className="group bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-2xl hover:border-brand-100 transition-all duration-300 flex flex-col overflow-hidden transform hover:-translate-y-1.5"
                      >
                          <div className="p-6 pb-4">
                              <div className="flex items-start justify-between gap-4">
                                  <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 p-2 flex-shrink-0 group-hover:bg-white group-hover:border-brand-100 transition-colors">
                                      {shelter.logoUrl ? (
                                          <img src={shelter.logoUrl} alt={shelter.name} className="w-full h-full object-contain" />
                                      ) : (
                                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                                              <Building2 size={32} />
                                          </div>
                                      )}
                                  </div>
                                  <div className="flex-1 min-w-0 pt-1">
                                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                          <h3 className="font-extrabold text-xl text-gray-900 group-hover:text-brand-600 transition truncate">
                                              {shelter.name}
                                          </h3>
                                          {shelter.isVerified && (
                                              <span className="bg-blue-50 text-blue-600 p-0.5 rounded-full" title="Overený partner">
                                                  <CheckCircle2 size={16} className="fill-blue-50" />
                                              </span>
                                          )}
                                      </div>
                                      <div className="flex items-center text-sm font-medium text-gray-500">
                                          <MapPin size={14} className="mr-1.5 text-brand-500" />
                                          {shelter.location}
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="px-6 py-4 space-y-3 flex-1">
                              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50/50 p-2 rounded-xl border border-transparent group-hover:border-gray-100 transition-colors">
                                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 group-hover:text-brand-500 transition-colors shadow-sm">
                                      <Mail size={16} />
                                  </div>
                                  <span className="truncate">{shelter.email}</span>
                              </div>
                              {shelter.phone && (
                                  <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50/50 p-2 rounded-xl border border-transparent group-hover:border-gray-100 transition-colors">
                                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 group-hover:text-brand-500 transition-colors shadow-sm">
                                          <Phone size={16} />
                                      </div>
                                      <span>{shelter.phone}</span>
                                  </div>
                              )}
                          </div>

                          <div className="px-6 py-5 mt-auto bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                               <div className="flex gap-5">
                                   <div className="flex flex-col">
                                       <div className="flex items-center gap-1.5 text-gray-900 font-extrabold text-lg">
                                           <Dog size={16} className="text-orange-500" />
                                           {shelter.stats.currentAnimals || 0}
                                       </div>
                                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">K dispozícii</span>
                                   </div>
                                   <div className="flex flex-col border-l border-gray-200 pl-5">
                                       <div className="flex items-center gap-1.5 text-gray-900 font-extrabold text-lg">
                                           <Heart size={16} className="text-red-500" />
                                           {shelter.stats.adoptions || 0}
                                       </div>
                                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Adoptovaných</span>
                                   </div>
                               </div>
                               <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-300 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">
                                   <ChevronRight size={20} />
                               </div>
                          </div>
                      </Link>
                  ))}

                  {filteredShelters.length === 0 && (
                      <div className="col-span-full py-24 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                          <Building2 size={48} className="mx-auto text-gray-200 mb-4" />
                          <h3 className="text-xl font-bold text-gray-900">Nenašli sme žiadne útulky</h3>
                          <p className="text-gray-500 mt-2">Skúste zadať iný názov mesta alebo útulku.</p>
                      </div>
                  )}
              </div>
          )}
      </div>
    </div>
  );
};

export default ShelterListPage;

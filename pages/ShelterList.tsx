
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Shelter } from '../types';
import { MapPin, Phone, Mail, ArrowRight, Building2, Loader2, Search, CheckCircle } from 'lucide-react';

// Hardcoded coordinates for major Slovak cities/regions to mock geocoding
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
};

const DEFAULT_CENTER: [number, number] = [48.669, 19.699]; // Center of Slovakia (approx)

const ShelterListPage: React.FC = () => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ref for map container
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null); // Leaflet Map instance

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

  // Initialize Map with Retry Logic
  useEffect(() => {
    if (loading || !mapRef.current) return;
    
    let retryCount = 0;
    const maxRetries = 20; // 2 seconds max wait

    const initMap = () => {
        // @ts-ignore
        const L = window.L;
        
        // If Leaflet is not yet loaded, retry
        if (!L) {
            if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(initMap, 100);
            }
            return;
        }

        if (mapInstance.current) {
            mapInstance.current.remove(); // Cleanup previous map if exists
        }

        const map = L.map(mapRef.current).setView(DEFAULT_CENTER, 7);
        mapInstance.current = map;

        // Add OpenStreetMap Tile Layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Custom CSS-based Icon (SVG inside DIV)
        const createCustomIcon = () => {
            return L.divIcon({
                className: 'custom-map-marker',
                html: `
                  <div style="position: relative; width: 44px; height: 44px; display: flex; justify-content: center;">
                    <div style="
                        position: relative;
                        width: 36px; 
                        height: 36px; 
                        background-color: #f97316; 
                        border: 3px solid white; 
                        border-radius: 50%; 
                        box-shadow: 0 4px 10px rgba(249, 115, 22, 0.4);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 20;
                    ">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58 1.57 3.8.34 6.4C21.6 12 21 18 12 21S2.4 12 3.24 9.4c-1.23-2.6-1.06-5.82.34-6.4 1.39-.58 4.64.26 6.42 2.26.65-.17 1.33-.26 2-.26z"></path>
                        </svg>
                    </div>
                    <div style="
                        position: absolute; 
                        bottom: 2px; 
                        width: 0; 
                        height: 0; 
                        border-left: 8px solid transparent;
                        border-right: 8px solid transparent;
                        border-top: 12px solid #f97316;
                        z-index: 10;
                    "></div>
                  </div>
                `,
                iconSize: [44, 44],
                iconAnchor: [22, 42], // Tip of the pin
                popupAnchor: [0, -44] // Above the pin
            });
        };

        // Add Markers
        shelters.forEach(shelter => {
            // Try to match exact city or partial match
            let coords = CITY_COORDS[shelter.location];
            
            // Fallback: Check if location string contains a city name
            if (!coords) {
                 const foundCity = Object.keys(CITY_COORDS).find(city => shelter.location.includes(city));
                 if (foundCity) coords = CITY_COORDS[foundCity];
            }

            // If still no coords, add random offset around center to avoid stacking (Mocking)
            if (!coords) {
                coords = [
                    DEFAULT_CENTER[0] + (Math.random() - 0.5) * 1.5,
                    DEFAULT_CENTER[1] + (Math.random() - 0.5) * 3
                ];
            }

            const marker = L.marker(coords, { icon: createCustomIcon() }).addTo(map);
            
            // Popup Content
            const popupContent = `
                <div style="text-align: center; font-family: sans-serif; min-width: 150px;">
                    <div style="font-weight: 800; color: #111827; margin-bottom: 4px; font-size: 14px;">${shelter.name}</div>
                    <div style="font-size: 11px; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; font-weight: 700;">${shelter.location}</div>
                    <a href="#/shelters/${shelter.id}" style="display: inline-block; padding: 6px 12px; background-color: #f97316; color: white; font-size: 11px; font-weight: 700; border-radius: 999px; text-decoration: none; box-shadow: 0 2px 4px rgba(249, 115, 22, 0.3);">
                        Zobraziť profil
                    </a>
                </div>
            `;
            marker.bindPopup(popupContent);
        });
    }

    initMap();

    // Cleanup on unmount
    return () => {
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }
    };
  }, [loading, shelters]);

  const filteredShelters = shelters.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      
      {/* 1. Header & Map Section */}
      <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Text */}
                  <div className="p-8 md:p-16 flex flex-col justify-center order-2 lg:order-1">
                      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                          Mapa Útulkov <br/>
                          <span className="text-brand-600">Slovenska</span>
                      </h1>
                      <p className="text-lg text-gray-600 mb-8 max-w-lg">
                          Nájdite najbližšie útočisko pre opustené zvieratká vo vašom okolí. 
                          Spolupracujeme s viac ako {shelters.length} organizáciami po celej krajine.
                      </p>
                      
                      <div className="relative max-w-md">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input 
                              type="text" 
                              placeholder="Hľadať útulok alebo mesto..." 
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 shadow-sm"
                          />
                      </div>
                  </div>

                  {/* Map Container */}
                  <div className="h-[400px] lg:h-[600px] bg-gray-100 relative order-1 lg:order-2">
                       {loading ? (
                           <div className="absolute inset-0 flex items-center justify-center">
                               <Loader2 className="animate-spin text-brand-600" size={32} />
                           </div>
                       ) : (
                           <div ref={mapRef} className="w-full h-full z-10" style={{ zIndex: 1 }}></div>
                       )}
                  </div>
              </div>
          </div>
      </div>

      {/* 2. Shelter List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <Building2 className="text-brand-600" />
              Zoznam partnerov ({filteredShelters.length})
          </h2>

          {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600" size={48}/></div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredShelters.map(shelter => (
                      <Link key={shelter.id} to={`/shelters/${shelter.id}`} className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1">
                          <div className="flex items-center gap-4 mb-6">
                              <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 p-1 flex-shrink-0 group-hover:border-brand-200 transition">
                                  {shelter.logoUrl ? (
                                      <img src={shelter.logoUrl} alt={shelter.name} className="w-full h-full object-contain" />
                                  ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                                          <Building2 size={24} />
                                      </div>
                                  )}
                              </div>
                              <div>
                                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-brand-600 transition leading-tight mb-1 flex items-center gap-1">
                                      {shelter.name}
                                      {shelter.isVerified && <CheckCircle size={14} className="text-green-500 fill-green-100" />}
                                  </h3>
                                  <div className="flex items-center text-sm text-gray-500">
                                      <MapPin size={14} className="mr-1 text-gray-400" />
                                      {shelter.location}
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-3 mb-6 flex-1">
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                  <Mail size={16} className="text-gray-400" />
                                  <span className="truncate">{shelter.email}</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                  <Phone size={16} className="text-gray-400" />
                                  <span>{shelter.phone || '-'}</span>
                              </div>
                          </div>

                          <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                               <div className="flex gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                   <span>{shelter.stats.currentAnimals || 0} Zvierat</span>
                                   <span>{shelter.stats.adoptions || 0} Adopcií</span>
                               </div>
                               <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-600 group-hover:text-white transition">
                                   <ArrowRight size={16} />
                               </span>
                          </div>
                      </Link>
                  ))}
                  
                  {filteredShelters.length === 0 && (
                      <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500">
                          Nenašli sa žiadne útulky zodpovedajúce hľadaniu "{searchTerm}".
                      </div>
                  )}
              </div>
          )}
      </div>
    </div>
  );
};

export default ShelterListPage;

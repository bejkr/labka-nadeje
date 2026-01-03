import Papa from 'papaparse';
import { Pet, PetType, Gender, Size } from '../types';

export interface CSVRow {
    Meno: string;
    Druh: string;
    Plemeno: string;
    Vek: string;
    Pohlavie: string;
    Velkost: string;
    Popis: string;
    Obrazok?: string;
    Ockovany?: string;
    Kastrovany?: string;
    Odcrevneny?: string;
    Cipovany?: string;
    Znasanlivost_deti?: string;
    Znasanlivost_psy?: string;
    Znasanlivost_macka?: string;
}

export interface ParseResult {
    data: Partial<Pet>[];
    errors: string[];
}

const mapBoolean = (value?: string): boolean => {
    if (!value) return false;
    const v = value.toLowerCase().trim();
    return v === 'áno' || v === 'ano' || v === 'yes' || v === 'true' || v === '1';
};

const mapEnum = <T>(value: string, enumObj: any, defaultValue: T): T => {
    if (!value) return defaultValue;
    const v = value.trim();
    // Try to find by value (exact match first)
    const entry = Object.values(enumObj).find((val) => val === v);
    if (entry) return entry as T;

    // Fallback or specific mappings could go here
    return defaultValue;
};

export const parsePetsCSV = (file: File): Promise<ParseResult> => {
    return new Promise((resolve) => {
        Papa.parse<CSVRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const pets: Partial<Pet>[] = [];
                const errors: string[] = [];

                results.data.forEach((row, index) => {
                    const lineNum = index + 2; // +1 for header, +1 for 0-index

                    if (!row.Meno || !row.Druh) {
                        errors.push(`Riadok ${lineNum}: Chýba Meno alebo Druh`);
                        return;
                    }

                    try {
                        const pet: Partial<Pet> = {
                            name: row.Meno.trim(),
                            type: mapEnum(row.Druh, PetType, PetType.OTHER),
                            breed: row.Plemeno?.trim() || 'Neznáme',
                            age: parseInt(row.Vek) || 0,
                            gender: mapEnum(row.Pohlavie, Gender, Gender.MALE),
                            size: mapEnum(row.Velkost, Size, Size.MEDIUM),
                            description: row.Popis?.trim() || 'Bez popisu',
                            imageUrl: row.Obrazok?.trim() || '',
                            health: {
                                isVaccinated: mapBoolean(row.Ockovany),
                                isCastrated: mapBoolean(row.Kastrovany),
                                isDewormed: mapBoolean(row.Odcrevneny),
                                isChipped: mapBoolean(row.Cipovany),
                                hasAllergies: false,
                            },
                            social: {
                                children: row.Znasanlivost_deti as any || 'Neznáme',
                                dogs: row.Znasanlivost_psy as any || 'Neznáme',
                                cats: row.Znasanlivost_macka as any || 'Neznáme'
                            },
                            training: {
                                toiletTrained: false,
                                leashTrained: false,
                                carTravel: false,
                                aloneTime: false
                            },
                            requirements: {
                                activityLevel: 'Stredná',
                                suitableFor: [],
                                unsuitableFor: []
                            },
                            tags: [],
                            adoptionStatus: 'Available',
                            isVisible: true,
                            views: 0
                        };
                        pets.push(pet);
                    } catch (e) {
                        errors.push(`Riadok ${lineNum}: Chyba pri spracovaní dát`);
                    }
                });

                resolve({ data: pets, errors });
            },
            error: (error) => {
                resolve({ data: [], errors: [error.message] });
            }
        });
    });
};

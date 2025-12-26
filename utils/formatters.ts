
/**
 * Formátuje počet rokov podľa slovenských pravidiel:
 * 1 rok, 2-4 roky, 5+ rokov (a 0 rokov)
 */
export const formatSlovakAge = (age: number): string => {
  const roundedAge = Math.floor(age);
  if (roundedAge === 1) return `${age} rok`;
  if (roundedAge >= 2 && roundedAge <= 4) return `${age} roky`;
  return `${age} rokov`;
};

/**
 * Jednoduché skloňovanie mien do datívu (komu/čomu?) pre potreby UI.
 * Pokrýva najčastejšie slovenské vzory mien zvierat.
 */
export const inflectNameToDative = (name: string): string => {
  if (!name) return "";
  
  // Odstránime prípadné markdown hviezdičky z DB
  const cleanName = name.replace(/\*\*/g, '').trim();
  const lowerName = cleanName.toLowerCase();

  // 1. Mená končiace na -o (Ronaldo, Bruno, Hugo) -> -ovi
  if (lowerName.endsWith('o')) {
    return cleanName.slice(0, -1) + 'ovi';
  }

  // 2. Ženské mená končiace na -a (Micka, Bella, Luna) -> -e
  if (lowerName.endsWith('a')) {
    // Výnimka pre -ia (Mia -> Mii, Sofia -> Sofii)
    if (lowerName.endsWith('ia')) {
      return cleanName.slice(0, -1) + 'i';
    }
    return cleanName.slice(0, -1) + 'e';
  }

  // 3. Mená končiace na -y/-i (Bary, Rocky) -> -mu
  if (lowerName.endsWith('y') || lowerName.endsWith('i')) {
    return cleanName + 'mu';
  }

  // 4. Mená končiace na spoluhlásku (Ben, Max, Bak) -> -ovi
  return cleanName + 'ovi';
};

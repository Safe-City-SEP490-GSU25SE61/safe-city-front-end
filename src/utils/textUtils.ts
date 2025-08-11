/**
 * Normalize Vietnamese text by removing diacritics/accents
 * This allows searching with basic Latin characters
 * Example: "Bến Nghé" becomes "ben nghe"
 */
export const normalizeVietnameseText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose characters with diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/đ/g, 'd') // Replace đ with d
    .replace(/Đ/g, 'd') // Replace Đ with d
    .trim();
};

/**
 * Check if search term matches text (ignoring Vietnamese diacritics)
 * @param text - The text to search in
 * @param searchTerm - The search term
 * @returns boolean indicating if there's a match
 */
export const matchesVietnameseSearch = (text: string, searchTerm: string): boolean => {
  const normalizedText = normalizeVietnameseText(text);
  const normalizedSearch = normalizeVietnameseText(searchTerm);
  return normalizedText.includes(normalizedSearch);
};

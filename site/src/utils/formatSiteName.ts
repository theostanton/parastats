/**
 * Formats site names to be more readable and visually appealing
 */
export function formatSiteName(siteName: string): string {
  if (!siteName) return siteName;

  // Convert to proper title case while preserving French accents and special characters
  const titleCase = siteName.toLowerCase()
    .split(' ')
    .map(word => {
      // Don't capitalize common French prepositions/articles in the middle of names
      if (word === 'de' || word === 'la' || word === 'le' || word === 'du' || word === 'des' || word === 'l\'') {
        return word;
      }
      // Capitalize first letter, preserve rest (for accented characters)
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');

  // Always capitalize the first word regardless of whether it's an article
  const words = titleCase.split(' ');
  if (words.length > 0) {
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  }

  // Clean up spacing around hyphens for better readability
  let formatted = words.join(' ')
    .replace(/\s*-\s*/g, ' - ')  // Ensure consistent spacing around hyphens
    .replace(/\s+/g, ' ')        // Remove extra spaces
    .trim();

  return formatted;
}

/**
 * Creates a shorter version of site names for compact displays (mobile, cards, etc.)
 */
export function formatSiteNameShort(siteName: string, maxLength: number = 25): string {
  const formatted = formatSiteName(siteName);
  
  if (formatted.length <= maxLength) {
    return formatted;
  }

  // Try to abbreviate by taking the last part after the last hyphen (usually the specific site name)
  const parts = formatted.split(' - ');
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    if (lastPart.length <= maxLength) {
      return lastPart;
    }
  }

  // If still too long, truncate with ellipsis
  return formatted.substring(0, maxLength - 3) + '...';
}

/**
 * Formats site names for use in URLs (slugs)
 */
export function formatSiteNameForUrl(siteName: string): string {
  return formatSiteName(siteName)
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
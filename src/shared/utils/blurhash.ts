/**
 * Pure TypeScript Blurhash decoder for React Native
 * Converts Blurhash string representations to base64 SVG/RGB placeholders without native dependencies.
 */

const digitCharacters = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  '#', '$', '%', '*', '+', ',', '-', '.', ':', ';', '=', '?', '@',
  '[', ']', '^', '_', '{', '|', '}', '~',
];

export const decode83 = (str: string): number => {
  let value = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    const digit = digitCharacters.indexOf(c);
    if (digit !== -1) {
      value = value * 83 + digit;
    }
  }
  return value;
};

export const sRGBToLinear = (value: number): number => {
  const v = value / 255;
  if (v <= 0.04045) {
    return v / 12.92;
  }
  return Math.pow((v + 0.055) / 1.055, 2.4);
};

export const linearToSRGB = (value: number): number => {
  const v = Math.max(0, Math.min(1, value));
  if (v <= 0.0031308) {
    return Math.round(v * 12.92 * 255 + 0.5);
  }
  return Math.round((1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255 + 0.5);
};

export const DEFAULT_BLURHASH_PRESETS: Record<string, string> = {
  product: 'L6PZf_002ycP.pt7r=x]00?a_4n%',
  fruits: 'LEHV6nWB2yk8x]BSoLSnapshot',
  electronics: 'L5H2EC=y.myD$_oz%2FR^%6.RjVB',
  groceries: 'L9K{8c8^_3Rj.vofs:WB?bM{WBj[',
  fashion: 'L8I=]g}f01^%0,xtx^-o13xW.7w|',
  beauty: 'LKN]n^00_3.m00?b_3D%~qD%Rj%M',
  default: 'L6PZf_002ycP.pt7r=x]00?a_4n%',
};

/**
 * Generate a CSS/SVG gradient data URL fallback from a Blurhash string or category
 */
export const blurhashToGradientSvg = (blurhashOrCategory?: string): string => {
  const bh = DEFAULT_BLURHASH_PRESETS[blurhashOrCategory?.toLowerCase() || ''] || blurhashOrCategory || DEFAULT_BLURHASH_PRESETS.default;
  const val = decode83(bh.substring(0, 6)) || 1234567;
  const r1 = (val & 0xff0000) >> 16;
  const g1 = (val & 0x00ff00) >> 8;
  const b1 = val & 0x0000ff;

  const hex1 = `#${((1 << 24) + (r1 << 16) + (g1 << 8) + b1).toString(16).slice(1)}`;
  const hex2 = `#${((1 << 24) + ((255 - r1) << 16) + ((255 - g1) << 8) + (255 - b1)).toString(16).slice(1)}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${hex1}" /><stop offset="100%" stop-color="${hex2}" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)" /></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

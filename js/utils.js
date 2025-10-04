/* Shared utilities for the CSS Playground scripts
   Provides hex validation/parsing and readable text color helpers.
   Exposes a single global object: CSSPlaygroundUtils
*/
(function (global) {
  const utils = {
    isValidHex(hex) {
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    },

    // Convert 3 or 6 char hex to {r,g,b}
    parseColorToRgb(input) {
      if (!input) return null;
      input = input.trim();
      if (input[0] === '#') {
        if (input.length === 4) {
          const r = parseInt(input[1] + input[1], 16);
          const g = parseInt(input[2] + input[2], 16);
          const b = parseInt(input[3] + input[3], 16);
          return { r, g, b };
        }
        if (input.length === 7) {
          const r = parseInt(input.slice(1, 3), 16);
          const g = parseInt(input.slice(3, 5), 16);
          const b = parseInt(input.slice(5, 7), 16);
          return { r, g, b };
        }
        return null;
      }
      // rgb/rgba formats (basic parse)
      const rgbMatch = input.match(/rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})/i);
      if (rgbMatch) {
        return {
          r: parseInt(rgbMatch[1], 10),
          g: parseInt(rgbMatch[2], 10),
          b: parseInt(rgbMatch[3], 10)
        };
      }
      return null;
    },

    // Convert hex + alpha percent to rgba(...) string
    hexToRgba(hex, alphaPercent) {
      if (!hex || hex[0] !== '#') return `rgba(0,0,0,${(alphaPercent || 100) / 100})`;
      if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      }
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alphaPercent / 100})`;
    },

    // Returns either '#000000' or '#ffffff' depending on perceptive luminance
    pickReadableText(colorInput) {
      const rgb = this.parseColorToRgb(colorInput);
      if (!rgb) return '#000000';
      const { r, g, b } = rgb;
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq >= 128 ? '#000000' : '#ffffff';
    }
  };

  global.CSSPlaygroundUtils = utils;
})(typeof window !== 'undefined' ? window : this);

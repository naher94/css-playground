function init() {
  const controls = {
    horizontal: document.getElementById('horizontal'),
    vertical: document.getElementById('vertical'),
    blur: document.getElementById('blur'),
    spread: document.getElementById('spread'),
    color: document.getElementById('color'),
    colorHex: document.getElementById('color-hex'),
    backgroundColor: document.getElementById('background-color'),
    backgroundColorHex: document.getElementById('background-color-hex'),
    borderRadius: document.getElementById('border-radius'),
    opacity: document.getElementById('opacity'),
    inset: document.getElementById('inset')
  };

  const inputFields = {
    horizontal: document.getElementById('horizontal-input'),
    vertical: document.getElementById('vertical-input'),
    blur: document.getElementById('blur-input'),
    spread: document.getElementById('spread-input'),
    borderRadius: document.getElementById('border-radius-input'),
    opacity: document.getElementById('opacity-input')
  };

  const preview = document.getElementById('preview');
  const cssCode = document.getElementById('cssCode');

  // Use shared utilities when available to avoid duplication
  const utils = (typeof CSSPlaygroundUtils !== 'undefined') ? CSSPlaygroundUtils : null;

  function isValidHex(hex) {
    return utils ? utils.isValidHex(hex) : /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  }

  function syncColorPicker(colorInput, hexInput) {
    const hexValue = hexInput.value;
    if (isValidHex(hexValue)) {
      colorInput.value = hexValue;
      updateShadow();
    }
  }

  function syncHexInput(colorInput, hexInput) {
    hexInput.value = colorInput.value;
    updateShadow();
  }

  function hexToRgba(hex, alpha) {
    if (utils) return utils.hexToRgba(hex, alpha);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
  }

  function pickReadableText(hex) {
    return utils ? utils.pickReadableText(hex) : (function (h) {
      if (!h || h[0] !== '#' || (h.length !== 7 && h.length !== 4)) return '#000000';
      if (h.length === 4) {
        h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
      }
      const r = parseInt(h.slice(1, 3), 16);
      const g = parseInt(h.slice(3, 5), 16);
      const b = parseInt(h.slice(5, 7), 16);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq >= 128 ? '#000000' : '#ffffff';
    })(hex);
  }

  function updateShadow() {
    // guard required elements
    if (!preview || !cssCode) return;

    const horizontal = controls.horizontal && controls.horizontal.value || 0;
    const vertical = controls.vertical && controls.vertical.value || 0;
    const blur = controls.blur && controls.blur.value || 0;
    const spread = controls.spread && controls.spread.value || 0;
    const color = controls.color && controls.color.value || '#000000';
    const backgroundColor = controls.backgroundColor && controls.backgroundColor.value || '#ffffff';
    const borderRadius = controls.borderRadius && controls.borderRadius.value || 0;
    const opacity = controls.opacity && controls.opacity.value || 100;
    const inset = controls.inset && controls.inset.checked ? 'inset ' : '';

    const rgba = hexToRgba(color, opacity);
    const boxShadow = `${inset}${horizontal}px ${vertical}px ${blur}px ${spread}px ${rgba}`;

    preview.style.boxShadow = boxShadow;
    preview.style.backgroundColor = backgroundColor;
    // expose background color as a CSS variable and compute a readable text color
    try {
      preview.style.setProperty('--preview-bg', backgroundColor);
      const textColor = pickReadableText(backgroundColor);
      preview.style.setProperty('--preview-text', textColor);
    } catch (e) {
      // ignore in environments where setProperty isn't available
    }
    preview.style.borderRadius = borderRadius + 'px';
    cssCode.textContent = `box-shadow: ${boxShadow};`;
  }

  function syncSliderToInput(property) {
    if (!controls[property] || !inputFields[property]) return;
    const sliderValue = controls[property].value;
    inputFields[property].value = sliderValue;
    updateShadow();
  }

  function syncInputToSlider(property, clamp) {
    if (!inputFields[property] || !controls[property]) return;
    const inputValue = inputFields[property].value;

    if (inputValue === '' || inputValue === '-') return;

    const parsed = parseFloat(inputValue);
    if (isNaN(parsed)) return;

    const min = parseFloat(inputFields[property].getAttribute('min'));
    const max = parseFloat(inputFields[property].getAttribute('max'));
    const constrainedValue = Math.max(min, Math.min(max, parsed));

    controls[property].value = constrainedValue;
    if (clamp) {
      inputFields[property].value = constrainedValue;
    }
    updateShadow();
  }

  function applyPreset(preset) {
    switch (preset) {
      case 'subtle':
        setValues(0, 2, 4, 0, '#000000', '#ffffff', 12, 10, false);
        break;
      case 'medium':
        setValues(0, 4, 8, 0, '#000000', '#ffffff', 12, 25, false);
        break;
      case 'strong':
        setValues(0, 10, 25, -3, '#000000', '#ffffff', 12, 50, false);
        break;
      case 'neon':
        setValues(0, 0, 20, 5, '#0969da', '#1a1a1a', 20, 80, false);
        break;
      case 'inset':
        setValues(0, 2, 10, 0, '#000000', '#ffffff', 8, 25, true);
        break;
    }
    updateShadow();
  }

  function setValues(h, v, b, s, c, bg, br, o, i) {
    if (controls.horizontal) controls.horizontal.value = h;
    if (controls.vertical) controls.vertical.value = v;
    if (controls.blur) controls.blur.value = b;
    if (controls.spread) controls.spread.value = s;
    if (controls.color) controls.color.value = c;
    if (controls.colorHex) controls.colorHex.value = c;
    if (controls.backgroundColor) controls.backgroundColor.value = bg;
    if (controls.backgroundColorHex) controls.backgroundColorHex.value = bg;
    if (controls.borderRadius) controls.borderRadius.value = br;
    if (controls.opacity) controls.opacity.value = o;
    if (controls.inset) controls.inset.checked = i;

    if (inputFields.horizontal) inputFields.horizontal.value = h;
    if (inputFields.vertical) inputFields.vertical.value = v;
    if (inputFields.blur) inputFields.blur.value = b;
    if (inputFields.spread) inputFields.spread.value = s;
    if (inputFields.borderRadius) inputFields.borderRadius.value = br;
    if (inputFields.opacity) inputFields.opacity.value = o;
  }

  function copyCSS() {
    if (!cssCode) return;
    const cssText = cssCode.textContent;
    navigator.clipboard.writeText(cssText).then(() => {
      const copyBtn = document.getElementById('copyBtn');
      if (copyBtn) {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy CSS';
          copyBtn.classList.remove('copied');
        }, 2000);
      }
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = cssText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      const copyBtn = document.getElementById('copyBtn');
      if (copyBtn) {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy CSS';
          copyBtn.classList.remove('copied');
        }, 2000);
      }
    });
  }

  Object.keys(controls).forEach(property => {
    const element = controls[property];
    if (!element) return; // skip missing elements

    if (property !== 'color' && property !== 'backgroundColor' && property !== 'inset' && property !== 'colorHex' && property !== 'backgroundColorHex') {
      element.addEventListener('input', () => syncSliderToInput(property));
    } else if (property === 'color') {
      element.addEventListener('input', () => syncHexInput(controls.color, controls.colorHex));
    } else if (property === 'backgroundColor') {
      element.addEventListener('input', () => syncHexInput(controls.backgroundColor, controls.backgroundColorHex));
    } else if (property === 'colorHex') {
      element.addEventListener('input', () => syncColorPicker(controls.color, controls.colorHex));
    } else if (property === 'backgroundColorHex') {
      element.addEventListener('input', () => syncColorPicker(controls.backgroundColor, controls.backgroundColorHex));
    } else {
      element.addEventListener('input', updateShadow);
    }
  });

  Object.keys(inputFields).forEach(property => {
    const inputEl = inputFields[property];
    if (!inputEl) return;
    inputEl.addEventListener('input', () => syncInputToSlider(property, false));
    inputEl.addEventListener('blur', () => syncInputToSlider(property, true));
  });

  updateShadow();
  // Expose functions to global scope for inline handlers in HTML (e.g. onclick="applyPreset('subtle')")
  // Guard assignments so we don't overwrite in environments without window (e.g. some test runners)
  if (typeof window !== 'undefined') {
    window.applyPreset = applyPreset;
    window.copyCSS = copyCSS;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

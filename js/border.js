function initBorder() {
  const controls = {
    width: document.getElementById('border-width'),
    style: document.getElementById('border-style'),
    color: document.getElementById('border-color'),
    colorHex: document.getElementById('border-color-hex'),
    radius: document.getElementById('border-radius')
  };

  const inputs = {
    width: document.getElementById('border-width-input'),
    radius: document.getElementById('border-radius-input')
  };

  const preview = document.getElementById('preview');
  const cssCode = document.getElementById('cssCode');

  function isValidHex(hex) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  }

  function syncColorPicker() {
    if (!controls.color || !controls.colorHex) return;
    const hex = controls.colorHex.value;
    if (isValidHex(hex)) controls.color.value = hex;
    updateBorder();
  }

  function syncHexInput() {
    if (!controls.color || !controls.colorHex) return;
    controls.colorHex.value = controls.color.value;
    updateBorder();
  }

  function updateBorder() {
    if (!preview || !cssCode) return;
    const w = controls.width && controls.width.value || 1;
    const s = controls.style && controls.style.value || 'solid';
    const c = controls.color && controls.color.value || '#1d1d1f';
    const r = controls.radius && controls.radius.value || 0;

    const borderValue = `${w}px ${s} ${c}`;
    preview.style.border = borderValue;
    preview.style.borderRadius = r + 'px';
    cssCode.textContent = `border: ${borderValue};\nborder-radius: ${r}px;`;

    try {
      const bg = window.getComputedStyle(preview).backgroundColor || '#ffffff';
      preview.style.setProperty('--preview-bg', bg);
      // compute readable text color from the preview background (not the border color)
      const textColor = pickReadableText(bg);
      preview.style.setProperty('--preview-text', textColor);
    } catch (e) {}
  }

  function parseColorToRgb(input) {
    if (!input) return null;
    input = input.trim();
    // hex formats
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
    // rgb/rgba formats
    const rgbMatch = input.match(/rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})/i);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1], 10),
        g: parseInt(rgbMatch[2], 10),
        b: parseInt(rgbMatch[3], 10)
      };
    }
    return null;
  }

  function pickReadableText(colorInput) {
    const rgb = parseColorToRgb(colorInput);
    if (!rgb) return '#000000';
    const { r, g, b } = rgb;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#000000' : '#ffffff';
  }

  function syncSliderToInput(prop) {
    if (!controls[prop] || !inputs[prop]) return;
    inputs[prop].value = controls[prop].value;
    updateBorder();
  }

  function syncInputToSlider(prop) {
    if (!controls[prop] || !inputs[prop]) return;
    const min = parseFloat(inputs[prop].getAttribute('min')) || 0;
    const max = parseFloat(inputs[prop].getAttribute('max')) || 100;
    let v = parseFloat(inputs[prop].value) || min;
    v = Math.max(min, Math.min(max, v));
    controls[prop].value = v;
    inputs[prop].value = v;
    updateBorder();
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
    }).catch(() => {});
  }

  // expose copy for onclick
  if (typeof window !== 'undefined') window.copyCSS = copyCSS;

  // border presets
  const borderPresets = {
    subtle: { width: 1, style: 'solid', color: '#dddddd', radius: 6 },
    dotted: { width: 10, style: 'dotted', color: '#7e00df', radius: 64 },
    strong: { width: 4, style: 'solid', color: '#0b0b0b', radius: 6 },
    double: { width: 8, style: 'double', color: '#00ffea', radius: 20 },
    rounded: { width: 17, style: 'groove', color: '#ffb5af', radius: 32 }
  };

  function applyBorderPreset(name) {
    const p = borderPresets[name];
    if (!p) return;
    if (controls.width) controls.width.value = p.width;
    if (controls.style) controls.style.value = p.style;
    if (controls.color) controls.color.value = p.color;
    if (controls.colorHex) controls.colorHex.value = p.color;
    if (controls.radius) controls.radius.value = p.radius;
    if (inputs.width) inputs.width.value = p.width;
    if (inputs.radius) inputs.radius.value = p.radius;
    updateBorder();
  }

  if (typeof window !== 'undefined') window.applyBorderPreset = applyBorderPreset;

  // wire controls
  if (controls.width) controls.width.addEventListener('input', () => syncSliderToInput('width'));
  if (controls.radius) controls.radius.addEventListener('input', () => syncSliderToInput('radius'));
  if (inputs.width) { inputs.width.addEventListener('input', () => syncInputToSlider('width')); inputs.width.addEventListener('blur', () => syncInputToSlider('width')); }
  if (inputs.radius) { inputs.radius.addEventListener('input', () => syncInputToSlider('radius')); inputs.radius.addEventListener('blur', () => syncInputToSlider('radius')); }
  if (controls.style) controls.style.addEventListener('change', updateBorder);
  if (controls.color) controls.color.addEventListener('input', syncHexInput);
  if (controls.colorHex) controls.colorHex.addEventListener('input', syncColorPicker);

  updateBorder();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBorder);
} else {
  initBorder();
}

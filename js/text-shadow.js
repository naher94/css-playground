function initTextShadow() {
  const controls = {
    horizontal: document.getElementById('horizontal'),
    vertical: document.getElementById('vertical'),
    blur: document.getElementById('blur'),
    color: document.getElementById('color'),
    colorHex: document.getElementById('color-hex'),
    opacity: document.getElementById('opacity'),
    textColor: document.getElementById('text-color'),
    textColorHex: document.getElementById('text-color-hex'),
    backgroundColor: document.getElementById('background-color'),
    backgroundColorHex: document.getElementById('background-color-hex'),
    fontSize: document.getElementById('font-size'),
    previewText: document.getElementById('preview-text-input')
  };

  const inputFields = {
    horizontal: document.getElementById('horizontal-input'),
    vertical: document.getElementById('vertical-input'),
    blur: document.getElementById('blur-input'),
    opacity: document.getElementById('opacity-input'),
    fontSize: document.getElementById('font-size-input')
  };

  const preview = document.getElementById('preview');
  const cssCode = document.getElementById('cssCode');

  const utils = (typeof CSSPlaygroundUtils !== 'undefined') ? CSSPlaygroundUtils : null;

  // Configure preview for text display
  if (preview) {
    preview.style.fontSize = '48px';
    preview.style.fontWeight = '700';
    preview.style.border = 'none';
    preview.style.width = 'auto';
    preview.style.height = 'auto';
    preview.style.minHeight = '200px';
    preview.style.padding = '40px';
    preview.style.wordBreak = 'break-word';
    preview.textContent = 'Shadow';
  }

  function isValidHex(hex) {
    return utils ? utils.isValidHex(hex) : /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  }

  function syncColorPicker(colorInput, hexInput) {
    var hexValue = hexInput.value;
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
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (alpha / 100) + ')';
  }

  function updateShadow() {
    if (!preview || !cssCode) return;

    var horizontal = (controls.horizontal && controls.horizontal.value) || 0;
    var vertical = (controls.vertical && controls.vertical.value) || 0;
    var blur = (controls.blur && controls.blur.value) || 0;
    var color = (controls.color && controls.color.value) || '#000000';
    var opacity = (controls.opacity && controls.opacity.value) || 100;
    var textColor = (controls.textColor && controls.textColor.value) || '#1d1d1f';
    var backgroundColor = (controls.backgroundColor && controls.backgroundColor.value) || '#ffffff';
    var fontSize = (controls.fontSize && controls.fontSize.value) || 48;
    var previewText = (controls.previewText && controls.previewText.value) || '';

    var rgba = hexToRgba(color, opacity);
    var textShadow = horizontal + 'px ' + vertical + 'px ' + blur + 'px ' + rgba;

    preview.style.textShadow = textShadow;
    preview.style.color = textColor;
    preview.style.backgroundColor = backgroundColor;
    preview.style.fontSize = fontSize + 'px';
    preview.textContent = previewText || '\u00A0';

    try {
      preview.style.setProperty('--preview-bg', backgroundColor);
    } catch (e) {}

    cssCode.textContent = 'text-shadow: ' + textShadow + ';';
  }

  function syncSliderToInput(property) {
    if (!controls[property] || !inputFields[property]) return;
    inputFields[property].value = controls[property].value;
    updateShadow();
  }

  function syncInputToSlider(property) {
    if (!inputFields[property] || !controls[property]) return;
    var inputValue = inputFields[property].value;
    var min = parseFloat(inputFields[property].getAttribute('min'));
    var max = parseFloat(inputFields[property].getAttribute('max'));
    var constrainedValue = Math.max(min, Math.min(max, parseFloat(inputValue) || 0));
    controls[property].value = constrainedValue;
    inputFields[property].value = constrainedValue;
    updateShadow();
  }

  var presets = {
    subtle: {
      horizontal: 1, vertical: 1, blur: 2,
      color: '#000000', opacity: 20,
      textColor: '#1d1d1f', backgroundColor: '#ffffff', fontSize: 48
    },
    glow: {
      horizontal: 0, vertical: 0, blur: 10,
      color: '#0969da', opacity: 80,
      textColor: '#0969da', backgroundColor: '#1a1a1a', fontSize: 56
    },
    neon: {
      horizontal: 0, vertical: 0, blur: 20,
      color: '#ff00ff', opacity: 100,
      textColor: '#ff00ff', backgroundColor: '#0a0a0a', fontSize: 56
    },
    hard: {
      horizontal: 3, vertical: 3, blur: 0,
      color: '#000000', opacity: 100,
      textColor: '#1d1d1f', backgroundColor: '#ffffff', fontSize: 56
    },
    retro: {
      horizontal: 4, vertical: 4, blur: 0,
      color: '#cc0000', opacity: 100,
      textColor: '#1d1d1f', backgroundColor: '#f5f5dc', fontSize: 64
    }
  };

  function setValues(p) {
    if (controls.horizontal) controls.horizontal.value = p.horizontal;
    if (controls.vertical) controls.vertical.value = p.vertical;
    if (controls.blur) controls.blur.value = p.blur;
    if (controls.color) controls.color.value = p.color;
    if (controls.colorHex) controls.colorHex.value = p.color;
    if (controls.opacity) controls.opacity.value = p.opacity;
    if (controls.textColor) controls.textColor.value = p.textColor;
    if (controls.textColorHex) controls.textColorHex.value = p.textColor;
    if (controls.backgroundColor) controls.backgroundColor.value = p.backgroundColor;
    if (controls.backgroundColorHex) controls.backgroundColorHex.value = p.backgroundColor;
    if (controls.fontSize) controls.fontSize.value = p.fontSize;

    if (inputFields.horizontal) inputFields.horizontal.value = p.horizontal;
    if (inputFields.vertical) inputFields.vertical.value = p.vertical;
    if (inputFields.blur) inputFields.blur.value = p.blur;
    if (inputFields.opacity) inputFields.opacity.value = p.opacity;
    if (inputFields.fontSize) inputFields.fontSize.value = p.fontSize;
  }

  function applyPreset(name) {
    var p = presets[name];
    if (!p) return;
    setValues(p);
    updateShadow();
  }

  function copyCSS() {
    if (!cssCode) return;
    var cssText = cssCode.textContent;
    navigator.clipboard.writeText(cssText).then(function () {
      var copyBtn = document.getElementById('copyBtn');
      if (copyBtn) {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(function () {
          copyBtn.textContent = 'Copy CSS';
          copyBtn.classList.remove('copied');
        }, 2000);
      }
    }).catch(function () {
      var textArea = document.createElement('textarea');
      textArea.value = cssText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      var copyBtn = document.getElementById('copyBtn');
      if (copyBtn) {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(function () {
          copyBtn.textContent = 'Copy CSS';
          copyBtn.classList.remove('copied');
        }, 2000);
      }
    });
  }

  // Slider controls
  var sliderProps = ['horizontal', 'vertical', 'blur', 'opacity', 'fontSize'];
  sliderProps.forEach(function (prop) {
    if (controls[prop]) {
      controls[prop].addEventListener('input', function () { syncSliderToInput(prop); });
    }
  });

  // Color pickers and hex inputs
  if (controls.color) controls.color.addEventListener('input', function () { syncHexInput(controls.color, controls.colorHex); });
  if (controls.colorHex) controls.colorHex.addEventListener('input', function () { syncColorPicker(controls.color, controls.colorHex); });
  if (controls.textColor) controls.textColor.addEventListener('input', function () { syncHexInput(controls.textColor, controls.textColorHex); });
  if (controls.textColorHex) controls.textColorHex.addEventListener('input', function () { syncColorPicker(controls.textColor, controls.textColorHex); });
  if (controls.backgroundColor) controls.backgroundColor.addEventListener('input', function () { syncHexInput(controls.backgroundColor, controls.backgroundColorHex); });
  if (controls.backgroundColorHex) controls.backgroundColorHex.addEventListener('input', function () { syncColorPicker(controls.backgroundColor, controls.backgroundColorHex); });

  // Preview text input
  if (controls.previewText) controls.previewText.addEventListener('input', updateShadow);

  // Number input fields
  Object.keys(inputFields).forEach(function (prop) {
    var el = inputFields[prop];
    if (!el) return;
    el.addEventListener('input', function () { syncInputToSlider(prop); });
    el.addEventListener('blur', function () { syncInputToSlider(prop); });
  });

  updateShadow();

  if (typeof window !== 'undefined') {
    window.applyPreset = applyPreset;
    window.copyCSS = copyCSS;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTextShadow);
} else {
  initTextShadow();
}

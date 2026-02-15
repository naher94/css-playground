function initGradient() {
  var GRADIENT_TYPES = [
    'linear-gradient', 'radial-gradient', 'conic-gradient',
    'repeating-linear-gradient', 'repeating-radial-gradient', 'repeating-conic-gradient'
  ];
  var RADIAL_SHAPES = ['ellipse', 'circle'];
  var RADIAL_SIZES = ['farthest-corner', 'closest-side', 'closest-corner', 'farthest-side'];
  var BG_REPEAT_OPTIONS = ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'];

  var layerListEl = document.getElementById('layer-list');
  var addLayerBtn = document.getElementById('add-layer-btn');
  var preview = document.getElementById('preview');
  var cssCode = document.getElementById('cssCode');
  var utils = (typeof CSSPlaygroundUtils !== 'undefined') ? CSSPlaygroundUtils : null;

  // Clear preview text and style for gradient display
  if (preview) {
    preview.textContent = '';
    preview.style.border = 'none';
    preview.style.borderRadius = '12px';
  }

  var nextLayerId = 1;

  function createDefaultLayer() {
    var id = nextLayerId++;
    return {
      id: id,
      type: 'linear-gradient',
      angle: 180,
      shape: 'ellipse',
      size: 'farthest-corner',
      posX: 50,
      posY: 50,
      startAngle: 0,
      stops: [
        { color: '#ff0000', opacity: 100, position: 0 },
        { color: '#0000ff', opacity: 100, position: 100 }
      ],
      bgSizeX: 100,
      bgSizeY: 100,
      bgSizeUnit: '%',
      bgPosX: 0,
      bgPosY: 0,
      bgPosUnit: '%',
      bgRepeat: 'no-repeat'
    };
  }

  var layers = [createDefaultLayer()];
  var activeLayerId = layers[0].id;

  function getLayerById(id) {
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].id === id) return layers[i];
    }
    return null;
  }

  function isValidHex(hex) {
    return utils ? utils.isValidHex(hex) : /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  }

  function hexToRgba(hex, alphaPercent) {
    return utils ? utils.hexToRgba(hex, alphaPercent) : (function () {
      if (!hex || hex[0] !== '#') return 'rgba(0,0,0,' + ((alphaPercent || 100) / 100) + ')';
      if (hex.length === 4) hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      var r = parseInt(hex.slice(1, 3), 16);
      var g = parseInt(hex.slice(3, 5), 16);
      var b = parseInt(hex.slice(5, 7), 16);
      return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (alphaPercent / 100) + ')';
    })();
  }

  // Build gradient CSS string for a single layer
  function buildGradientString(layer) {
    var stopsStr = layer.stops.map(function (s) {
      return hexToRgba(s.color, s.opacity) + ' ' + s.position + '%';
    }).join(', ');

    var base = layer.type;
    if (base === 'linear-gradient' || base === 'repeating-linear-gradient') {
      return base + '(' + layer.angle + 'deg, ' + stopsStr + ')';
    }
    if (base === 'radial-gradient' || base === 'repeating-radial-gradient') {
      return base + '(' + layer.shape + ' ' + layer.size + ' at ' + layer.posX + '% ' + layer.posY + '%, ' + stopsStr + ')';
    }
    if (base === 'conic-gradient' || base === 'repeating-conic-gradient') {
      return base + '(from ' + layer.startAngle + 'deg at ' + layer.posX + '% ' + layer.posY + '%, ' + stopsStr + ')';
    }
    return '';
  }

  // Generate full CSS and apply to preview
  function updatePreview() {
    if (!preview || !cssCode) return;

    var images = [];
    var sizes = [];
    var positions = [];
    var repeats = [];

    for (var i = 0; i < layers.length; i++) {
      var l = layers[i];
      images.push(buildGradientString(l));
      sizes.push(l.bgSizeX + l.bgSizeUnit + ' ' + l.bgSizeY + l.bgSizeUnit);
      positions.push(l.bgPosX + l.bgPosUnit + ' ' + l.bgPosY + l.bgPosUnit);
      repeats.push(l.bgRepeat);
    }

    var imgStr = images.join(',\n  ');
    var sizeStr = sizes.join(', ');
    var posStr = positions.join(', ');
    var repStr = repeats.join(', ');

    preview.style.backgroundImage = images.join(', ');
    preview.style.backgroundSize = sizeStr;
    preview.style.backgroundPosition = posStr;
    preview.style.backgroundRepeat = repStr;

    // Build CSS output
    var isSingleDefault = layers.length === 1 &&
      layers[0].bgSizeX === 100 && layers[0].bgSizeY === 100 && layers[0].bgSizeUnit === '%' &&
      layers[0].bgPosX === 0 && layers[0].bgPosY === 0 &&
      layers[0].bgRepeat === 'no-repeat';

    var css;
    if (isSingleDefault) {
      css = 'background: ' + images[0] + ';';
    } else {
      css = 'background-image:\n  ' + imgStr + ';\n';
      css += 'background-size: ' + sizeStr + ';\n';
      css += 'background-position: ' + posStr + ';\n';
      css += 'background-repeat: ' + repStr + ';';
    }

    cssCode.textContent = css;

    // Update per-layer gradient preview bars
    for (var j = 0; j < layers.length; j++) {
      var bar = document.getElementById('gradient-bar-' + layers[j].id);
      if (bar) {
        bar.style.background = buildGradientString(layers[j]);
      }
    }
  }

  // Render all layer panels
  function renderLayers() {
    if (!layerListEl) return;
    layerListEl.innerHTML = '';

    for (var i = 0; i < layers.length; i++) {
      var panel = renderLayerPanel(layers[i], i);
      layerListEl.appendChild(panel);
    }
  }

  function renderLayerPanel(layer, index) {
    var panel = document.createElement('div');
    panel.className = 'gradient-layer' + (layer.id === activeLayerId ? ' active' : '');
    panel.setAttribute('data-layer-id', layer.id);

    // Header
    var header = document.createElement('div');
    header.className = 'layer-header';

    var title = document.createElement('span');
    title.className = 'layer-title';
    title.textContent = 'Layer ' + (index + 1);

    var actions = document.createElement('div');
    actions.className = 'layer-actions';

    var upBtn = createLayerBtn('\u2191', 'Move Up', index === 0, function () { moveLayer(layer.id, -1); });
    var downBtn = createLayerBtn('\u2193', 'Move Down', index === layers.length - 1, function () { moveLayer(layer.id, 1); });
    var dupeBtn = createLayerBtn('\u2398', 'Duplicate', false, function () { duplicateLayer(layer.id); });
    var delBtn = createLayerBtn('\u2715', 'Delete', layers.length <= 1, function () { removeLayer(layer.id); });

    actions.appendChild(upBtn);
    actions.appendChild(downBtn);
    actions.appendChild(dupeBtn);
    actions.appendChild(delBtn);

    header.appendChild(title);
    header.appendChild(actions);

    header.addEventListener('click', function (e) {
      if (e.target.tagName === 'BUTTON') return;
      activeLayerId = layer.id;
      renderLayers();
      updatePreview();
    });

    // Body
    var body = document.createElement('div');
    body.className = 'layer-body' + (layer.id === activeLayerId ? ' expanded' : '');

    // Gradient type
    var typeGroup = createControlGroup('Type');
    var typeSelect = document.createElement('select');
    typeSelect.className = 'gradient-select';
    for (var t = 0; t < GRADIENT_TYPES.length; t++) {
      var opt = document.createElement('option');
      opt.value = GRADIENT_TYPES[t];
      opt.textContent = GRADIENT_TYPES[t];
      if (layer.type === GRADIENT_TYPES[t]) opt.selected = true;
      typeSelect.appendChild(opt);
    }
    typeSelect.addEventListener('change', function () {
      layer.type = typeSelect.value;
      renderLayers();
      updatePreview();
    });
    typeGroup.appendChild(typeSelect);
    body.appendChild(typeGroup);

    // Type-specific controls
    var base = layer.type;
    if (base === 'linear-gradient' || base === 'repeating-linear-gradient') {
      body.appendChild(createSliderGroup('Angle', layer.angle, 0, 360, 'deg', function (v) { layer.angle = v; updatePreview(); }));
    }
    if (base === 'radial-gradient' || base === 'repeating-radial-gradient') {
      body.appendChild(createSelectGroup('Shape', RADIAL_SHAPES, layer.shape, function (v) { layer.shape = v; updatePreview(); }));
      body.appendChild(createSelectGroup('Size', RADIAL_SIZES, layer.size, function (v) { layer.size = v; updatePreview(); }));
      body.appendChild(createSliderGroup('Center X', layer.posX, 0, 100, '%', function (v) { layer.posX = v; updatePreview(); }));
      body.appendChild(createSliderGroup('Center Y', layer.posY, 0, 100, '%', function (v) { layer.posY = v; updatePreview(); }));
    }
    if (base === 'conic-gradient' || base === 'repeating-conic-gradient') {
      body.appendChild(createSliderGroup('Start Angle', layer.startAngle, 0, 360, 'deg', function (v) { layer.startAngle = v; updatePreview(); }));
      body.appendChild(createSliderGroup('Center X', layer.posX, 0, 100, '%', function (v) { layer.posX = v; updatePreview(); }));
      body.appendChild(createSliderGroup('Center Y', layer.posY, 0, 100, '%', function (v) { layer.posY = v; updatePreview(); }));
    }

    // Color stops section
    var stopsHeader = document.createElement('div');
    stopsHeader.className = 'section-header';
    stopsHeader.textContent = 'Color Stops';
    body.appendChild(stopsHeader);

    // Gradient preview bar
    var bar = document.createElement('div');
    bar.className = 'gradient-preview-bar';
    bar.id = 'gradient-bar-' + layer.id;
    bar.style.background = buildGradientString(layer);
    body.appendChild(bar);

    // Stop rows
    for (var si = 0; si < layer.stops.length; si++) {
      body.appendChild(renderStopRow(layer, si));
    }

    var addStopBtn = document.createElement('button');
    addStopBtn.className = 'preset-btn';
    addStopBtn.style.width = '100%';
    addStopBtn.style.marginTop = '8px';
    addStopBtn.textContent = '+ Add Color Stop';
    addStopBtn.addEventListener('click', function () {
      addStop(layer.id);
    });
    body.appendChild(addStopBtn);

    // Positioning section
    var posHeader = document.createElement('div');
    posHeader.className = 'section-header';
    posHeader.style.marginTop = '16px';
    posHeader.textContent = 'Positioning';
    body.appendChild(posHeader);

    body.appendChild(createSliderGroup('Size X', layer.bgSizeX, 1, 200, layer.bgSizeUnit, function (v) { layer.bgSizeX = v; updatePreview(); }));
    body.appendChild(createSliderGroup('Size Y', layer.bgSizeY, 1, 200, layer.bgSizeUnit, function (v) { layer.bgSizeY = v; updatePreview(); }));
    body.appendChild(createSliderGroup('Position X', layer.bgPosX, 0, 100, '%', function (v) { layer.bgPosX = v; updatePreview(); }));
    body.appendChild(createSliderGroup('Position Y', layer.bgPosY, 0, 100, '%', function (v) { layer.bgPosY = v; updatePreview(); }));
    body.appendChild(createSelectGroup('Repeat', BG_REPEAT_OPTIONS, layer.bgRepeat, function (v) { layer.bgRepeat = v; updatePreview(); }));

    panel.appendChild(header);
    panel.appendChild(body);
    return panel;
  }

  function renderStopRow(layer, stopIndex) {
    var stop = layer.stops[stopIndex];
    var row = document.createElement('div');
    row.className = 'stop-row';

    // Color picker
    var colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = stop.color;
    colorPicker.addEventListener('input', function () {
      stop.color = colorPicker.value;
      hexInput.value = colorPicker.value;
      updatePreview();
    });

    // Hex input
    var hexInput = document.createElement('input');
    hexInput.type = 'text';
    hexInput.className = 'hex-input';
    hexInput.value = stop.color;
    hexInput.placeholder = '#000000';
    hexInput.addEventListener('input', function () {
      if (isValidHex(hexInput.value)) {
        stop.color = hexInput.value;
        colorPicker.value = hexInput.value;
        updatePreview();
      }
    });

    // Opacity slider
    var opacityLabel = document.createElement('span');
    opacityLabel.className = 'stop-label';
    opacityLabel.textContent = 'Op';
    var opacitySlider = document.createElement('input');
    opacitySlider.type = 'range';
    opacitySlider.min = '0';
    opacitySlider.max = '100';
    opacitySlider.value = stop.opacity;
    var opacityInput = document.createElement('input');
    opacityInput.type = 'number';
    opacityInput.className = 'value-input';
    opacityInput.min = '0';
    opacityInput.max = '100';
    opacityInput.value = stop.opacity;

    opacitySlider.addEventListener('input', function () {
      stop.opacity = parseInt(opacitySlider.value, 10);
      opacityInput.value = opacitySlider.value;
      updatePreview();
    });
    opacityInput.addEventListener('input', function () {
      var v = Math.max(0, Math.min(100, parseInt(opacityInput.value, 10) || 0));
      stop.opacity = v;
      opacitySlider.value = v;
      opacityInput.value = v;
      updatePreview();
    });

    // Position slider
    var posLabel = document.createElement('span');
    posLabel.className = 'stop-label';
    posLabel.textContent = 'Pos';
    var posSlider = document.createElement('input');
    posSlider.type = 'range';
    posSlider.min = '0';
    posSlider.max = '100';
    posSlider.value = stop.position;
    var posInput = document.createElement('input');
    posInput.type = 'number';
    posInput.className = 'value-input';
    posInput.min = '0';
    posInput.max = '100';
    posInput.value = stop.position;

    posSlider.addEventListener('input', function () {
      stop.position = parseInt(posSlider.value, 10);
      posInput.value = posSlider.value;
      updatePreview();
    });
    posInput.addEventListener('input', function () {
      var v = Math.max(0, Math.min(100, parseInt(posInput.value, 10) || 0));
      stop.position = v;
      posSlider.value = v;
      posInput.value = v;
      updatePreview();
    });

    // Remove button
    var removeBtn = document.createElement('button');
    removeBtn.className = 'stop-remove-btn';
    removeBtn.textContent = '\u2715';
    removeBtn.title = 'Remove stop';
    removeBtn.disabled = layer.stops.length <= 2;
    removeBtn.addEventListener('click', function () {
      removeStop(layer.id, stopIndex);
    });

    // Assemble row
    row.appendChild(colorPicker);
    row.appendChild(hexInput);

    var opWrap = document.createElement('div');
    opWrap.className = 'stop-slider-group';
    opWrap.appendChild(opacityLabel);
    var opSliderWrap = document.createElement('div');
    opSliderWrap.className = 'slider-wrapper';
    opSliderWrap.appendChild(opacitySlider);
    opWrap.appendChild(opSliderWrap);
    opWrap.appendChild(opacityInput);
    row.appendChild(opWrap);

    var posWrap = document.createElement('div');
    posWrap.className = 'stop-slider-group';
    posWrap.appendChild(posLabel);
    var posSliderWrap = document.createElement('div');
    posSliderWrap.className = 'slider-wrapper';
    posSliderWrap.appendChild(posSlider);
    posWrap.appendChild(posSliderWrap);
    posWrap.appendChild(posInput);
    row.appendChild(posWrap);

    row.appendChild(removeBtn);

    return row;
  }

  // Helper: create a control group with label
  function createControlGroup(labelText) {
    var group = document.createElement('div');
    group.className = 'control-group';
    var label = document.createElement('label');
    label.textContent = labelText;
    group.appendChild(label);
    return group;
  }

  // Helper: create slider + number input group
  function createSliderGroup(labelText, value, min, max, unit, onChange) {
    var group = createControlGroup(labelText);
    var container = document.createElement('div');
    container.className = 'slider-container';

    var wrapper = document.createElement('div');
    wrapper.className = 'slider-wrapper';
    var slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.value = value;
    wrapper.appendChild(slider);

    var numInput = document.createElement('input');
    numInput.type = 'number';
    numInput.className = 'value-input';
    numInput.min = min;
    numInput.max = max;
    numInput.value = value;

    slider.addEventListener('input', function () {
      numInput.value = slider.value;
      onChange(parseFloat(slider.value));
    });
    numInput.addEventListener('input', function () {
      var v = Math.max(min, Math.min(max, parseFloat(numInput.value) || min));
      slider.value = v;
      numInput.value = v;
      onChange(v);
    });

    container.appendChild(wrapper);
    container.appendChild(numInput);
    group.appendChild(container);
    return group;
  }

  // Helper: create select group
  function createSelectGroup(labelText, options, currentValue, onChange) {
    var group = createControlGroup(labelText);
    var select = document.createElement('select');
    select.className = 'gradient-select';
    for (var i = 0; i < options.length; i++) {
      var opt = document.createElement('option');
      opt.value = options[i];
      opt.textContent = options[i];
      if (options[i] === currentValue) opt.selected = true;
      select.appendChild(opt);
    }
    select.addEventListener('change', function () {
      onChange(select.value);
    });
    group.appendChild(select);
    return group;
  }

  // Helper: create layer action button
  function createLayerBtn(text, title, disabled, onClick) {
    var btn = document.createElement('button');
    btn.className = 'layer-btn';
    btn.textContent = text;
    btn.title = title;
    btn.disabled = disabled;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      onClick();
    });
    return btn;
  }

  // Layer management
  function addLayer() {
    var newLayer = createDefaultLayer();
    layers.push(newLayer);
    activeLayerId = newLayer.id;
    renderLayers();
    updatePreview();
  }

  function removeLayer(id) {
    if (layers.length <= 1) return;
    layers = layers.filter(function (l) { return l.id !== id; });
    if (activeLayerId === id) activeLayerId = layers[0].id;
    renderLayers();
    updatePreview();
  }

  function moveLayer(id, direction) {
    var idx = -1;
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].id === id) { idx = i; break; }
    }
    if (idx < 0) return;
    var newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= layers.length) return;
    var temp = layers[idx];
    layers[idx] = layers[newIdx];
    layers[newIdx] = temp;
    renderLayers();
    updatePreview();
  }

  function duplicateLayer(id) {
    var original = getLayerById(id);
    if (!original) return;
    var newLayer = JSON.parse(JSON.stringify(original));
    newLayer.id = nextLayerId++;
    newLayer.stops = newLayer.stops.map(function (s) { return { color: s.color, opacity: s.opacity, position: s.position }; });
    var idx = layers.indexOf(original);
    layers.splice(idx + 1, 0, newLayer);
    activeLayerId = newLayer.id;
    renderLayers();
    updatePreview();
  }

  // Stop management
  function addStop(layerId) {
    var layer = getLayerById(layerId);
    if (!layer) return;
    var stops = layer.stops;
    // Find the largest gap and insert midpoint
    var maxGap = 0, gapIdx = 0;
    for (var i = 0; i < stops.length - 1; i++) {
      var gap = stops[i + 1].position - stops[i].position;
      if (gap > maxGap) { maxGap = gap; gapIdx = i; }
    }
    var pos = Math.round((stops[gapIdx].position + stops[gapIdx + 1].position) / 2);
    stops.splice(gapIdx + 1, 0, { color: '#888888', opacity: 100, position: pos });
    renderLayers();
    updatePreview();
  }

  function removeStop(layerId, stopIndex) {
    var layer = getLayerById(layerId);
    if (!layer || layer.stops.length <= 2) return;
    layer.stops.splice(stopIndex, 1);
    renderLayers();
    updatePreview();
  }

  // Presets
  var presets = {
    sunset: {
      layers: [{
        type: 'linear-gradient', angle: 135,
        stops: [
          { color: '#ff6b35', opacity: 100, position: 0 },
          { color: '#f7c59f', opacity: 100, position: 30 },
          { color: '#eb5e55', opacity: 100, position: 60 },
          { color: '#6b2d5b', opacity: 100, position: 100 }
        ],
        bgSizeX: 100, bgSizeY: 100, bgSizeUnit: '%', bgPosX: 0, bgPosY: 0, bgPosUnit: '%', bgRepeat: 'no-repeat'
      }]
    },
    ocean: {
      layers: [{
        type: 'linear-gradient', angle: 180,
        stops: [
          { color: '#0077b6', opacity: 100, position: 0 },
          { color: '#00b4d8', opacity: 100, position: 50 },
          { color: '#90e0ef', opacity: 100, position: 100 }
        ],
        bgSizeX: 100, bgSizeY: 100, bgSizeUnit: '%', bgPosX: 0, bgPosY: 0, bgPosUnit: '%', bgRepeat: 'no-repeat'
      }]
    },
    neon: {
      layers: [{
        type: 'linear-gradient', angle: 90,
        stops: [
          { color: '#ff00ff', opacity: 100, position: 0 },
          { color: '#00ffff', opacity: 100, position: 100 }
        ],
        bgSizeX: 100, bgSizeY: 100, bgSizeUnit: '%', bgPosX: 0, bgPosY: 0, bgPosUnit: '%', bgRepeat: 'no-repeat'
      }]
    },
    radialGlow: {
      layers: [{
        type: 'radial-gradient', shape: 'circle', size: 'farthest-corner', posX: 50, posY: 50,
        stops: [
          { color: '#ffd700', opacity: 100, position: 0 },
          { color: '#ff6347', opacity: 80, position: 50 },
          { color: '#1a1a2e', opacity: 100, position: 100 }
        ],
        bgSizeX: 100, bgSizeY: 100, bgSizeUnit: '%', bgPosX: 0, bgPosY: 0, bgPosUnit: '%', bgRepeat: 'no-repeat'
      }]
    },
    conic: {
      layers: [{
        type: 'conic-gradient', startAngle: 0, posX: 50, posY: 50,
        stops: [
          { color: '#ff0000', opacity: 100, position: 0 },
          { color: '#ffff00', opacity: 100, position: 17 },
          { color: '#00ff00', opacity: 100, position: 33 },
          { color: '#00ffff', opacity: 100, position: 50 },
          { color: '#0000ff', opacity: 100, position: 67 },
          { color: '#ff00ff', opacity: 100, position: 83 },
          { color: '#ff0000', opacity: 100, position: 100 }
        ],
        bgSizeX: 100, bgSizeY: 100, bgSizeUnit: '%', bgPosX: 0, bgPosY: 0, bgPosUnit: '%', bgRepeat: 'no-repeat'
      }]
    },
    stacked: {
      layers: [
        {
          type: 'linear-gradient', angle: 45,
          stops: [
            { color: '#667eea', opacity: 80, position: 0 },
            { color: '#764ba2', opacity: 80, position: 100 }
          ],
          bgSizeX: 100, bgSizeY: 100, bgSizeUnit: '%', bgPosX: 0, bgPosY: 0, bgPosUnit: '%', bgRepeat: 'no-repeat'
        },
        {
          type: 'linear-gradient', angle: 135,
          stops: [
            { color: '#f093fb', opacity: 60, position: 0 },
            { color: '#f5576c', opacity: 60, position: 100 }
          ],
          bgSizeX: 100, bgSizeY: 100, bgSizeUnit: '%', bgPosX: 0, bgPosY: 0, bgPosUnit: '%', bgRepeat: 'no-repeat'
        }
      ]
    },
    mesh: {
      layers: [
        {
          type: 'radial-gradient', shape: 'circle', size: 'farthest-corner', posX: 50, posY: 50,
          stops: [
            { color: '#ff6b6b', opacity: 80, position: 0 },
            { color: '#ff6b6b', opacity: 0, position: 70 }
          ],
          bgSizeX: 60, bgSizeY: 60, bgSizeUnit: '%', bgPosX: 10, bgPosY: 10, bgPosUnit: '%', bgRepeat: 'no-repeat'
        },
        {
          type: 'radial-gradient', shape: 'circle', size: 'farthest-corner', posX: 50, posY: 50,
          stops: [
            { color: '#4ecdc4', opacity: 80, position: 0 },
            { color: '#4ecdc4', opacity: 0, position: 70 }
          ],
          bgSizeX: 60, bgSizeY: 60, bgSizeUnit: '%', bgPosX: 60, bgPosY: 30, bgPosUnit: '%', bgRepeat: 'no-repeat'
        },
        {
          type: 'radial-gradient', shape: 'circle', size: 'farthest-corner', posX: 50, posY: 50,
          stops: [
            { color: '#a855f7', opacity: 80, position: 0 },
            { color: '#a855f7', opacity: 0, position: 70 }
          ],
          bgSizeX: 60, bgSizeY: 60, bgSizeUnit: '%', bgPosX: 35, bgPosY: 70, bgPosUnit: '%', bgRepeat: 'no-repeat'
        },
        {
          type: 'linear-gradient', angle: 135,
          stops: [
            { color: '#1a1a2e', opacity: 100, position: 0 },
            { color: '#16213e', opacity: 100, position: 100 }
          ],
          bgSizeX: 100, bgSizeY: 100, bgSizeUnit: '%', bgPosX: 0, bgPosY: 0, bgPosUnit: '%', bgRepeat: 'no-repeat'
        }
      ]
    }
  };

  function applyGradientPreset(name) {
    var preset = presets[name];
    if (!preset) return;
    nextLayerId = 1;
    layers = preset.layers.map(function (pl) {
      var l = createDefaultLayer();
      l.type = pl.type || 'linear-gradient';
      if (pl.angle !== undefined) l.angle = pl.angle;
      if (pl.shape !== undefined) l.shape = pl.shape;
      if (pl.size !== undefined) l.size = pl.size;
      if (pl.posX !== undefined) l.posX = pl.posX;
      if (pl.posY !== undefined) l.posY = pl.posY;
      if (pl.startAngle !== undefined) l.startAngle = pl.startAngle;
      if (pl.stops) l.stops = pl.stops.map(function (s) { return { color: s.color, opacity: s.opacity, position: s.position }; });
      if (pl.bgSizeX !== undefined) l.bgSizeX = pl.bgSizeX;
      if (pl.bgSizeY !== undefined) l.bgSizeY = pl.bgSizeY;
      if (pl.bgSizeUnit !== undefined) l.bgSizeUnit = pl.bgSizeUnit;
      if (pl.bgPosX !== undefined) l.bgPosX = pl.bgPosX;
      if (pl.bgPosY !== undefined) l.bgPosY = pl.bgPosY;
      if (pl.bgPosUnit !== undefined) l.bgPosUnit = pl.bgPosUnit;
      if (pl.bgRepeat !== undefined) l.bgRepeat = pl.bgRepeat;
      return l;
    });
    activeLayerId = layers[0].id;
    renderLayers();
    updatePreview();
  }

  // Copy CSS
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
    }).catch(function () {});
  }

  // Wire up
  if (addLayerBtn) addLayerBtn.addEventListener('click', addLayer);

  // Initial render
  renderLayers();
  updatePreview();

  // Expose to window for onclick handlers
  if (typeof window !== 'undefined') {
    window.applyGradientPreset = applyGradientPreset;
    window.copyCSS = copyCSS;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGradient);
} else {
  initGradient();
}

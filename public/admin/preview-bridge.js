/**
 * Dynasty CMS — click preview → scroll/highlight field in editor (parent frame).
 */
(function () {
  var HIGHLIGHT = 'dynasty-field-highlight';

  var PATH_LABELS = {
    title: 'Título',
    'intro.label': 'Subtítulo',
    'intro.description': 'Descripción',
    'intro.descriptionExtra': 'Segundo párrafo',
    'intro.credit': 'Diseñador',
    'intro.logo': 'Logo',
    cardImage: 'Foto de la carta',
    categoryLabel: 'Texto pequeño en la carta',
    category: 'Tipo de trabajo',
    order: 'Posición en la lista',
    slug: 'Código interno',
    published: 'Mostrar en el sitio',
    demoUrl: 'Enlace "Ver demo"',
    sections: 'Fotos del proyecto',
  };

  function clearHighlights(doc) {
    doc.querySelectorAll('.' + HIGHLIGHT).forEach(function (el) {
      el.classList.remove(HIGHLIGHT);
    });
  }

  function mark(el) {
    if (!el) return;
    el.classList.add(HIGHLIGHT);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function findLabelStartsWith(text) {
    var nodes = document.querySelectorAll(
      'label, legend, [class*="ControlLabel"], [class*="FieldLabel"]'
    );
    var lower = text.toLowerCase();
    for (var i = 0; i < nodes.length; i++) {
      var t = nodes[i].textContent.trim().toLowerCase();
      if (t === lower || t.indexOf(lower) === 0) return nodes[i];
    }
    return null;
  }

  function controlRoot(labelEl) {
    if (!labelEl) return null;
    return (
      labelEl.closest('[class*="ControlContainer"]') ||
      labelEl.closest('[class*="FieldWrapper"]') ||
      labelEl.parentElement
    );
  }

  function findPhotosListHeaders() {
    var label = findLabelStartsWith('Fotos del proyecto');
    if (!label) return [];
    var editor = document.querySelector('[class*="EditorContainer"]') || document.getElementById('nc-root');
    if (!editor) return [];
    var labelTop = label.getBoundingClientRect().top;

    var selectors = [
      'button[class*="ListItem"]',
      '[class*="ListItemHeader"]',
      '[class*="NestedObjectLabel"]',
      '[class*="ListControlSummary"]',
      '[class*="StyledListItemHeader"]',
    ];

    for (var s = 0; s < selectors.length; s++) {
      var candidates = Array.from(editor.querySelectorAll(selectors[s])).filter(function (el) {
        return el.getBoundingClientRect().top > labelTop - 20;
      });
      if (candidates.length) return candidates;
    }

    var fieldRoot = controlRoot(label);
    if (!fieldRoot) return [];
    var scope = fieldRoot.parentElement;
    for (var d = 0; d < 10 && scope; d++) {
      var buttons = Array.from(scope.querySelectorAll('button')).filter(function (btn) {
        var t = btn.textContent.toLowerCase();
        return (
          btn.getBoundingClientRect().top > labelTop - 20 &&
          (t.indexOf('foto') >= 0 ||
            t.indexOf('imagen') >= 0 ||
            t.indexOf('galería') >= 0 ||
            t.indexOf('gallery') >= 0 ||
            t.indexOf('split') >= 0)
        );
      });
      if (buttons.length) return buttons;
      scope = scope.parentElement;
    }
    return [];
  }

  function expandAndMarkListItem(sectionIndex, imageIndex) {
    var headers = findPhotosListHeaders();
    var header = headers[sectionIndex];
    if (!header) {
      var photosLabel = findLabelStartsWith('Fotos del proyecto');
      mark(controlRoot(photosLabel));
      return;
    }
    header.click();
    mark(header.closest('[class*="ListItem"]') || header);

    if (imageIndex == null) return;

    window.setTimeout(function () {
      var itemRoot =
        header.closest('[class*="ListItem"]') ||
        header.closest('[class*="NestedObject"]') ||
        header.parentElement;
      if (!itemRoot) return;
      var fotoLabels = Array.from(itemRoot.querySelectorAll('label, [class*="FieldLabel"]')).filter(
        function (l) {
          return /^foto$/i.test(l.textContent.trim());
        }
      );
      if (fotoLabels[imageIndex]) mark(controlRoot(fotoLabels[imageIndex]) || fotoLabels[imageIndex]);
    }, 350);
  }

  function focusField(path) {
    if (!path) return;
    clearHighlights(document);

    var sectionMatch = path.match(/^sections\.(\d+)(?:\.images\.(\d+)(?:\.src)?)?$/);
    if (sectionMatch) {
      expandAndMarkListItem(parseInt(sectionMatch[1], 10), sectionMatch[2] != null ? parseInt(sectionMatch[2], 10) : null);
      return;
    }

    if (path.indexOf('intro.') === 0 || path === 'title') {
      var introLabel = findLabelStartsWith('Presentación del proyecto');
      if (introLabel) mark(controlRoot(introLabel));
    }

    var labelText = PATH_LABELS[path];
    if (labelText) {
      var label = findLabelStartsWith(labelText);
      mark(controlRoot(label) || label);
    }
  }

  window.DynastyPreviewBridge = { focusField: focusField };

  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'dynasty-focus-field' && e.data.path) {
      focusField(e.data.path);
    }
  });
})();

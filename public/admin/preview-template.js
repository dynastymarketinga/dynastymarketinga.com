/**
 * Decap CMS live preview — mirrors CaseDetailOverlay + CaseSections (Astro).
 * Click any zone → scroll to the matching field in the editor (all portfolio projects).
 */
(function () {
  if (typeof CMS === 'undefined' || typeof h === 'undefined') return;

  function focusPath(path) {
    try {
      if (window.parent && window.parent.DynastyPreviewBridge) {
        window.parent.DynastyPreviewBridge.focusField(path);
      } else {
        window.parent.postMessage({ type: 'dynasty-focus-field', path: path }, '*');
      }
    } catch (err) {
      /* ignore cross-frame errors */
    }
  }

  function onFieldClick(path) {
    return function (e) {
      e.preventDefault();
      e.stopPropagation();
      var doc = e.currentTarget.ownerDocument;
      doc.querySelectorAll('.dynasty-editable--active').forEach(function (el) {
        el.classList.remove('dynasty-editable--active');
      });
      e.currentTarget.classList.add('dynasty-editable--active');
      focusPath(path);
    };
  }

  function editable(path, hint, className, children) {
    return h(
      'div',
      {
        className: 'dynasty-editable' + (className ? ' ' + className : ''),
        'data-cms-path': path,
        'data-cms-hint': hint || 'Editar',
        onClick: onFieldClick(path),
        onKeyDown: function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            onFieldClick(path)(e);
          }
        },
        role: 'button',
        tabIndex: 0,
        title: hint || 'Clic para editar',
      },
      children
    );
  }

  function imgFigure(path, hint, figureClass, img) {
    if (!img || !img.src) return null;
    return h(
      'figure',
      {
        className: figureClass + ' dynasty-editable dynasty-editable--photo',
        'data-cms-path': path,
        'data-cms-hint': hint || 'Foto',
        onClick: onFieldClick(path),
        onKeyDown: function (e) {
          if (e.key === 'Enter' || e.key === ' ') onFieldClick(path)(e);
        },
        role: 'button',
        tabIndex: 0,
        title: hint || 'Clic para editar',
      },
      h('img', { src: img.src, alt: img.alt || '' })
    );
  }

  function sectionBorder() {
    return h('div', { className: 'section-border', 'aria-hidden': 'true' });
  }

  /** Legacy gallery[] or bare cardImage → sections for preview + CMS parity */
  function normalizeSections(data) {
    if (data.sections && data.sections.length) return data.sections;

    var gallery = data.gallery;
    if (Array.isArray(gallery) && gallery.length) {
      return gallery.map(function (item) {
        var src = typeof item === 'string' ? item : item && item.src;
        if (!src) return null;
        return { type: 'media', images: [{ src: src, alt: '' }] };
      }).filter(Boolean);
    }

    if (data.cardImage) {
      return [{ type: 'wide', images: [{ src: data.cardImage, alt: '' }] }];
    }

    return [];
  }

  function normalizeIntro(data) {
    var intro = data.intro || {};
    return {
      logo: intro.logo || null,
      label: intro.label || data.categoryLabel || null,
      description: intro.description || data.description || null,
      descriptionExtra: intro.descriptionExtra || null,
      credit: intro.credit || null,
    };
  }

  function renderSection(section, index) {
    var type = section.type;
    var images = section.images || [];
    var variant = section.variant;
    var ratio = section.splitRatio || (images.length === 3 ? '3' : '7-5');
    var splitClass =
      ratio === '8-4' ? 'case-split--8-4' : ratio === '3' ? 'case-split--3' : 'case-split--7-5';
    var blockHint = 'Bloque ' + (index + 1) + ' · Fotos del proyecto';
    var blockPath = 'sections.' + index;

    function wrapSection(className, content) {
      return h(
        'section',
        {
          key: index,
          className: className,
        },
        sectionBorder(),
        editable(blockPath, blockHint, 'dynasty-editable--block', content)
      );
    }

    if (type === 'wide') {
      return wrapSection(
        'tl-section tl-section--media tl-section--wide',
        h('div', { className: 'section-background' }, imgFigure(blockPath + '.images.0.src', 'Foto', 'tl-media tl-media--full', images[0]))
      );
    }

    if (type === 'media') {
      return wrapSection(
        'tl-section tl-section--media',
        h('div', { className: 'section-background' }, imgFigure(blockPath + '.images.0.src', 'Foto', 'tl-media tl-media--lg', images[0]))
      );
    }

    if (type === 'full') {
      var fullClass =
        variant === 'beu-split-print'
          ? 'tl-section tl-section--split beu-split__section--print'
          : 'tl-section tl-section--media tl-section--wide';
      var figClass = variant === 'beu-split-print' ? 'tl-media beu-split__desk' : 'tl-media tl-media--full';
      return wrapSection(
        fullClass,
        h('div', { className: 'section-background' }, imgFigure(blockPath + '.images.0.src', 'Foto', figClass, images[0]))
      );
    }

    if (type === 'trio' && variant === 'beu-lifestyle') {
      return wrapSection(
        'tl-section tl-section--trio',
        h(
          'div',
          { className: 'section-background' },
          h('div', { className: 'beu-lifestyle' }, [
            imgFigure(blockPath + '.images.0.src', 'Foto 1', 'beu-lifestyle__shirt', images[0]),
            imgFigure(blockPath + '.images.1.src', 'Foto 2', 'beu-lifestyle__pens', images[1]),
            imgFigure(blockPath + '.images.2.src', 'Foto 3', 'beu-lifestyle__bag', images[2]),
          ])
        )
      );
    }

    if (type === 'split' && variant === 'beu-split-notebooks') {
      return wrapSection(
        'tl-section tl-section--split beu-split__section--notebooks',
        h(
          'div',
          { className: 'section-background' },
          images.map(function (img, i) {
            return imgFigure(blockPath + '.images.' + i + '.src', 'Foto ' + (i + 1), 'tl-media beu-split__notebooks', img);
          })
        )
      );
    }

    if (type === 'split' || type === 'trio' || type === 'gallery-three') {
      var sectionClass =
        type === 'gallery-three' ? 'tl-section tl-section--posts' : 'tl-section tl-section--split';
      return wrapSection(
        sectionClass,
        h(
          'div',
          { className: 'section-background' },
          h(
            'div',
            { className: 'case-split ' + splitClass },
            images.map(function (img, i) {
              return imgFigure(blockPath + '.images.' + i + '.src', 'Foto ' + (i + 1), 'tl-media tl-media--full', img);
            })
          )
        )
      );
    }

    return null;
  }

  var PortfolioPreview = createClass({
    render: function () {
      var entry = this.props.entry;
      var data = entry.getIn(['data']).toJS();
      var title = data.title || 'Proyecto';
      var intro = normalizeIntro(data);
      var sections = normalizeSections(data);
      var theme = data.themeClass || data.slug || 'default';
      var markClass = 'tl-intro-mark tl-intro-mark--' + theme;

      var introSection = null;
      if (intro.logo || intro.label || intro.description || intro.descriptionExtra || intro.credit || title) {
        introSection = h(
          'section',
          { className: 'tl-section tl-section--intro' },
          sectionBorder(),
          h(
            'div',
            { className: 'section-background' },
            h(
              'div',
              { className: 'tl-intro-grid tl-intro-grid--logo' },
              intro.logo &&
                editable(
                  'intro.logo',
                  'Logo',
                  'dynasty-editable--logo ' + markClass,
                  h('img', { src: intro.logo, alt: title + ' logo' })
                ),
              h(
                'div',
                { className: 'tl-intro-copy' },
                intro.label &&
                  editable('intro.label', 'Subtítulo', 'dynasty-editable--text', h('p', { className: 'tl-intro-label' }, intro.label)),
                editable('title', 'Título', 'dynasty-editable--text', h('h2', { className: 'tl-intro-title' }, title)),
                intro.description &&
                  editable(
                    'intro.description',
                    'Descripción',
                    'dynasty-editable--text',
                    h('p', { className: 'tl-intro-desc' }, intro.description)
                  ),
                intro.descriptionExtra &&
                  editable(
                    'intro.descriptionExtra',
                    'Segundo párrafo',
                    'dynasty-editable--text',
                    h('p', { className: 'tl-intro-desc' }, intro.descriptionExtra)
                  ),
                intro.credit &&
                  editable(
                    'intro.credit',
                    'Diseñador',
                    'dynasty-editable--text',
                    h(
                      'p',
                      { className: 'tl-intro-credit' },
                      'Designed by ',
                      h('strong', null, intro.credit)
                    )
                  )
              )
            )
          )
        );
      }

      return h(
        'div',
        {
          className:
            'detail-overlay detail-overlay--tl detail-overlay--' + theme + ' dynasty-cms-preview open',
        },
        h(
          'div',
          { className: 'tl-page dynasty-preview-grid' },
          h(
            'div',
            { className: 'dynasty-preview-hint-bar' },
            'Clic en cualquier zona para editar el campo correspondiente ←'
          ),
          introSection,
          sections.map(renderSection)
        )
      );
    },
  });

  CMS.registerPreviewTemplate('portfolio', PortfolioPreview);
  CMS.registerPreviewStyle('/styles/tokens.css');
  CMS.registerPreviewStyle('/styles/portfolio.css');
  CMS.registerPreviewStyle('/styles/responsive.css');
  CMS.registerPreviewStyle('/admin/dynasty-cms.css');
})();

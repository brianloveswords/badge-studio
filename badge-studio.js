(function (fabric) {
  if (!fabric) throw new Error('fabric must be loaded before loading BadgeStudio')

  function noop() {}

  function BadgeStudio(canvasId) {
    this.canvas = new fabric.Canvas(canvasId)
  }

  BadgeStudio.util = {
    isDataURL: function isDataURL(url) {
      return url.trim().indexOf('data:image') === 0
    },

    imageFromUrl: function imageFromUrl(url, callback) {
      if (!BadgeStudio.util.isDataURL(url))
        return fabric.Image.fromURL(url, callback)

      var imageElement = document.createElement('img')
      imageElement.src = url
      imageElement.onload = function () {
        imageElement.onload = null
        return callback(new fabric.Image(imageElement))
      }
    },

    loadSVG: function loadSVG(prefix, name, callback) {
      var path = prefix + '/' + name + '.svg'
      fabric.loadSVGFromURL(path, function (objects, options) {
        return callback(new fabric.Group(objects))
      })
    },

    loadShape: function loadShape(name, callback) {
      // TODO: make prefix directory configurable. That will likely
      // require this to be an instance method.
      BadgeStudio.util.loadSVG('shapes', name, callback)
    },

    loadRibbon: function loadRibbon(name, callback) {
      // TODO: make prefix directory configurable. That will likely
      // require this to be an instance method.
      BadgeStudio.util.loadSVG('ribbons', name, callback)
    },

    loadGlyph: function loadRibbon(name, callback) {
      // TODO: make prefix directory configurable. That will likely
      // require this to be an instance method.
      BadgeStudio.util.imageFromUrl('glyphs/' + name + '.png', callback)
    }
  }

  BadgeStudio.defaultRibbonOptions = {
    scaleY: 0.8,
    scaleX: 0.8,
    left: 100,
    top: 0,
    selectable: false,
  }

  BadgeStudio.defaultShapeOptions = {
    top: 0,
    left: 0,

    // TODO: these should be configurable (and thus likely be attached
    // to the instance instead of the class)
    width: 500,
    height: 500
  }

  BadgeStudio.shapes = {
    hexagon: {ribbonOptions: { top: 20 }},
    square: {ribbonOptions: { left: 75 }},
    diamond: {ribbonOptions: { top: 45, left: 120 }},
    circle: {},
    shield: {}
  }

  /**
   * Sets the main shape of the badge. This works by clipping the canvas
   * to the shape so anything outside of that shape will not get
   * shown.
   *
   * Shapes are mutually exclusive, not additive, so a new shape will
   * replace the clipping mask of the old shape.
   *
   * @param {String} shapeName The type of shape. Should have a
   *   corresponding entry in `BadgeStudio.shapes` and an svg file in the
   *   `shapes/` folder (e.g. `shapes/hexagon.svg`).
   *
   * @param {Function} [callback] Invoked after the clipping mask is
   *   applied and the canvas is re-rendered. Optional.
   */
  BadgeStudio.prototype.setShape = function setShape(shapeName, callback) {
    callback = callback || noop

    this.shape = shapeName

    var canvas = this.canvas
    var shapeData = BadgeStudio.shapes[shapeName] || {}
    var initialize = shapeData.initialize
    var styleRibbon = this.styleRibbon.bind(this)

    if (shapeData.cache) {
      finish(shapeData.cache)
    } else {
      BadgeStudio.util.loadShape(shapeName, finish)
    }

    return this

    function finish(shape) {
      shapeData.cache = shape
      shape.set(BadgeStudio.defaultShapeOptions)

      if (initialize)
        return initialize(shape, canvas, callback)

      canvas.clipTo = function (ctx) { shape.render(ctx) }
      canvas.renderAll()
      styleRibbon()
      callback()
      return
    }
  }

  /**
   * Set the background color of the canvas.
   *
   * @param {String} color A string representing a color. This should be
   *   in one of the formats that `new fabric.Color` accepts:
   *     - short hex: '#f55';
   *     - long hex: '#123123'
   *     - hex w/o #: '356735'
   *     - rgb: 'rgb(100,0,100)'
   *     - rgba: 'rgba(10, 20, 30, 0.5)'
   */
  BadgeStudio.prototype.setBackgroundColor = function setBackgroundColor(color) {
    var canvas = this.canvas
    canvas.backgroundColor = color
    canvas.renderAll()
    return this
  }

  /**
   *  Add a new background image to the canvas. If there is already a
   *  background image on the canvas, it will be removed before adding a
   *  new one.
   *
   *  @param {String} url URL to create an image from. This can be a Data
   *    URL or a regular one. Note, this *must* be a CORS capable image or
   *    else the canvas will be tainted and `Canvas#toDataURL` will be
   *    broken with a security error. (Also, in Firefox the image will not
   *    be able to be moved.)
   *
   *  @param {Function} [callback] Callback is invoked when the background
   *    image is succesfully set. Optional.
   */
  BadgeStudio.prototype.setBackgroundImage = function setBackgroundImage(url, callback) {
    callback = callback || noop
    var canvas = this.canvas

    BadgeStudio.util.imageFromUrl(url, function (image) {
      if (this.image)
        canvas.remove(this.image)

      this.image = image

      canvas.add(image).renderAll()
      image.center()
      image.moveTo(0)
      if (this.glyph)
        canvas.setActiveObject(this.glyph)
      return callback(image)
    }.bind(this))
  }


  /**
   * Set the top ribbon. Calls `BadgeStudio#styleRibbon` to figure out
   * how to style the ribbon.
   *
   * @param {String} name The name of the ribbon to load. The SVG file
   *   should be located in the `ribbons/` folder.
   *
   * @param {Function} [callback] Invoked once the ribbon has been
   *   applied to the canvas. Optional.
   *
   * @see BadgeStudio#styleRibbon
   */
  BadgeStudio.prototype.setRibbon = function setRibbon(name, callback) {
    callback = callback || noop
    var canvas = this.canvas

    BadgeStudio.util.loadRibbon(name, function (ribbon) {
      if (this.ribbon)
        canvas.remove(this.ribbon)

      this.ribbon = ribbon
      this.styleRibbon()
      canvas.add(ribbon).renderAll()
      ribbon.moveTo(Infinity)
      return callback(ribbon)
    }.bind(this))
  }

  /**
   * Remove the ribbon from the canvas
   */

  BadgeStudio.prototype.removeRibbon = function removeRibbon() {
    if (!this.ribbon) return
    this.canvas.remove(this.ribbon)
  }

  /**
   * Set the styles on the ribbon. Invoked from `BadgeStudio#setRibbon`
   * and `BadgeStudio#setShape`. Uses `BadgeStudio.defaultRibbonOptions`
   * and `BadgeStudio.shapes[currentShape].ribbonOptions` to set default
   * styles before user overrides from the optional `style` param.
   *
   * @param {Object} style The style definition to pass to `fabric.Object#set`. Optional.
   * @see BadgeStudio#setRibbon
   * @see BadgeStudio#setShape
   */
  BadgeStudio.prototype.styleRibbon = function styleRibbon(style) {
    if (!this.ribbon) return
    style = style || {}
    var ribbon = this.ribbon
    var shape = BadgeStudio.shapes[this.shape] || {}
    var shapeRibbonOptions = shape.ribbonOptions || {}
    var defaultOptions = BadgeStudio.defaultRibbonOptions || {}
    ribbon.set(defaultOptions)
    ribbon.set(shapeRibbonOptions)
    ribbon.set(style)
    if (ribbon.canvas) {
      ribbon.canvas.renderAll()
      ribbon.moveTo(Infinity)
    }
  }


  BadgeStudio.prototype.setGlyph = function setGlyph(name, callback) {
    callback = callback || noop
    var canvas = this.canvas
    this.removeGlyph()
    BadgeStudio.util.loadGlyph(name, function (glyph) {
      canvas.add(glyph).renderAll()
      glyph.center()
      glyph.moveTo(1)
      canvas.setActiveObject(glyph)
      this.glyph = glyph
      this.setGlyphColor()
      return callback()
    }.bind(this))
  }

  BadgeStudio.prototype.removeGlyph = function removeGlyph() {
    if (!this.glyph) return
    this.canvas.remove(this.glyph)
  }

  BadgeStudio.prototype.setGlyphColor = function setGlyphColor(color) {
    if (!this.glyph) return

    color = color || this.glyphColor
    this.glyphColor = color

    if (!color) return

    var glyph = this.glyph
    var canvas = this.canvas
    var filter = new fabric.Image.filters.Tint({
      color: color,
      opacity: 1
    })
    glyph.filters[0] = filter
    glyph.applyFilters(canvas.renderAll.bind(canvas))
  }

  window.BadgeStudio = BadgeStudio
})(fabric)

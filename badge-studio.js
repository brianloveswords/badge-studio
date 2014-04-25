(function (fabric) {
  if (!fabric) throw new Error('fabric must be loaded before loading BadgeStudio')

  function BadgeStudio(canvasId) {
    this.canvas = new fabric.Canvas(canvasId)
    this.shape = null
    this.image = null
    this.fill = null
    this.icon = null
    this.banner = null
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
        return callback(objects[0])
      })
    },

    loadShape: function loadShape(shape, callback) {
      BadgeStudio.util.loadSVG('shapes', shape, callback)
    }
  }

  BadgeStudio.defaultBannerOptions = {
    scaleY: 0.2,
    scaleX: 0.2,
  }
  BadgeStudio.defaultShapeOptions = {
    top: 0,
    left: 0,
    width: 500,
    height: 500,
  }
  BadgeStudio.shapes = {
    hexagon: {bannerOptions: { top: 20, left: 100 },},
    circle: {},
    square: {},
    shield: {},
    diamond: {},
  }

  /**
   * Sets the main shape of the badge. This works by clipping the canvas
   * to the shape so anything outside of that shape will not get
   * shown.
   *
   * Shapes should have a corresponding entry in `BadgeStudio.shapes` and
   * an svg file in the `/shapes` folder (e.g. `/shapes/hexagon.svg`). The
   * SVG file is lazy loaded and cached.
   *
   * Shapes are mutually exclusive, not additive, so a new shape will
   * replace the clipping mask of the old shape.
   *
   * @param {String} type The type of shape
   * @param {Function} [callback] Invoked after the clipping mask is
   *   applied and the canvas is re-rendered. Optional.
   */
  BadgeStudio.prototype.setShape = function setShape(shapeName, callback) {
    callback = callback || function(){}

    this.shape = shapeName

    var canvas = this.canvas
    var shapeData = BadgeStudio.shapes[shapeName] || {}
    var initialize = shapeData.initialize

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
    callback = callback || function () {}
    var currentImage = this.image
    var canvas = this.canvas

    BadgeStudio.util.imageFromUrl(url, function (image) {
      if (currentImage)
        canvas.remove(currentImage)

      this.image = image

      canvas.add(image)
      image.center()

      return callback(image)
    }.bind(this))
  }

  window.BadgeStudio = BadgeStudio
})(fabric)

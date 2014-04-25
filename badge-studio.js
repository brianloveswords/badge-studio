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
  loadShape: function loadShape(type, callback) {
    BadgeStudio.util.loadSVG('shapes', type, callback)
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

BadgeStudio.prototype.setShape = function setShape(type, callback) {
  callback = callback || function(){}

  this.shape = type

  var canvas = this.canvas
  var shapeData = BadgeStudio.shapes[type] || {}
  var initialize = shapeData.initialize

  if (shapeData.cache) {
    return finish(shapeData.cache)
  }

  return BadgeStudio.util.loadShape(type, finish)

  function finish(shape) {
    shapeData.cache = shape
    shape.set(BadgeStudio.defaultShapeOptions)

    if (initialize)
      return initialize(shape, canvas, callback)

    canvas.clipTo = function (ctx) { shape.render(ctx) }
    canvas.renderAll()
    return callback()
  }
}

BadgeStudio.prototype.setBackgroundColor = function setBackgroundColor(color) {
  var canvas = this.canvas
  canvas.backgroundColor = color
  canvas.renderAll()
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

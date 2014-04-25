var canvasId = 'c'
var studio = new BadgeStudio(canvasId)

studio.setBackgroundColor('rgba(24,124,255,0.3)')
studio.setBackgroundImage('lsd-cats.png')

;['circle', 'hexagon', 'square', 'shield', 'diamond'].forEach(function (shape) {
  document.getElementById(shape).addEventListener('click', function () {
    studio.setShape(shape)
  })
})

document.getElementById('ribbon').addEventListener('click', function () {
  studio.setRibbon('blank')
})

// studio.setGlyph('Airport', function (glyph) {
//   studio.setGlyphColor('#ff0')
// })


// studio.setBackgroundColor('#ff0')

// studio.toggleBanner()
// studio.showBanner()
// studio.hideBanner()

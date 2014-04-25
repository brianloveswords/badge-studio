var canvasId = 'c'
var studio = new BadgeStudio(canvasId)


studio.setShape('hexagon', function () {
  studio.setBackgroundColor('rgba(24,124,255,0.3)')
  studio.setBackgroundImage('http://x.bjb.io/lsd-cats.png')
  setTimeout(function () {
    studio.setBackgroundImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==')
  }, 1000)

})

// studio.setGlyph('Airport')
// studio.setGlyphColor('#ff0')

// studio.setBackgroundColor('#ff0')

// studio.toggleBanner()
// studio.showBanner()
// studio.hideBanner()

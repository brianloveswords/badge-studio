var canvasId = 'c'
var studio = new BadgeStudio(canvasId)


studio.setShape('hexagon', function () {
  studio.setBackgroundColor('rgba(24,124,255,0.3)')
  studio.setBackgroundImage('lsd-cats.png')
  studio.setRibbon('blank', function (ribbon) {
    studio.setShape('diamond')
  })
})

// studio.setGlyph('Airport')
// studio.setGlyphColor('#ff0')

// studio.setBackgroundColor('#ff0')

// studio.toggleBanner()
// studio.showBanner()
// studio.hideBanner()

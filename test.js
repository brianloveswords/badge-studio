var canvasId = 'c'
var studio = new BadgeStudio(document.getElementById(canvasId))


;['circle', 'hexagon', 'square', 'shield', 'diamond'].forEach(function (shape) {
  document.getElementById(shape).addEventListener('click', function () {
    studio.setShape(shape)
  })
})

document.getElementById('ribbon').addEventListener('click', function () {
  if (!this.visible) {
    studio.setRibbon('blank')
    this.visible = true
  }
  else {
    this.visible = false
    studio.removeRibbon()
  }
})

studio.setBackgroundColor('rgba(24,124,255,0.3)')
studio.setGlyph('Airport', function (glyph) {
  studio.setGlyphColor('#f0f')
  setTimeout(function () {
    studio.setGlyph('Pizza')

    studio.setBackgroundPattern('patterns/congruent_outline.png', function (pattern) {
      studio.setBackgroundImage('lsd-cats.png', function () {
        setTimeout(function () {
          studio.setBackgroundPattern('patterns/congruent_outline.png', function (pattern) {
            console.log(studio.toDataURL())
          })
        }, 1000)
      })
    })
  }, 1000)
})

// studio.setBackgroundColor('#ff0')

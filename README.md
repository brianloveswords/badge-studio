# badge-studio.js

## TODO
* **Inconsistent Bug**: Sometimes when a glyph is added on top of a background image, trying to move around the glyph moves around the background. This doesn't happen all the time, though, and it seems to happen more on Firefox than Chrome. Probably not a *huge* deal.
* **Enhancement**: Caching/preloading. We lazyload shapes, but we probably shouldn't – clipping masks should be preloaded so they are instantaneous. Thankfully, we *do* cache them after they've been loaded once.
* **Enhancement**: Warn (or preferably don't even allow) users when they try to add an image that violates Same-Origin-Policy. Doing a ton of work only to figure out the canvas has been tainted would suck.
* **Enhancement**: Periodically save state to `localStorage`. This shouldn't be too hard – `fabric` is awesome serialization scheme. Basically, `JSON.stringify(fabricCanvas)` and `fabricCanvas.loadFromJSON()` would do the trick. We'd just need to figure out when to blow out that save state (for shared computers and such, probably on both a timelimit and "save and exit" event or something)
* **Enhancement**: Text support. This was dropped for the MVP, but probably wouldn't be too hard to add back in if we really wanted it in there.

## Usage

Requires fabric.js to be loaded beforehand. Note, this was developed against v1.4.0 – I tried v1.4.5 initially, but the docs weren't up to date for it, so it's *highly* recommended you just use v1.4.0.

```html
<script src="http://cdnjs.cloudflare.com/ajax/libs/fabric.js/1.4.0/fabric.min.js"></script>
```

Also note, this documentation lists the most important methods, but is incomplete (for example, there are generally `remove` methods for every `set` method). Check the source if you want to know everything, it should be pretty readable.

------------------------------------------------------------------------

### new BadgeStudio(canvas)
* `canvas`: Canvas element. If you're feeling lazy, you can pass an ID here.

### Example
```js
var studio = new BadgeStudio(someCanvasElement)
```

OR

```js
var studio = new BadgeStudio('some-canvas-id')
```

------------------------------------------------------------------------

### BadgeStudio#setShape(name, [callback])
* `name`: The type of shape. Should have a corresponding entry in `BadgeStudio.shapes` and an svg file in the `shapes/` folder (e.g. "shapes/hexagon.svg").
 * `callback` Invoked after the clipping mask is applied and the canvas is re-rendered. Optional.

#### Example
```js
studio.setShape('hexagon', function() {
  console.log('clipping mask from "shapes/hexagon.svg" applied')
})
```

------------------------------------------------------------------------

### BadgeStudio#setBackgroundColor(color)
* `color`: A string representing a color. This should be in one of the formats that `new fabric.Color` accepts:
  - short hex: '#f55';
  - long hex: '#123123'
  - hex w/o #: '356735'
  - rgb: 'rgb(100,0,100)'
  - rgba: 'rgba(10, 20, 30, 0.5)'

#### Example
```js
studio.setBackgroundColor('#f0f')
```
------------------------------------------------------------------------

### BadgeStudio#setBackgroundImage(url, [callback])
* `url`: URL to create an image from. This can be a Data URL or a regular one. Note, this *must* be a CORS capable image or else the canvas will be tainted and `Canvas#toDataURL` will be broken with a security error. (Also, in Firefox the image will not be able to be moved.)
* `callback`: Callback is invoked when the background image is succesfully set. Optional.

#### Example
```js
studio.setBackgroundImage('http://x.bjb.io/lsd-cats.png', function() {
  console.log('set a sweet lookin cat background')
})
```

Or load a file from the local server:

```js
studio.setBackgroundImage('lsd-cats.png', function() {
  console.log('cat background, but used a local file this time')
})
```
------------------------------------------------------------------------

### BadgeStudio#setRibbon(name, [callback])
* `name`: The name of the ribbon to load. The SVG file should be located in the `ribbons/` folder.
* `callback`: Invoked when the pattern is rendered. Optional.

#### Example
```js
studio.setRibbon('blank', function() {
  console.log('set the ribbon from "ribbons/blank.svg"')
})
```

------------------------------------------------------------------------

### BadgeStudio#setGlyph(name, [callback])
* `name`: The name of the glyph to add. Should be a file (without file extension) from the `glyphs/` directory.
* `callback`: Invoked once the glyph has been rendered to the canvas. Optional.

#### Example
```js
studio.setGlyph('Pizza', function() {
  console.log('added "glyphs/Pizza.png" to the canvas')
})
```

------------------------------------------------------------------------

### BadgeStudio#setGlyphFromURL(url, [callback])
* `url`: URL for the glyph image file. Should probably be a relatively simple shape. Can be a DataURL.
* `callback`: Invoked after the glyph has been rendered to the canvas. Optional.

#### Example
```js
studio.setGlyphFromURL('glyphs/Pizza.png', function() {
  console.log('this is what studio#setGlyph("Pizza") delegates to')
})
```

------------------------------------------------------------------------

### BadgeStudio#setGlyphColor(color)
* `color`: A string representing a color. Can be in any format that `new fabric.Color` accepts, but it's probably easiest to just use a hex representation, e.g. '#ff00ff'

#### Example
```js
// set the color to super hot pink
studio.setGlyphColor('#f0f')
```

------------------------------------------------------------------------

### BadgeStudio#setBackgroundPattern(url, [callback])
* `url`:  HTTP URL or DataURL. Must conform to Same-Origin-Policy (or be CORS capable). Removes any previously set patterns or backgrounds.

* `callback`: Invoked when the pattern is rendered. Optional.

#### Example
```js
var url = 'patterns/congruent_outline.png'
studio.setBackgroundPattern(url, function () {
  console.log('set a repeating pattern')
})
```

------------------------------------------------------------------------

### BadgeStudio#toDataURL()
Delegates to `canvas.toDataURL()`
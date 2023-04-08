## about

Simplifies working with WebGL by providing a bare minimum of helper functions that are commonly needed for program, shader, buffer, and texture creation, loading, and configuration.

## setup

Download from GitHub directly if using a package manager:

```sh
# Add to package.json
npm install thewhodidthis/glx
```

Load via script tag:

```html
<!-- Just an IIFE namespaced `glx` -->
<script src="https://thewhodidthis.github.io/glx/glx.js"></script>
```

Source from an import map:

```json
{
  "imports": {
    "glx": "https://thewhodidthis.github.io/glx/main.js"
  }
}
```

## usage

All named exports follow the same pattern accepting a `WebGLRenderingContext` instance and returning a closure that does the actual work. A default export is available as a convenience for referencing and configuring a base context and for initializing the rest of the helpers with it.

| Export | Description |
| :---   | :---        |
| `default` | Serves as a wrapper for all other functions. Takes a `<canvas>` reference and optionally a context type and attributes. |
| `programcreator` | Takes a WebGL context and returns a function that can create, link, and validate a program from a set of vertex and fragment shaders implicitly calling `shadercompiler`. |
| `shadercompiler` | Takes a WebGL context and returns a function that can create and compile a shader of a given type, either `gl.FRAGMENT_SHADER` or `gl.VERTEX_SHADER`. |
| `createFramebuffer` | Takes a WebGL context and returns a function that can create and bind a frame buffer object of a specified width and height. |
| `createIbo` | Takes a WebGL context and returns a reusable function that creates and binds a new `gl.ELEMENT_ARRAY_BUFFER` given an array of data and an  `gl.STATIC_DRAW` by default usage argument. |
| `createVbo` | Takes a WebGL context and returns a reusable function that creates and binds a new `gl.ARRAY_BUFFER` given an array of data and an  `gl.STATIC_DRAW` by default usage argument. |
| `uniformlocator` | Takes a WebGL context and returns a function that accepts a `WebGLProgram` instance and an array of uniform variable names and returns an object that maps those names to their locations in the program. |
| `texturecreator` | Takes a WebGL context and returns a function that initializes or updates a texture from a potentially `crossorigin` image URL. |

To render a multicolor square for example:

```html
<script type="module">
  import glx from "https://thewhodidthis.github.io/glx/main.js"
  const canvas = document.querySelector("canvas")

  const { gl, createProgram } = glx(canvas)

  const vShader = `#version 300 es
in vec2 aPosition;
in vec3 aColor;
out vec3 fColor;

void main() {
  fColor = aColor;
  gl_Position = vec4(aPosition, 0, 1);
}`

  const fShader = `#version 300 es
precision highp float;

in vec3 fColor;
out vec4 oColor;

void main() {
  oColor = vec4(fColor, 1.0);
}`

  const program = await createProgram(vShader, fShader)
  const shape = new Float32Array([
    // x, y, r, g, b
    1, 1, 1, 0, 0, -1, 1, 0, 0, 1, 1, -1, 1, 1, 0, -1, -1, 0, 1, 1,
  ])

  const { BYTES_PER_ELEMENT } = Float32Array
  const sBuffer = gl.createBuffer()

  gl.bindBuffer(gl.ARRAY_BUFFER, sBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, shape, gl.STATIC_DRAW)

  const aPosition = gl.getAttribLocation(program, "aPosition")

  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, gl.FALSE, 5 * BYTES_PER_ELEMENT, 0)
  gl.enableVertexAttribArray(aPosition)

  const aColor = gl.getAttribLocation(program, "aColor")

  gl.vertexAttribPointer(aColor, 3, gl.FLOAT, gl.FALSE, 5 * BYTES_PER_ELEMENT, 2 * BYTES_PER_ELEMENT)
  gl.enableVertexAttribArray(aColor)

  gl.useProgram(program)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, shape.length / 5)
</script>
<canvas height="300" width="300"></canvas>
```

## see also

- [@thewhodidthis/picture](https://github.com/thewhodidthis/picture/)

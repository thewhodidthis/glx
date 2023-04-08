import { fragment, vertex } from "./shader.js"
import glx from "./main.js"

const canvas = document.querySelector("canvas")

const { gl, createProgram } = glx(canvas)
const { width: w, height: h } = canvas

const { BYTES_PER_ELEMENT } = Float32Array
const clearColor = [1, 1, 1, 1]

const state = { uResolution: -1, uTheta: -1, theta: 0 }
const shape = new Float32Array([
  // x, y, r, g, b
  +0.625, +0.625, 1, 1, 0,
  -0.625, +0.625, 1, 1, 0,
  +0.625, -0.625, 1, 0, 1,
  -0.625, -0.625, 0, 1, 1,
])

self.requestAnimationFrame(function render() {
  gl.viewport(0, 0, w, h)

  if (state.uResolution !== -1) {
    gl.uniform2f(state.uResolution, w, h)
  }

  if (state.uTheta !== -1) {
    gl.uniform1f(state.uTheta, state.theta)
  }

  gl.clearColor(...clearColor)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, shape.length / 5)

  state.theta += 0.01

  self.requestAnimationFrame(render)
})

const program = await createProgram(vertex, fragment)

gl.useProgram(program)

const sBuffer = gl.createBuffer()

gl.bindBuffer(gl.ARRAY_BUFFER, sBuffer)
gl.bufferData(gl.ARRAY_BUFFER, shape, gl.STATIC_DRAW)

const aPosition = gl.getAttribLocation(program, "aPosition")

if (aPosition !== -1) {
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, gl.FALSE, 5 * BYTES_PER_ELEMENT, 0)
  gl.enableVertexAttribArray(aPosition)
}

const aColor = gl.getAttribLocation(program, "aColor")

if (aColor !== -1) {
  gl.vertexAttribPointer(aColor, 3, gl.FLOAT, gl.FALSE, 5 * BYTES_PER_ELEMENT, 2 * BYTES_PER_ELEMENT)
  gl.enableVertexAttribArray(aColor)
}

state.uResolution = gl.getUniformLocation(program, "uResolution")
state.uTheta = gl.getUniformLocation(program, "uTheta")

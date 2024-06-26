var glx = (function(exports) {
  "use strict"

  // Initializes WebGL helpers with a specific rendering context.
  function glx(...options) {
    const gl = getContext(...options)

    return {
      gl,
      createFramebuffer: createFramebuffer(gl),
      createIbo: createIbo(gl),
      createProgram: programcreator(gl),
      createTexture: texturecreator(gl),
      createVbo: createVbo(gl),
      getUniformLocations: uniformlocator(gl),
    }
  }

  // Helps create and compile shaders.
  function shadercompiler(gl) {
    return function createShader(type) {
      const shader = gl.createShader(type)

      return function compileShader(source) {
        gl.shaderSource(shader, source)
        gl.compileShader(shader)

        const compilestatus = gl.getShaderParameter(shader, gl.COMPILE_STATUS)

        if (!compilestatus) {
          throw new Error(`glx: failed to compile shader: ${gl.getShaderInfoLog(shader)}`)
        }

        return shader
      }
    }
  }

  // Helps create, link, and validate a WebGL program given a set of vertex and fragment shaders.
  function programcreator(gl) {
    const shaderloader = shadercompiler(gl)
    const floader = shaderloader(gl.FRAGMENT_SHADER)
    const vloader = shaderloader(gl.VERTEX_SHADER)

    return function createProgram(vs, fs) {
      const program = gl.createProgram()
      const f = floader(fs)
      const v = vloader(vs)

      gl.attachShader(program, f)
      gl.attachShader(program, v)

      gl.linkProgram(program)

      const linkstatus = gl.getProgramParameter(program, gl.LINK_STATUS)

      if (!linkstatus) {
        throw new Error(`glx: failed to link program: ${gl.gl.getProgramInfoLog(program)}`)
      }

      gl.deleteShader(f)
      gl.deleteShader(v)

      gl.validateProgram(program)

      const validatestatus = gl.getProgramParameter(program, gl.VALIDATE_STATUS)

      if (!validatestatus) {
        throw new Error(`glx: failed to validate program: ${gl.gl.getProgramInfoLog(program)}`)
      }

      return program
    }
  }

  // Helps initialize or load or update image textures.
  // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
  function texturecreator(gl) {
    return function createTexture(src, crossorigin, texture = gl.createTexture()) {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      // These should work whether dimensions are power of two or not and
      // can be further adjusted post fact if necessary.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

      if (src) {
        const image = new Image()

        image.src = src

        if (crossorigin !== undefined) {
          image.crossOrigin = crossorigin
        }

        return image
          .decode()
          .then(() => {
            const { width: w, height: h } = image

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, image)

            return texture
          })
      }

      return Promise.resolve(texture)
    }
  }

  // Helps set up vertex buffer objects.
  function createVbo(gl) {
    return (array, usage = gl.STATIC_DRAW) => {
      const vbo = gl.createBuffer()

      gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
      gl.bufferData(gl.ARRAY_BUFFER, array, usage)
      gl.bindBuffer(gl.ARRAY_BUFFER, null)

      return vbo
    }
  }

  // Helps set up index buffer objects.
  function createIbo(gl) {
    return (array, usage = gl.STATIC_DRAW) => {
      const ibo = gl.createBuffer()

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, array, usage)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

      return ibo
    }
  }

  // Helps set up frame buffer objects.
  function createFramebuffer(gl) {
    return (w, h = w) => {
      const framebuffer = gl.createFramebuffer()

      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
      gl.viewport(0, 0, w, h)

      return framebuffer
    }
  }

  // Helps gather up uniform locations.
  function uniformlocator(gl) {
    return (program, keys) => {
      const locations = {}

      for (const k of keys) {
        locations[k] = gl.getUniformLocation(program, k)
      }

      return locations
    }
  }

  // Helps create and configure a WebGL rendering context.
  function getContext(canvas, options) {
    const { types, attributes } = {
      // These are for WebGL v1 / OpenGL ES 2.0 and 'webgl2' would be for WebGL v2 / OpenGL ES 3.0.
      types: ["webgl2", "webgl", "experimental-webgl"],
      // Unsane defaults?
      attributes: { antialias: true },
      // Last in wins the merge.
      ...options,
    }

    // Look up the first available type.
    for (const type of types) {
      try {
        // Would be `null` if no match is found.
        const context = canvas?.getContext(type, attributes)

        if (context) {
          return context
        }

        throw new Error("glx: failed to create WebGL context")
      } catch (e) {
        throw e
      }
    }
  }

  exports.createFramebuffer = createFramebuffer
  exports.createIbo = createIbo
  exports.createVbo = createVbo
  exports.default = glx
  exports.programcreator = programcreator
  exports.shadercompiler = shadercompiler
  exports.texturecreator = texturecreator
  exports.uniformlocator = uniformlocator

  Object.defineProperty(exports, "__esModule", { value: true })

  return exports
})({})

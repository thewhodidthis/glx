export const fragment = `#version 300 es
precision highp float;

in vec3 fColor;
out vec4 oColor;

void main() {
  oColor = vec4(fColor, 1.0);
}`

export const vertex = `#version 300 es
in vec2 aPosition;
in vec3 aColor;
out vec3 fColor;

uniform vec2 uResolution;
uniform float uTheta;

void main() {
  float s = sin(uTheta);
  float c = cos(uTheta);

  float x = c * aPosition.x - s * aPosition.y;
  float y = c * aPosition.y + s * aPosition.x;

  fColor = aColor;
  gl_Position = vec4(vec2(x, y), 0, 1);
}`

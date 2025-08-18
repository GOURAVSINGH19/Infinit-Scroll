precision highp float;

uniform vec2 uResolution; // in pixel
uniform float uTime; // in s
uniform vec2 uCursor; // 0 (left) 0 (top) / 1 (right) 1 (bottom)
uniform float uScrollVelocity; // - (scroll up) / + (scroll down)
uniform sampler2D uTexture; // texture
uniform vec2 uTextureSize; // size of texture
uniform vec2 uQuadSize; // size of texture element
uniform float uBorderRadius; // pixel value

in vec2 vUv; 
in vec2 vUvCover;

out vec4 outColor;


void main() {
  vec3 texture = vec3(texture(uTexture, vUvCover));
  outColor = vec4(texture, 1.0);
}
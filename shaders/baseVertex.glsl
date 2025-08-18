float PI = 3.141592653589793;

uniform vec2 uResolution; 
uniform float uTime;
uniform vec2 uCursor; 
uniform float uScrollVelocity;
uniform sampler2D uTexture;
uniform vec2 uTextureSize; 
uniform vec2 uQuadSize; 
uniform float uBorderRadius; 


#include './resources/utils.glsl';

out vec2 vUv; 
out vec2 vUvCover;

vec3 deformationCurve(vec3 position, vec2 uv) {
  position.y = position.y - (sin(uv.x * PI) * min(abs(uScrollVelocity), 5.0) * sign(uScrollVelocity) * -0.01);
  return position;
}

void main() {
  vUv = uv;
  vUvCover = getCoverUvVert(uv, uTextureSize, uQuadSize);
  vec3 deformedPosition = deformationCurve(position, vUvCover);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(deformedPosition, 1.0);
}
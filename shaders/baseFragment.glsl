precision highp float;
uniform sampler2D uTexture; 

in vec2 vUv; 
in vec2 vUvCover;

out vec4 outColor;

void main() {
  vec3 texture = vec3(texture(uTexture, vUvCover));
  outColor = vec4(texture, 1.0);
}
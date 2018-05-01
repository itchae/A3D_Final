#version 300 es

precision highp float;
precision highp int;

in vec3 aPosition ;
in vec3 aNormal ;
in vec4 aColor ;

uniform mat4 uProjectionMatrix ;
uniform mat4 uModelViewMatrix ;
uniform mat4 uNormalMatrix ;

out vec4 vColor ;
out vec3 vPosition ;
out vec3 vNormal ;

void main(void)
{
  // vertex position in the model-view coordinate system
  vec3 vertex = (uModelViewMatrix*vec4(aPosition, 1.0)).xyz ;
  gl_Position = uProjectionMatrix*vec4(vertex, 1.0);
  vPosition = vertex;

  // normal at vertex
  vNormal = (uNormalMatrix * vec4( aNormal, 0.0 ) ).xyz;

  // transmit the color to the fragment shader
  vColor = aColor;
}

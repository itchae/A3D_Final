#version 300 es

precision highp float;
precision highp int;

uniform mat4 uModelViewMatrix ;
uniform mat4 uNormalMatrix ;

in vec4 vColor ;
in vec3 vPosition ;
in vec3 vNormal ;

out vec4 color;

void main(void)
{
  vec3 normal = normalize( vNormal ) ;

  // normalized vector from the vertex to the light
  vec3 lightVector = normalize(vPosition);

  // is the orientation correct?
  if( dot(normal,lightVector) < 0.0 )
    discard;

  float cos = max(min(abs(dot(normal, lightVector)), 1.0), 0.2);

  color = vec4(vColor.xyz*cos, vColor.w) ;
}

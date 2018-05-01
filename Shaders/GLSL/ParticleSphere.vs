#version 300 es

precision highp float;
precision highp int;

uniform highp sampler2D uTexPositionRadius;
uniform mat4 uProjectionMatrix ;
uniform mat4 uModelViewMatrix ; // actually, it is a View Matrix :-)
uniform int uWidth;

uniform int uHeight;
uniform int uIdentifier;

//uniform float uTime;
in vec3  aPosition ;
in vec4  aColor ;


out vec4 vColor;

void main( void )
{
  // get sphere's position in the input texture
  vec2 size = vec2(uWidth, uHeight);
  vec2 coord = vec2(uIdentifier % uWidth, uIdentifier / uWidth)
             / size;
  // and associated translation and scale factors
  vec4 xyzr = texture(uTexPositionRadius, coord);
  // build the corresponding matrix
  mat4 modelMatrix = mat4(
    xyzr.w,    0.0,    0.0, 0.0,
       0.0, xyzr.w,    0.0, 0.0,
       0.0,    0.0, xyzr.w, 0.0,
    xyzr.x, xyzr.y, xyzr.z, 1.0
  );
  // now we can compute the real position ...
  gl_Position = uProjectionMatrix * uModelViewMatrix * modelMatrix * vec4( aPosition , 1.0 ) ;
  // and the color
  vColor      = aColor;
}

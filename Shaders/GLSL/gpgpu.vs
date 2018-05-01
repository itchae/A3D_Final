#version 300 es
precision highp float;
precision highp int;

//layout(location = 0)
in vec3 aPosition ;
//layout(location = 1)
in vec2 aCoord;

smooth out vec2 vCoord;

void main(void)
{
  // no matrix transformation ;-)
  gl_Position = vec4( aPosition, 1.0 );
  vCoord = aCoord;
}

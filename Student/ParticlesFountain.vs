#version 300 es
precision highp float;
precision highp int;

//layout(location = 0)
in vec3 aPosition ;
//layout(location = 1)
in vec4 aColor;
//layout(location = 2)
in vec3 aVelocity;
//layout(location = 3)
in float aStartTime;

uniform float uTime;      // l'heure actuelle
uniform mat4 uProjectionMatrix ;
uniform mat4 uModelViewMatrix ;

out vec4 vColor; // output of the vertex shader

void main(void)
{
  vColor = aColor; // do not modify this line ;-)

  gl_PointSize = 3.5; // you can play with the size of a particle (in pixels)
  float t = (uTime-aStartTime)*7.0;//you can modify the time in particle frame

  if( t < 0.0 ) {
    // particles not born ... outside the OpenGL cube ...
    gl_Position = vec4(10.0,10.0,10.0,1.0);
  }
  else {
    
    gl_Position = vec4( 0.5*t*t*vec3(0.,0.01,-9.81)+t*aVelocity+aPosition, 1.);
    if(gl_Position.z<0.0 && gl_Position.x<100.0 && gl_Position.x>-100.0 && gl_Position.y<100.0 && gl_Position.y>-100.0) gl_Position.z=0.0;
    gl_Position = uProjectionMatrix*uModelViewMatrix*gl_Position;
  }
}

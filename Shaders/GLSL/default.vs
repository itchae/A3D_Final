attribute vec3 aPosition ;
attribute vec4 aColor ; 

uniform mat4 uProjectionMatrix ;
uniform mat4 uModelViewMatrix ;

varying vec4 vColor ;
void main( void )
{
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4( aPosition , 1.0 ) ;
  vColor      = aColor ;  
}

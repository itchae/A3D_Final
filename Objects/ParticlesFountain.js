// All objects must inherit from Generic Object
ParticlesFountain.prototype = Object.create( GenericObject.prototype );
ParticlesFountain.prototype.constructor = ParticlesFountain ;

/**
* Create a set of Particles. The have random colors. Their position is O.
* @param name name of this instance
* @param number number of particles to handle
* @param shader WebGL shader
*/
function ParticlesFountain( name , number, shader )
{
  // Call parent constructor (mandatory !)
  GenericObject.call( this , name , shader )
  this.ready = false;
  this.number = number;
} ;

var Modulo = function(x,y) { return x - y*Math.floor(x/y); }
/**
* usefull method transforming a HSV color to RGB One
*/
ParticlesFountain.prototype.H2RGB = function( H ) {
  var S = 1.0, V = 1.0;
  var hp = Math.floor(H/60.0);
  var f = H/60.0 - hp;
  var l = V * (1.0 - S);
  var m = V * (1.0 - f*S);
  var n = V * (1.0 - (1.0-f)*S);
  var rgb1 ;
  if( hp<0.0 || hp>=6.0 ) rgb1 = [0,0,0]; else
  if( hp<1.0 )      rgb1 = [V,n,l]; else
  if( hp<2.0 )      rgb1 = [m,V,l]; else
  if( hp<3.0 )      rgb1 = [l,V,n]; else
  if( hp<4.0 )      rgb1 = [l,m,V]; else
  if( hp<5.0 )      rgb1 = [n,l,V]; else
                    rgb1 = [V,l,m];
  return [rgb1[0], rgb1[1], rgb1[2], 1.0];
}
/**
* Overload Prepare
*/
ParticlesFountain.prototype.Prepare = function( gl )
{
  // Create vertex buffer
  this.vbo = gl.createBuffer();

  var pos = 0;
  var data = [] ;
  for( var v=0; v<this.number; ++v )
  {
	   // You MUST respect the following order ...
		 this.addAPoint( data, [0, 0, 0] );

     var H = Modulo(360.0*53.0*v/this.number,360.0);
     var color = this.H2RGB( H );
		 this.addAColor( data, color );

     var theta = 3.14159/2.0 *( 1.0 - 1.0/42.0); //Math.random()/16.0 );
     var phi = 2.0 * 3.14159 * (20*v/this.number); //Math.random();
     var length = 15 + Math.random() * 15.0;
     var velocity = [
       length * Math.cos(theta) * Math.cos(phi),
       length * Math.cos(theta) * Math.sin(phi),
       length * Math.sin(theta)
     ];
     this.addAVelocity( data, velocity );

     this.addAStartTime( data, 100*v/this.number); //100.0*Math.random() );
  }

  gl.bindBuffer( gl.ARRAY_BUFFER , this.vbo ) ;
  gl.bufferData( gl.ARRAY_BUFFER , new Float32Array( data ) , gl.STATIC_DRAW ) ;

	this.ready = true;
};

/**
* Overload draw
*/
ParticlesFountain.prototype.Draw = function( gl , scn )
{
	if( this.ready )
	{
		// Let's the shader prepare its attributes
		this.shader.setAttributes( this.vbo );
		// Let's render !
		gl.bindBuffer( gl.ARRAY_BUFFER , this.vbo ) ;
		gl.drawArrays( gl.POINTS , 0 , this.number ) ;
	}
}

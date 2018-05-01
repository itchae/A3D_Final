// All objects must inherit from Generic Object
Sphere.prototype = Object.create( GenericObject.prototype );
Sphere.prototype.constructor = Sphere ;

/**
* Create a Sphere given only its discretization parameters and its color
*/
function Sphere( name , shader , nTheta, nPhi, color, id )
{
  // Call parent constructor (mandatory !)
  GenericObject.call( this , name , shader ) ;
  // at least a prism
  if( nTheta < 3 ) nTheta = 3;
  if( nPhi < 4 ) nPhi = 4;
  // save the data
  this.nTheta     = nTheta;
  this.nPhi       = nPhi;
  this.color      = color ;
  this.identifier = id;
} ;

/**
* Creates a sphere point
*/
Sphere.prototype.CreatePoint = function( data, theta, phi )
{
  var pos  = 0;
  // the geometry
  var cosTheta = Math.cos( Math.PI * theta / this.nTheta );
  var sinTheta = Math.sin( Math.PI * theta / this.nTheta );
  var cosPhi = Math.cos( 2.0*Math.PI * phi / this.nPhi );
  var sinPhi = Math.sin( 2.0*Math.PI * phi / this.nPhi );
  var x = sinTheta * cosPhi;
  var y = sinTheta * sinPhi;
  var z = cosTheta;
  // add the geometry
  this.addAPoint( data, x, y, z );
  // add the color
  this.addAColor( data, this.color );
  // add the normal
  this.addANormal( data, x, y, z );
  // add a tangent
  this.addATangent( data, // derivative wrt theta
	      cosTheta * cosPhi, // TX
	      cosTheta * sinPhi, // TY
	      -sinTheta          // TZ
	    );
  // add a bitangent
  this.addABitangent( data, // derivative wrt phi
		-y, // -sinTheta*sinPhi
		x, // sinTheta*cosPhi,
		0.0);
  // Add texture coordinates
  this.addTextureCoordinates( data,
			(phi) / (this.nPhi), // U
			1.0-theta / (this.nTheta) );   // V
};

/**
* Overload Prepare
*/
Sphere.prototype.Prepare = function( gl )
{
  // Create vertex buffer
  this.vbo = gl.createBuffer( ) ;
  this.vbo.numItems = 0 ; // do not forget to modify it ...

  // Create index buffer
  this.ibo = gl.createBuffer();

  // prepare the fill
  var pos = 0;
  var data = [] ;
  var indices = [];
  var nbIndices = 0;

  // store the size of a given point
  this.vbo.sizeItems = data.length;

  // loop on elevation angle, from north to south ...
  for (var theta=0; theta<=this.nTheta; ++theta) { // nTheta+1 times
		for (var phi=0; phi<=this.nPhi; ++phi) { // nPhi+1 points
			// add a point
			this.CreatePoint( data, theta, phi );
			++this.vbo.numItems;
		}
  }

  // loop on elevation angle, from north to south ...
  for (var theta=0; theta<this.nTheta; ++theta) {
		// start a new row of triangles
		indices[nbIndices++] = theta*(this.nPhi+1);
		indices[nbIndices++] = (theta+1)*(this.nPhi+1);
		for (var phi=1; phi<=this.nPhi; ++phi) {
			// fill the row
			indices[nbIndices++] = theta*(this.nPhi+1) + phi;
			indices[nbIndices++] = (theta+1)*(this.nPhi+1) + phi;
		}
		// degenerate triangles ...
		if( theta+1 < this.nTheta ) {
			indices[nbIndices++] = (theta+1)*(this.nPhi+1)+this.nPhi;
			indices[nbIndices++] = (theta+1)*(this.nPhi+1);
		}
  }

  gl.bindBuffer( gl.ARRAY_BUFFER , this.vbo ) ;
  gl.bufferData( gl.ARRAY_BUFFER , new Float32Array( data ) , gl.STATIC_DRAW ) ;

  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER , this.ibo );
  gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( indices ) , gl.STATIC_DRAW);
  this.ibo.itemSize = 2; // sizeof(Uint16)
  this.ibo.numItems = nbIndices;
} ;

/**
* Overload draw
*/
Sphere.prototype.Draw = function( gl , scn )
{
  // Let's the shader prepare its attributes
  this.shader.setAttributes( this.vbo );
  var loc = this.shader.GetUniformLocation( "uIdentifier" );
  if (loc != null ) {
    gl.uniform1i( loc, this.identifier );
  }
  else {
    console.log("[Sphere.js] unable to set the identifier");
  }
  // Let's render !
  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER , this.ibo );
  gl.drawElements(gl.TRIANGLE_STRIP, this.ibo.numItems, gl.UNSIGNED_SHORT, 0);
};

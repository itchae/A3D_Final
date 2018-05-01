// All objects must inherit from Generic Object
Rectangle.prototype = Object.create( GenericObject.prototype );
Rectangle.prototype.constructor = Rectangle ;

/**
* Create a unit rectangle with normal sym to i
* @param name name of this instance
* @param shader WebGL shader
*/
function Rectangle( name , shader )
{
  // Call parent constructor (mandatory !)
  GenericObject.call( this , name , shader )
  this.ready = false;
} ;

/**
* Overload Prepare
*/
Rectangle.prototype.Prepare = function( gl )
{
    // vertices
    var vertices = [
    	[ -1, -1, 0 ],
    	[ -1,  1, 0 ],
    	[  1, -1, 0 ],
    	[  1,  1, 0 ]
    ];
    var colors = [
    	[1.0 , 0.0 , 0.0 , 1.0], // red
    	[0.0 , 1.0 , 0.0 , 1.0], // green
    	[0.0 , 0.0 , 1.0 , 1.0],  // blue
    	[1.0 , 0.0 , 1.0 , 1.0]  // yellow
    ] ;
    var normals = [
	     [1, 0, 0]
    ];
    var tangents = [
	     [0, 1, 0]
    ];
    var bitangents = [
	     [0, 0, 1]
    ];
    var texcoords = [
	     0, 0, 0, 1, 1, 0, 1, 1
    ];

    // Create vertex buffer
    this.vbo = gl.createBuffer( ) ;
    this.vbo.numItems = 4 ;

    var pos = 0;
    var data = [] ;
    for(var v=0; v<this.vbo.numItems; ++v) {
  		// You MUST respect the following order ...
  		this.addAPoint( data, vertices[v] );
  		// or "this.addAPoint( data, vertices[v][0], vertices[v][1], vertices[v][2] );"
  		this.addAColor( data, colors[v] );
  		this.addANormal( data, normals );
  		this.addATangent( data, tangents );
  		this.addABitangent( data, bitangents );
  		this.addTextureCoordinates( data, texcoords[v*2], texcoords[v*2+1] );
    }

    gl.bindBuffer( gl.ARRAY_BUFFER , this.vbo ) ;
    gl.bufferData( gl.ARRAY_BUFFER , new Float32Array( data ) , gl.STATIC_DRAW ) ;

	  this.ready = true;
} ;

/**
* Overload draw
*/
Rectangle.prototype.Draw = function( gl , scn )
{
	if( this.ready )
	{
		// Let's the shader prepare its attributes
		this.shader.setAttributes( this.vbo );
		// Let's render !
		gl.bindBuffer( gl.ARRAY_BUFFER , this.vbo ) ;
		gl.drawArrays( gl.TRIANGLE_STRIP , 0 , this.vbo.numItems ) ;
	}
}

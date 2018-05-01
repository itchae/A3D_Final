// All objects must inherit from Generic Object 
Box.prototype = Object.create( GenericObject.prototype );
Box.prototype.constructor = Box ;

/** 
* Create a new unit Box centering on O
* @param name name of this instance
* @param shader WebGL shader
*/
function Box( name , shader, color )
{
    // Call parent constructor (mandatory !)
    GenericObject.call( this , name , shader ) ;
    this.color = color == undefined ? [1,1,1,1] : color instanceof Vector ? [color.m[0],color.m[1],color.m[2],1] : color;
} ;

/**
* Overload Prepare
*/
Box.prototype.Prepare = function( gl )
{    
    // vertices
    var vertices = [
	[ -1, -1,  1,   1, -1,  1,   1,  1,  1,  -1,  1,  1 ], // FRONT
	[ -1, -1, -1,  -1,  1, -1,   1,  1, -1,   1, -1, -1 ], // BACK
	[ -1,  1, -1,  -1,  1,  1,   1,  1,  1,   1,  1, -1 ], // TOP
	[ -1, -1, -1,   1, -1, -1,   1, -1,  1,  -1, -1,  1 ], // BOTTOM
	[  1, -1, -1,   1,  1, -1,   1,  1,  1,   1, -1,  1 ], // RIGHT
	[ -1, -1, -1,  -1, -1,  1,  -1,  1,  1,  -1,  1, -1 ]  // LEFT
    ] ;
    var normals = [ 
	[0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0] 
    ];
    var tangents = [ 
	[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0] 
    ]; 
    var bitangents = [ 
	[0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1] 
    ];
    var texcoords = [
	[ 0, 0,  1, 0,  1, 1,  0, 1 ],
	[ 1, 0,  1, 1,  0, 1,  0, 0 ],
	[ 0, 0,  0, 1,  1, 1,  1, 0 ],
	[ 1, 0,  1, 1,  0, 1,  0, 0 ],
	[ 0, 0,  1, 0,  1, 1,  0, 1 ],
	[ 1, 0,  1, 1,  0, 1,  0, 0 ]
    ];

    // Create vertex buffer 
    this.vbo = gl.createBuffer( ) ;
    this.vbo.itemSize = 3 ; 
    this.vbo.numItems = 24 ; 

    var pos = 0;
    var data = [] ;
    for(var face=0; face<6; ++face) {
	for(var v=0; v<4; ++v) {
	    this.addAPoint( data, vertices[face][3*v], vertices[face][3*v+1], vertices[face][3*v+2] );
	    this.addAColor( data, this.color );
	    this.addANormal( data, normals[face] );
	    this.addATangent( data, tangents[face] );
	    this.addABitangent( data, bitangents[face] );
	    this.addTextureCoordinates( data, texcoords[face][2*v], texcoords[face][2*v+1] );
	}
    }
      
  gl.bindBuffer( gl.ARRAY_BUFFER , this.vbo ) ; 
  gl.bufferData( gl.ARRAY_BUFFER , new Float32Array( data ) , gl.STATIC_DRAW ) ; 

  // Create index buffer 
  this.ibo = gl.createBuffer();
  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER , this.ibo );
  var indices = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
      20, 21, 22,   20, 22, 23  // Left face
      ] ;

  gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( indices ) , gl.STATIC_DRAW);
  this.ibo.itemSize = 1;
  this.ibo.numItems = 36;
} ;

/**
* Overload draw
*/
Box.prototype.Draw = function( gl , scn )
{
    // Let's the shader prepare its attributes
    this.shader.setAttributes( this.vbo );

    // Let's render !
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER , this.ibo );
    gl.drawElements(gl.TRIANGLES, this.ibo.numItems, gl.UNSIGNED_SHORT, 0);
}


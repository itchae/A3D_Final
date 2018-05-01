// All objects must inherit from Generic Object
Plane.prototype = Object.create( GenericObject.prototype );
Plane.prototype.constructor = Plane ;

/**
* Create a Plane given its equation
*/
function Plane( name , shader , color , pos, normal, width )
{
    // Call parent constructor (mandatory !)
    GenericObject.call( this , name , shader ) ;
    // save the data
    this.color  = color;
    this.pos    = pos;
    this.normal = normal; // equiv to a, b, c
    this.width  = width;
    this.d      = -normal.Dot( pos );

    if( Math.abs(normal.X()) >= Math.abs(normal.Y())	&& Math.abs(normal.X()) >= Math.abs(normal.Z()) )
	     this.mainAxis = 0;  // X
    else if ( Math.abs(normal.Y()) >= Math.abs(normal.Z()) )
	     this.mainAxis = 1;  // Y
    else this.mainAxis = 2; // Z
    if( normal.Y()>0.0 || normal.Z()>0.0 )
	     this.tangent = normal.Cross( new Vector(1.0,0.0,0.0) ).Normalize();
    else
	     this.tangent = normal.Cross( new Vector(0.0,1.0,0.0) ).Normalize();
    this.bitangent = this.normal.Cross( this.tangent ).Normalize();
} ;

/**
* creates a Plane point
*/
Plane.prototype.CreatePoint = function( x, y, z )
{
    var data = [];
    data.push(x);
    data.push(y);
    data.push(z);
    // add the color
    if( this.shader.GetAttribute( AttributeEnum.color )) {
	for(var i=0; i<4; ++i)
	    data.push(this.color[i]); // R G B A
    }
    // add the normal
    if( this.shader.GetAttribute( AttributeEnum.normal )) {
	data.push(this.normal.X()); // NX
	data.push(this.normal.Y()); // NY
	data.push(this.normal.Z()); // NZ
    }
    if( this.shader.GetAttribute( AttributeEnum.tangent )) {
	data.push(this.tangent.X()); // TX
	data.push(this.tangent.Y()); // TY
	data.push(this.tangent.Z());         // TZ
    }
    if( this.shader.GetAttribute( AttributeEnum.bitangent )) {
	data.push(this.bitangent.X());
	data.push(this.bitangent.Y());
	data.push(this.bitangent.Z());
    }
    if( this.shader.GetAttribute( AttributeEnum.texcoord )) {
	if (this.mainAxis == 0) { // X
	    data.push( y );
	    data.push( z );
	}
	else if (this.mainAxis == 1) {
	    data.push( z );
	    data.push( x );
	}
	else {
	    data.push( x );
	    data.push( y );
	}
    }
    return data;
}

/**
* Overload Prepare
*/
Plane.prototype.Prepare = function( gl )
{
    // Create vertex buffer
    this.vbo = gl.createBuffer( ) ;
    this.vbo.itemSize = 3 ; // 3 coordinates per points ...
    this.vbo.numItems = 0 ; // do not forget to modify it ...

    // Create index buffer
    this.ibo = gl.createBuffer();

    // prepare the fill
    var data = [] ;
    var indices = [];
    var nbIndices = 0;

    // ================================================================
    // Add the points ...

    // store the size of a given point
    var point = this.CreatePoint( 0, 0, 0 );
    this.vbo.itemSize = point.length;

    // ++
    var point = this.CreatePoint(
    	this.pos.X() + this.width * (this.tangent.X()+this.bitangent.X()),
    	this.pos.Y() + this.width * (this.tangent.Y()+this.bitangent.Y()),
    	this.pos.Z() + this.width * (this.tangent.Z()+this.bitangent.Z())
    );
    for(var i=0; i<point.length; ++i) data.push(point[i]);
      ++this.vbo.numItems;
    // +-
    var point = this.CreatePoint(
    	this.pos.X() + this.width * (this.tangent.X()-this.bitangent.X()),
    	this.pos.Y() + this.width * (this.tangent.Y()-this.bitangent.Y()),
    	this.pos.Z() + this.width * (this.tangent.Z()-this.bitangent.Z())
    );
    for(var i=0; i<point.length; ++i) data.push(point[i]);
      ++this.vbo.numItems;
    // --
    var point = this.CreatePoint(
    	this.pos.X() - this.width * (this.tangent.X()+this.bitangent.X()),
    	this.pos.Y() - this.width * (this.tangent.Y()+this.bitangent.Y()),
    	this.pos.Z() - this.width * (this.tangent.Z()+this.bitangent.Z())
    );
    for(var i=0; i<point.length; ++i) data.push(point[i]);
      ++this.vbo.numItems;
    // -+
    var point = this.CreatePoint(
    	this.pos.X() - this.width * (this.tangent.X()-this.bitangent.X()),
    	this.pos.Y() - this.width * (this.tangent.Y()-this.bitangent.Y()),
    	this.pos.Z() - this.width * (this.tangent.Z()-this.bitangent.Z())
    );
    for(var i=0; i<point.length; ++i) data.push(point[i]);
      ++this.vbo.numItems;

    // finish
    gl.bindBuffer( gl.ARRAY_BUFFER , this.vbo ) ;
    gl.bufferData( gl.ARRAY_BUFFER , new Float32Array( data ) , gl.STATIC_DRAW ) ;

    // ================================================================
    // add the strips ...
    indices[nbIndices++] = 0;
    indices[nbIndices++] = 1;
    indices[nbIndices++] = 2;

    indices[nbIndices++] = 0;
    indices[nbIndices++] = 2;
    indices[nbIndices++] = 3;

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER , this.ibo );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( indices ) , gl.STATIC_DRAW );
    this.ibo.itemSize = 1;
    this.ibo.numItems = nbIndices;
} ;

/**
* Overload draw
*/
Plane.prototype.Draw = function( gl , scn )
{
    // Let's the shader prepare its attributes
    this.shader.setAttributes( this.vbo );

    // Let's render !
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER , this.ibo );
    gl.drawElements(gl.TRIANGLES, this.ibo.numItems, gl.UNSIGNED_SHORT, 0);
};

/**
* Modify the ground elevation
*/
Plane.prototype.Ground = function( gl, z )
{
    this.pos.GetGLVector()[2] = z;
    this.Prepare( gl );
};

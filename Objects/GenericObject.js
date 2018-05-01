// Class to manage an object (you must inherit from this class)
function GenericObject( _name , _shader )
{
    // Name of object to use
    this.name   = _name ;

    // Current object matrix
    this.matrix = new Matrix();

    // Shader to use for rendering current object
    this.shader = _shader ;

    // default animation: do nothing
    this.animator = function() {};

    // by default, an object should be displayed
    this.isDisplayable = true;
} ;

// Get Name of current object
GenericObject.prototype.GetName = function()
{
    return this.name ;
} ;

// Set Name of current object
GenericObject.prototype.SetName = function( aName )
{
    this.name = aName ;
} ;

// Get ModelMatrix
GenericObject.prototype.GetMatrix = function( )
{
    return this.matrix ;
} ;

// Set ModelMatrix
GenericObject.prototype.SetMatrix = function ( aMatrix )
{
    this.matrix = aMatrix ;
} ;

GenericObject.prototype.GetShader = function()
{
    return this.shader ;
} ;

GenericObject.prototype.SetShader = function( aShader )
{
    this.shader = aShader ;
} ;

GenericObject.prototype.SetAnimate = function( animator )
{
    this.animator = animator;
};

GenericObject.prototype.Animate = function( tick )
{
    this.animator( tick, this );
};

GenericObject.prototype.SetDisplay = function( isDisplayable ) {
    this.isDisplayable = isDisplayable;
};
GenericObject.prototype.DisplayMe = function() {
    return this.isDisplayable;
};

// Overload this function in order to compute additionnal items before drawing
// Warning: In order to use the shader, you need to ask it about the attributes it needs ...
// @param gl:  the OpenGL context
GenericObject.prototype.Prepare = function( gl )
{
} ;


// Overload this method in order to draw something
// Draw an object
// @param gl:  the OpenGL context
// @param scn: the scene
GenericObject.prototype.Draw = function( gl , scn )
{
} ;


// Add a position into an array of data
GenericObject.prototype.addAPoint = function( data, X, Y, Z )
{
  if( !this.shader.GetAttribute( AttributeEnum.position ) )
	  return 0;
  if( X instanceof Array )
	  data.push(X[0], X[1], X[2]);
  else if( typeof Z == "undefined" )
	  throw("GenericObject.addAPoint: missing parameter (typeof X: "+(typeof X)+")");
  else
	  data.push(X, Y, Z);
  return 3;
};


// Add a color into an array of data
GenericObject.prototype.addAColor = function( data, R, G, B, A )
{
  if( !this.shader.GetAttribute( AttributeEnum.color ) )
	  return 0;
  if( R instanceof Array )
	  data.push( R[0], R[1], R[2], R[3] );
  else if( typeof A == "undefined" )
	  throw("GenericObject.addAColor: missing parameter (typeof R: "+(typeof R)+")");
  else
	  data.push( R, G, B, A );
  return 4;
};


// Add a normal into an array of data
GenericObject.prototype.addANormal = function( data, X, Y, Z )
{
    if( !this.shader.GetAttribute( AttributeEnum.normal ) )
	return 0;
    if( X instanceof Array )
	data.push( X[0], X[1], X[2] );
    else if( typeof Z == "undefined" )
	throw("GenericObject.addANormal: missing parameter (typeof X: "+(typeof X)+")");
    else
	data.push( X, Y, Z );
    return 3;
};


// Add a tangent into an array of data
GenericObject.prototype.addATangent = function( data, X, Y, Z )
{
    if( !this.shader.GetAttribute( AttributeEnum.tangent ) )
	return 0;
    if( X instanceof Array )
	data.push( X[0], X[1], X[2] );
    else if( typeof Z == "undefined" )
	throw("GenericObject.addATangent: missing parameter (typeof X: "+(typeof X)+")");
    else
	data.push( X, Y, Z );
    return 3;
};


// Add a bitangent into an array of data
GenericObject.prototype.addABitangent = function( data, X, Y, Z )
{
    if( !this.shader.GetAttribute( AttributeEnum.bitangent ) )
	return 0;
    if( X instanceof Array )
	data.push( X[0], X[1], X[2] );
    else if( typeof Z == "undefined" )
	throw("GenericObject.addABitangent: missing parameter (typeof X: "+(typeof X)+")");
    else
	data.push( X, Y, Z );
    return 3;
};



// Add texture coordinates into an array of data
GenericObject.prototype.addTextureCoordinates = function( data, U, V )
{
    if( !this.shader.GetAttribute( AttributeEnum.texcoord ) )
	return 0;
    if( U instanceof Array )
	data.push( U[0], U[1] );
    else if( typeof V == "undefined" )
	throw("GenericObject.addTextureCoordinates: missing parameter (typeof U: "+(typeof U)+")");
    else
	data.push( U, V );
    return 2;
};


// Add a tangent into an array of data
GenericObject.prototype.addAVelocity = function( data, X, Y, Z )
{
  if( !this.shader.GetAttribute( AttributeEnum.velocity ) )
	  return 0;
  if( X instanceof Array )
	  data.push( X[0], X[1], X[2] );
  else if( typeof Z == "undefined" )
	  throw("GenericObject.addAVelocity: missing parameter (typeof X: "+(typeof X)+")");
  else
	  data.push( X, Y, Z );
  return 3;
};


// Add a start time into an array of data
GenericObject.prototype.addAStartTime = function( data, X )
{
  if( !this.shader.GetAttribute( AttributeEnum.startTime ) )
	  return 0;
  data.push( X );
  return 1;
};

// Add a mass into an array of data
GenericObject.prototype.addAMass = function( data, m )
{
  if( !this.shader.GetAttribute( AttributeEnum.mass ) )
	  return 0;
  data.push( m );
  return 1;
};

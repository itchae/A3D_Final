// All shaders must inherit from Shader object
DefaultShader.prototype = Object.create( Shader.prototype );
DefaultShader.prototype.constructor = DefaultShader ;

/* constructor */
function DefaultShader( gl ) {
    Shader.call( this , "default",  "./Shaders/GLSL/default.vs", "./Shaders/GLSL/default.fs",
		 gl, DefaultShader.prototype.attributes ) ;
} ;

DefaultShader.prototype.attributes = [
    AttributeEnum.position, AttributeEnum.color
];

DefaultShader.prototype.setAttributes = function ( vbo )
{
    gl.bindBuffer( gl.ARRAY_BUFFER , vbo ) ;

    // Get Position attribute
    var attr_pos = this.GetAttributeLocation( "aPosition" ) ;

    // Get Color attribute
    var attr_col = this.GetAttributeLocation( "aColor" ) ;

    // Activate Attribute
    gl.enableVertexAttribArray( attr_pos ) ;
    gl.enableVertexAttribArray( attr_col ) ;

    // Fill all parameters for rendering
    gl.vertexAttribPointer( attr_pos , 3 , gl.FLOAT , false , 28 , 0 ) ;
    gl.vertexAttribPointer( attr_col , 4 , gl.FLOAT , false , 28 , 12 ) ;

} ;

// All shaders must inherit from Shader object
BoxShader1.prototype = new Shader();
BoxShader1.prototype.constructor = BoxShader1 ;

/* constructor */
function BoxShader1( gl ) {
    Shader.call( this , "boxShader1",  "./Shaders/GLSL/boxShader1.vs", "./Shaders/GLSL/boxShader1.fs", 
		 gl, BoxShader1.prototype.attributes ) ;
} ;

BoxShader1.prototype.attributes = [
    AttributeEnum.position, AttributeEnum.normal, AttributeEnum.color
];

BoxShader1.prototype.setAttributes = function ( vbo )
{
    gl.bindBuffer( gl.ARRAY_BUFFER , vbo ) ;

    // Get Position attribute
    var attr_pos = this.GetAttributeLocation( "aPosition" ) ;

    // Get Color attribute
    var attr_col = this.GetAttributeLocation( "aColor" ) ;

    // Get Normal attribute
    var attr_nor = this.GetAttributeLocation( "aNormal" ) ;

    // Activate Attribute
    gl.enableVertexAttribArray( attr_pos ) ;
    gl.enableVertexAttribArray( attr_col ) ;
    gl.enableVertexAttribArray( attr_nor ) ;

    // Fill all parameters for rendering
    gl.vertexAttribPointer( attr_pos , 3 , gl.FLOAT , false , 40 , 0 ) ;
    gl.vertexAttribPointer( attr_col , 4 , gl.FLOAT , false , 40 , 12 ) ;
    gl.vertexAttribPointer( attr_nor , 3 , gl.FLOAT , false , 40 , 28 ) ;
};

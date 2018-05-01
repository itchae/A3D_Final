// All shaders must inherit from Shader object
FragmentShader.prototype = new Shader();
FragmentShader.prototype.constructor = FragmentShader ;

/* constructor */
function FragmentShader( gl, shaderName, shaderText ) {
    Shader.call( this , "first",  "./Shaders/GLSL/gpgpu.vs",
		 shaderName,
		 gl, FragmentShader.prototype.attributes,
         shaderText ) ;

} ;

FragmentShader.prototype.attributes = [
    AttributeEnum.position, AttributeEnum.texcoord
];


FragmentShader.prototype.setAttributes = function ( vbo )
{
    gl.bindBuffer( gl.ARRAY_BUFFER , vbo ) ;

    // Get Position attribute
    var attr_pos   = this.GetAttributeLocation( "aPosition" ) ;
    var attr_coord = this.GetAttributeLocation( "aCoord" ) ;

    // Activate Attribute
    gl.enableVertexAttribArray( attr_pos ) ;
    gl.enableVertexAttribArray( attr_coord ) ;

    // Fill all parameters for rendering
    gl.vertexAttribPointer( attr_pos   , 3 , gl.FLOAT , false , 20 ,  0 ) ;
    gl.vertexAttribPointer( attr_coord , 2 , gl.FLOAT , false , 20 , 12 ) ;

    // add specific uniform variables ...
    for(var i=0; i<this.list_uniform.length; ++i) {
    	this.list_uniform[i]( gl );
    }
} ;

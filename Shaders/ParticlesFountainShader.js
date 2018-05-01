// All shaders must inherit from Shader object
ParticlesFountainShader.prototype = new Shader();
ParticlesFountainShader.prototype.constructor = ParticlesFountainShader ;

/* constructor */
function ParticlesFountainShader( gl ) {
    Shader.call( this , "ParticlesFountainShader",
                 "./Student/ParticlesFountain.vs",
            		 "./Shaders/GLSL/ParticlesFountain.fs",
                 gl,
            		 ParticlesFountainShader.prototype.attributes ) ;

    this.list_uniform = new Array();
} ;

ParticlesFountainShader.prototype.attributes = [
    AttributeEnum.position, AttributeEnum.color, AttributeEnum.velocity,
    AttributeEnum.startTime
];

ParticlesFountainShader.prototype.addUniform = function( uniform ) {
    this.list_uniform.push( uniform );
};

ParticlesFountainShader.prototype.setAttributes = function ( vbo )
{
    gl.bindBuffer( gl.ARRAY_BUFFER , vbo ) ;

    // Get Position attribute
    var attr_pos   = this.GetAttributeLocation( "aPosition" ) ;
    var attr_color = this.GetAttributeLocation( "aColor" ) ;
    var attr_velo  = this.GetAttributeLocation( "aVelocity" ) ;
    var attr_start  = this.GetAttributeLocation( "aStartTime" ) ;

    // Activate Attribute
    gl.enableVertexAttribArray( attr_pos ) ;
    gl.enableVertexAttribArray( attr_color ) ;
    gl.enableVertexAttribArray( attr_velo ) ;
    gl.enableVertexAttribArray( attr_start ) ;

    // Fill all parameters for rendering
    gl.vertexAttribPointer( attr_pos   , 3 , gl.FLOAT , false , 44 ,  0 ) ;
    gl.vertexAttribPointer( attr_color , 4 , gl.FLOAT , false , 44 , 12 ) ;
    gl.vertexAttribPointer( attr_velo  , 3 , gl.FLOAT , false , 44 , 28 ) ;
    gl.vertexAttribPointer( attr_start , 1 , gl.FLOAT , false , 44 , 40 ) ;

    // add specific uniform variables ...
    for(var i=0; i<this.list_uniform.length; ++i) {
    	 this.list_uniform[i]( gl );
    }
};

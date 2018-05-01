// All shaders must inherit from Shader object
ParticleSphereShader.prototype = Object.create( Shader.prototype );
ParticleSphereShader.prototype.constructor = ParticleSphereShader ;

/* constructor */
function ParticleSphereShader( gl ) {
    Shader.call( this , "ParticleSphereShader",  "./Shaders/GLSL/ParticleSphere.vs",
    "./Shaders/GLSL/ParticleSphere.fs", gl,
    ParticleSphereShader.prototype.attributes ) ;
} ;

ParticleSphereShader.prototype.attributes = [
    AttributeEnum.position, AttributeEnum.color, AttributeEnum.identifier
];

ParticleSphereShader.prototype.setAttributes = function ( vbo )
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

    // add specific uniform variables ...
    for(var i=0; i<this.list_uniform.length; ++i) {
    	this.list_uniform[i]( gl );
    }
} ;

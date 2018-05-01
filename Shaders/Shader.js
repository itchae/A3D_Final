/*
 * Class for managing shaders
 */
function Shader( name , vertex_source_name , fragment_source_name , gl, attributes, fragment_shader_text )
{
    this.name = name ;
    this.vertex_shader_name = vertex_source_name;
    this.fragment_shader_name = fragment_source_name;
    this.fragment_source_text = fragment_shader_text !== undefined ? fragment_shader_text : "";
    this.attributes = attributes;

    this.program = null ;
    this.vertex_shad = null ;
    this.fragment_shad = null ;

    this.list_uniform = new Array();

    // Keep gl context
    this.gl = gl ;

    // Compile shader
    this.Reload();
} ;

// reload the shaders ...
Shader.prototype.Reload = function() {
    if( this.gl !== undefined ) this.PrepareShader() ;
}

// Compile and link shader
Shader.prototype.PrepareShader = function( )
{
    this.vertex_source_text = LoadFileSync(this.vertex_shader_name) ;
    if( this.fragment_shader_name != null )
        this.fragment_source_text = LoadFileSync(this.fragment_shader_name) ;

    var gl = this.gl ;

    // Create vertex shader
    this.vertex_shad = gl.createShader( gl.VERTEX_SHADER );

    // Compile vertex shader
    gl.shaderSource(this.vertex_shad, this.vertex_source_text );
    gl.compileShader(this.vertex_shad );

    if (!gl.getShaderParameter(this.vertex_shad, gl.COMPILE_STATUS))
    {
	console.log( "Vertex shader: " + gl.getShaderInfoLog( this.vertex_shad ) );
    }

    // Create fragment shader
    this.fragment_shad = gl.createShader( gl.FRAGMENT_SHADER ) ;
    gl.shaderSource(this.fragment_shad , this.fragment_source_text );
    gl.compileShader(this.fragment_shad );

    if (!gl.getShaderParameter(this.fragment_shad, gl.COMPILE_STATUS))
    {
	console.log( gl.getShaderInfoLog( this.fragment_shad ) ) ;
    }

    // Compile and link program
    this.program = gl.createProgram();
    gl.attachShader(this.program, this.vertex_shad);
    gl.attachShader(this.program, this.fragment_shad);
    gl.linkProgram(this.program);

    if ( ! gl.getProgramParameter(this.program, gl.LINK_STATUS) )
    {
	console.log("Could not initialise shaders");
    }
} ;

// Make shader active
Shader.prototype.SetActive = function( )
{
    this.gl.useProgram( this.program ) ;
} ;

// Get Name
Shader.prototype.GetName = function()
{
    return this.name ;
} ;

Shader.prototype.addUniform = function( uniform ) {
    this.list_uniform.push( uniform );
};

// Get uniform location given a name
// !!!!! Shader must be active before using this function
Shader.prototype.GetUniformLocation = function( aName )
{
    return this.gl.getUniformLocation( this.program , aName ) ;
} ;

// Get attribute location given a name
// !!!!! Shader must be active before using this function
Shader.prototype.GetAttributeLocation = function( aName )
{
    return this.gl.getAttribLocation( this.program , aName ) ;
} ;

// Get the attribute list, necessary to construct the VBO
Shader.prototype.GetAttribute = function( attrib ) {
    for(var i=0; i<this.attributes.length; ++i)
	   if (this.attributes[i] == attrib ) return true;
    return false;
} ;

// Set the light position (for shader using light)
Shader.prototype.SetLightPosition = function( pos ) {
} ;

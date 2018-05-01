// Scene Class Management
function Scene()
{
    // List of Objects
    this.object_list = new Array() ;

    // List of
    this.shader_list = new Array() ;

    // List of Cameras (for multiple viewpoints)
    this.camera_list = new Array() ;

    // Active Camera index
    this.active_camera = -1 ;

    // set the animation step
    this.ticks = 0;

    // set the light
    this.lightPosition = new Vector( 100, 100, 100 );

    //this.texture = null;

    // add on for discrete geometry
    this.scale = 1.0; // /16.0;
    this.width = 1024;
    this.height = 768;
    this.translate_x = 0.0;
    this.translate_y = 0.0;
    this.mouse_x = 512;
    this.mouse_y = 384;

} ;

/**
* Add an object
*/
Scene.prototype.AddObject = function( anObject )
{
    this.object_list.push( anObject ) ;
}

/**
* Get an object given its name
*/
Scene.prototype.GetObjectByName = function( aName )
{
    for( var i = 0 ; i < this.object_list.length ; ++i )
    {
	if( this.object_list[ i ].GetName() == aName )
	    return this.object_list[ i ] ;
    }
    console.log( "[ Scene::GetObjectByName ] object : \"" + aName + "\" not found" ) ;
    return null ;
} ;

/**
* Remove an object by name
*/
Scene.prototype.RemoveObjectByName = function( anObjectName, silent )
{
    for( var i = 0 ; i < this.object_list.length ; ++i )
    {
	     if( this.object_list[ i ].GetName() == anObjectName )
	      {
	         this.object_list.splice( i , 1 ) ;
	         return;
	      }
    }
    if( silent === undefined || silent != true )
      console.log( "[ Scene::RemoveObjectByName ] object : \"" + anObjectName + "\" not found" ) ;
} ;

/**
* Remove an object by name
*/
Scene.prototype.RemoveAllObjects = function()
{
  this.object_list =  new Array() ;
} ;

/**
* Replace an object by name
*/
Scene.prototype.ReplaceObjectByName = function( anObjectName, newObject )
{
    for( var i = 0 ; i < this.object_list.length ; ++i )
    {
	     if( this.object_list[ i ].GetName() == anObjectName )
	      {
	         this.object_list[i] = newObject ;
	         return;
	      }
    }
    console.log( "[ Scene::ReplaceObjectByName ] object : \"" + anObjectName + "\" not found" ) ;
} ;

// Add a shader
Scene.prototype.AddShader = function( aShader )
{
    this.shader_list.push( aShader ) ;
} ;

// Get a shader given its name
Scene.prototype.GetShaderByName = function( aName )
{
    for( var i = 0 ; i < this.shader_list.length ; ++i )
    {
	if( this.shader_list[ i ].GetName() == aName )
	    return this.shader_list[ i ] ;
    }
    console.log( "[ Scene::GetShaderByName ] shader : \"" + aName + "\" not found" ) ;
    return null ;
} ;

// Remove a shader from list given its name
Scene.prototype.RemoveShaderByName = function( aName )
{
    for( var i = 0 ; i < this.object_list.length ; ++i )
    {
	if( this.shader_list[ i ].GetName() == aName )
	{
	    this.shader_list.splice( i , 1 ) ;
	    break ;
	}
    }
    console.log( "[ Scene::RemoveShaderByName ] shader : \"" + aName + "\" not found" ) ;
} ;

// Set the light position
Scene.prototype.SetLightPosition = function( pos )
{
    this.lightPosition  = new Vector(pos) ;
};

/**
* Add a camera
*/
Scene.prototype.AddCamera = function( aCamera )
{
    this.camera_list.push( aCamera ) ;
} ;

/**
 * Get a camera
 */
Scene.prototype.GetCameraById = function( anIndex )
{
    if( anIndex < 0 || anIndex >= this.camera_list.length )
    {
	console.log( "[ Scene::GetCameraById ] invalid index : " + anIndex ) ;
	return null ;
    }
    else
    {
	return this.camera_list[ anIndex ] ;
    }
} ;

/**
 * Set Current Camera
 */
Scene.prototype.SetActiveCamera = function( anIndex )
{
    if( anIndex < 0 || anIndex >= this.camera_list.length )
    {
	alert( "[ Scene::SetActiveCamera ] invalid index : " + anIndex ) ;
    }
    this.camera_list.active_camera = anIndex ;
} ;

// Get current camera
Scene.prototype.GetActiveCamera = function()
{
    return this.camera_list[ this.active_camera ] ;
}

/**
 * Prepare Scene before render
 */
Scene.prototype.Prepare = function( gl )
{
    // Prepare each objects
    for( var i = 0 ; i < this.object_list.length ; ++i )
    {
	     this.object_list[ i ].Prepare( gl ) ;
	      this.object_list[ i ].Animate( this.ticks );
    }

    // If no camera
    if( this.camera_list.length == 0 )
    {
	     // Default Camera
	      var cam = new Camera( new Vector( 10 , 10 , 10 ) ,
			      new Vector( 0 , 0 , 0 ) ,
			      new Vector( 0 , 0 , 1 ) , 800 , 600 ,
			      60/2 ,
			      0.1 , 1000.0 ) ;
	      this.camera_list.push( cam ) ;
    }

    // If camera index not valid
    if( this.active_camera < 0 || this.active_camera >= this.camera_list.length )
    {
	     this.active_camera = 0 ;
    }
};


/**
 * Animate
 */
Scene.prototype.Animate = function() {
    ++ this.ticks;
    for( var i = 0 ; i < this.object_list.length ; ++i ) {
    	var obj = this.object_list[ i ] ;
    	if( !obj.DisplayMe() ) continue;
    	obj.Animate( this.ticks );
    };
};



/*
 * reload the shader, reinit the scene (the time)/
*/
Scene.prototype.Reload = function() {
    this.ticks = 0;
    for( var i = 0 ; i < this.object_list.length ; ++i )
    {
    	var obj = this.object_list[ i ] ;
    	if( !obj.DisplayMe() ) continue;
    	var shad = obj.GetShader();
    	shad.Reload() ;
    }
};


/**
 * Draw a scene
 */
Scene.prototype.Draw = function( gl, clear )
{
    gl.viewport( 0, 0, this.width, this.height );
    if( clear===undefined || clear )
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT ) ;

    /** Get Current Camera Matrices */
    var cam = this.GetActiveCamera() ;
    var mv_mat = cam.GetViewMatrix() ;
    var pj_mat = cam.GetProjectionMatrix() ;

    var lightPos = mv_mat.Apply( this.lightPosition );

    for( var i = 0 ; i < this.object_list.length ; ++i )
    {
    	// Get Object Properties
    	var obj = this.object_list[ i ] ;
    	if( !obj.DisplayMe() ) continue;

    	//var obj_shad_name = obj.GetShader( ) ;
    	var obj_mat = obj.GetMatrix( );

    	// Get Location of uniform variables
    	var shad = obj.GetShader();//this.GetShaderByName( obj_shad_name ) ;
    	shad.SetActive( gl ) ;
    	var loc_mv_mat = shad.GetUniformLocation( "uModelViewMatrix" ) ;
    	var loc_pj_mat = shad.GetUniformLocation( "uProjectionMatrix" ) ;
    	var loc_nm_mat = shad.GetUniformLocation( "uNormalMatrix" ) ;

    	shad.SetLightPosition( lightPos );

    	// Compute real ModelView matrix
    	//var mv = new Matrix(obj_mat).Mul( mv_mat ) ;
    	var mv = new Matrix(mv_mat).Mul(obj_mat);

    	// Set Uniform Matrices
    	if( loc_mv_mat != null ) {
    	  gl.uniformMatrix4fv( loc_mv_mat , false , mv.GetGLVector() ) ;
        //console.log("mv = "+mv.GetGLVector());
      }
    	if( loc_pj_mat != null )
    	    gl.uniformMatrix4fv( loc_pj_mat , false , pj_mat.GetGLVector() ) ;

    	// If Shader has normal matrix give it !
    	if( loc_nm_mat != null )
    	{
    	    // Compute Normal matrix
    	    var nm = new Matrix(mv).toNormal(); //mat44.transpose( mat44.invert( mv ) ) ;
    	    gl.uniformMatrix4fv( loc_nm_mat , false , nm.GetGLVector() ) ;
    	}

    	// animate ...
    	var loc_time = shad.GetUniformLocation( "uTime" );
    	if( loc_time != null )
    	    gl.uniform1f( loc_time, this.ticks*0.01 );

    	// scaling ...
    	var loc_scale = shad.GetUniformLocation( "uScale" );
    	if( loc_scale != null )
    	    gl.uniform1f( loc_scale, this.scale );

    	// resolution
    	var loc_resol = shad.GetUniformLocation( "uResolution" );
    	if( loc_resol != null )
    	    gl.uniform2f( loc_resol, this.width, this.height );

    	// translation
    	var loc_translate = shad.GetUniformLocation( "uTranslate" );
    	if( loc_translate != null )
    	    gl.uniform2f( loc_translate, this.translate_x, this.translate_y );

    	// mouse
    	var loc_mouse = shad.GetUniformLocation( "uMouse" );
    	if( loc_mouse != null ) {
    	    var x = Math.floor( (this.mouse_x)*this.scale );
    	    var y = Math.floor( (this.mouse_y)*this.scale );
    	    gl.uniform2f( loc_mouse, x, y );
    	}

    	// RenderObject
    	obj.Draw( gl , this ) ;
    }
};

// scaling
Scene.prototype.setScale = function( scale ) {
    this.scale = scale;
};
Scene.prototype.getScale = function() {
    return this.scale;
};
Scene.prototype.multScale = function( scale ) {
    this.scale *= scale;
};

// resolution
Scene.prototype.setWidth = function( width ) {
    this.width = width;
};
Scene.prototype.setHeight = function( height ) {
    this.height = height;
};
Scene.prototype.setDimension = function( width, height ) {
    this.width = width;
    this.height = height;
};
Scene.prototype.getWidth = function( ) {
    return this.width;
};
Scene.prototype.getHeight = function( ) {
    return this.height;
};

// translate
Scene.prototype.setTranslate = function( x, y ) {
    this.translate_x = x;
    this.translate_y = y;
};
Scene.prototype.addTranslateX = function( x ) {
    this.translate_x += x;
};
Scene.prototype.addTranslateY = function( y ) {
    this.translate_y += y;
};
Scene.prototype.setMouse = function( x, y ) {
    this.mouse_x = x+this.translate_x*this.width;
    this.mouse_y = y+this.translate_y*this.height;
};

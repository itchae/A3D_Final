// All exercises must inherit from GenericExercise
ExerciseFragmentRT.prototype = Object.create( GenericExercise.prototype );
ExerciseFragmentRT.prototype.constructor = ExerciseFragmentRT;

// Constructor
function ExerciseFragmentRT( name, number, callback, gl, builder, stop )
{
    GenericExercise.call(this, name, number, callback); // mandatory ...

    this.diff = 0;
    this.width = 100;
    this.height = 100;
    this.animate = false;
    //this.texture = new Texture( gl, null );
    this.power = 1.0;
    this.einfo = document.getElementById("info");
    this.mouseX = 0;
    this.mouseY = 0;
    this.maxDepth = 7;
    this.stop = stop;
    this.nextStop = stop;

    var exercise = this;

    /*
    We use two shaders:
    - first one is to display a texture T, in a classical way (a simple Fragment Shader)
    - second one does the ray-tracing, but into a RenderingTarget. Then, the result is automatically
      stored into texture, that becomes the entry of the first shader (texture T).
    */

    // One rendering target
    this.ReTarget = null;
    this.resetPassNumber();

    this.build(gl, builder);

    // Final display
    this.scene = new Scene();
    var shader = new FragmentShader( gl, "./Shaders/fragment-shader-300.fs" ) ;
    shader.addUniform( function(gl) {
        var location = shader.GetUniformLocation( "uTexture" );
        if( location != null && exercise.ReTarget != null ) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, exercise.ReTarget.GetFrontBuffers()[0] );
            gl.uniform1i( location, 0);
        }
        location = shader.GetUniformLocation( "uPower" );
        if( location != null ) {
            gl.uniform1f( location, exercise.power );
        }
        location = shader.GetUniformLocation( "uPassNumber" );
        if( location != null ) {
            gl.uniform1f( location, exercise.passNumber+1.0 );
        }
        /*location = shader.GetUniformLocation( "uMIS" );
        if( location != null ) {
            gl.uniform1i( location, exercise.rtScene.getMIS() );
        }
        location = shader.GetUniformLocation( "uImportance" );
        if( location != null ) {
            gl.uniform1i( location, exercise.rtScene.getImportance() );
        }*/
    } );
    this.scene.AddShader( shader );
    var rectangle = new Rectangle( "Rectangle1" , shader ) ;
    this.scene.AddObject( rectangle ) ;
    this.scene.AddCamera( this.rtScene.camera );
    // that's all for final display

    // add parameters to UI
    this.divHTML = document.createElement("div");
    this.divHTML.id = "exo-param-"+number;
    this.divHTML.style.display = 'none';
    document.getElementById("menu").insertBefore(this.divHTML, document.getElementById("param-bottom"));

    this.divHTML.appendChild(
    	this.createButton("pp", "++ power", function(button) {
    	    exercise.addPower( 0.1 );
    	    if(!exercise.animate) update();
    	})
    );
    this.divHTML.appendChild(
    	this.createButton("pm", "-- power", function(button) {
    	    exercise.addPower( -0.1 );
    	    if(!exercise.animate) update();
    	})
    );
    this.divHTML.appendChild(
    	this.createButton("x1", "X1", function(button){
    	    exercise.setZoom(1); if(!exercise.animate)update();
    	    if( exercise.buttonMode != null )
    		  exercise.buttonMode.setAttribute('class' , "button" );
    	    exercise.buttonMode = button;
    	    button.setAttribute('class' , "button-selected" );
    	})
    );
    this.divHTML.appendChild(
    	this.createButton("x2", "X2", function(button){
    	    exercise.setZoom(2); if(!exercise.animate)update();
    	    if( exercise.buttonMode != null )
    		  exercise.buttonMode.setAttribute('class' , "button" );
    	    exercise.buttonMode = button;
    	    button.setAttribute('class' , "button-selected" );
    	})
    );
    this.buttonMode = this.createButton("x4", "X4", function(button){
	   exercise.setZoom(4); if(!exercise.animate)update();
	   if( exercise.buttonMode != null )
	       exercise.buttonMode.setAttribute('class' , "button" );
	   exercise.buttonMode = button;
	   button.setAttribute('class' , "button-selected" );
    });
    this.divHTML.appendChild( this.buttonMode);
    this.buttonMode.setAttribute('class', "button-selected");
    this.divHTML.appendChild(
    	this.createButton("x8", "X8", function(button){
    	    exercise.setZoom(8); if(!exercise.animate)update();
    	    if( exercise.buttonMode != null )
    		  exercise.buttonMode.setAttribute('class' , "button" );
    	    exercise.buttonMode = button;
    	    button.setAttribute('class' , "button-selected" );
    	})
    );
    this.Prepare(gl);
    this.zoom = 4;
    this.reset(gl);
};

ExerciseFragmentRT.prototype.addPower = function( val ) {
    if( val > 0.0 ) {
	   if( this.power >= 2.0 ) val *= 5.0;
    }
    else {
	   if( this.power > 2.0 ) val *= 5.0;
    }
    this.power += val;
    if( this.power < 0.1 ) this.power = 0.1;
};

ExerciseFragmentRT.prototype.getPassNumber = function() {
    return this.passNumber;
}
ExerciseFragmentRT.prototype.incPassNumber = function() {
    this.passNumber++;
    if( this.passNumber >= this.nextStop ) {
        this.nextStop += this.stop;
        this.animate = false;
        animate = false;
        document.getElementById("animButton").className = "button";
    };
}
ExerciseFragmentRT.prototype.resetPassNumber = function() {
    this.passNumber = 0;
    this.nextStop = this.stop;
}

// ================================================================
var shader2 = null;

// ================================================================
ExerciseFragmentRT.prototype.build = function(gl,builder)
{
    this.rtScene = builder;
    var exercise = this;

    if( shader2 == null ) {
        var student = "/*STUDENT WORK STARTS HERE */\n"
        + LoadFileSync( "./Student/dielectric.fs" )
        + LoadFileSync( "./Student/fresnel.fs" )
    	+ LoadFileSync( "./Student/cookAndTorrance.fs" )
        + LoadFileSync( "./Student/lambert.fs" )
    	+ LoadFileSync( "./Student/oren-nayar.fs" )
        + LoadFileSync( "./Student/Ashikhmin.fs" )
        + LoadFileSync( "./Student/plane.fs" )
        + LoadFileSync( "./Student/phong.fs" )
    	+ LoadFileSync( "./Student/sphere.fs" )
    	+ LoadFileSync( "./Student/triangle.fs" )
        + LoadFileSync( "./Student/cone.fs" )
        + LoadFileSync( "./Student/tp11and12.fs" )
        ;

    this.src = LoadFileSync( "./RT/definitions.fs" ) + student + LoadFileSync( "./RT/raytracing.fs" );
    // Shader: classical rectangle one.
    var shader2 = new FragmentShader( gl, null, this.src ) ;
    // many textures to add: geometry, brdf, and the output
    shader2.addUniform( function(gl) {
        var loc_texture = shader2.GetUniformLocation( "texObject1" );
        if( loc_texture != null ) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, exercise.rtScene.getObjectTexture() );
            gl.uniform1i( loc_texture, 0);
        }
        loc_texture = shader2.GetUniformLocation( "texBrdf1" );
        if( loc_texture != null ) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, exercise.rtScene.getBrdfTexture() );
            gl.uniform1i( loc_texture, 1);
        }
        var textures = exercise.ReTarget.GetBackBuffers();
        loc_texture = shader2.GetUniformLocation( "texAccumulator" );
        if( loc_texture != null ) {
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, textures[0] );
            gl.uniform1i( loc_texture, 2);
        }
        loc_texture = shader2.GetUniformLocation( "texSeed" );
        if( loc_texture != null ) {
            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, textures[1] );
            gl.uniform1i( loc_texture, 3);
        }
    });
    shader2.addUniform( function(gl) {
        var location = shader2.GetUniformLocation( "objectsNumber" );
        if( location != null ) {
            var number = exercise.rtScene.getObjectsNumber();
            gl.uniform1i( location, number );
        }
        location = shader2.GetUniformLocation( "passNumber" );
        if( location != null ) {
            var number = exercise.getPassNumber();
            gl.uniform1i( location, number );
        }
        location = shader2.GetUniformLocation( "nbLightSources" );
        if( location != null ) {
            gl.uniform1i( location, exercise.rtScene.getNumberOfLightSources() );
        }
        location = shader2.GetUniformLocation( "uMaxDepth" );
        if( location != null ) {
            gl.uniform1i( location, exercise.maxDepth );
        }
        location = shader2.GetUniformLocation( "uMIS" );
        if( location != null ) {
            gl.uniform1i( location, exercise.rtScene.getMIS() );
        }
        location = shader2.GetUniformLocation( "uImportance" );
        if( location != null ) {
            gl.uniform1i( location, exercise.rtScene.getImportance() );
        }
    });
    shader2.addUniform( function(gl) {
        var location = shader2.GetUniformLocation( "uWidth" );
        if( location != null ) gl.uniform1i( location, exercise.width );
        location = shader2.GetUniformLocation( "uHeight" );
        if( location != null ) gl.uniform1i( location, exercise.height );
    });
    shader2.addUniform( function(gl) {
        var location = shader2.GetUniformLocation( "uLight" );
        if( location != null ) {
          var light = exercise.rtScene.getLight();
          var array = new Float32Array(4);
          array[0] = light.X();
          array[1] = light.Y();
          array[2] = light.Z();
          array[3] = exercise.power;
          gl.uniform4fv( location, array );
        }
    });
    shader2.addUniform( function(gl) {
        var location = shader2.GetUniformLocation( "uCamera" );
        if( location != null ) {
            /*var camera = exercise.rtScene.getCamera();
            var mat = new Float32Array(16);
                mat[0] = camera.eyePos.X();
                mat[1] = camera.eyePos.Y();
                mat[2] = camera.eyePos.Z();
                mat[3] = 0.0;
                var   dir = new Vector(camera.centerPos).Sub(camera.eyePos).Normalize();
                var right = dir.Cross(camera.up);//.Normalize();
                if( right.X() != 0.0 && right.Y() != 0.0)
                    right.m[2] = 0.0;
                right.Normalize();
                var    up = right.Cross(dir).Normalize();
                mat[4] = dir.X();
                mat[5] = dir.Y();
                mat[6] = dir.Z();
                mat[7] = 0.0;
                mat[8] = up.X();
                mat[9] = up.Y();
                mat[10] = up.Z();
                mat[11] = 0.0;
                mat[12] = right.X();
                mat[13] = right.Y();
                mat[14] = right.Z();
                var fov = camera.fov < 10.0 ? 10.0 : camera.fov>85.0 ? 85.0 : camera.fov;
                mat[15] = Math.sin(fov * Math.PI / 180.0);
                gl.uniformMatrix4fv( location, false, mat );*/
                var camera = exercise.rtScene.getCamera();
                var vectors = camera.getVectors();

                var mat = new Float32Array(16);
                mat[0] = vectors[0].X();
                mat[1] = vectors[0].Y();
                mat[2] = vectors[0].Z();
                mat[3] = 0.0;
                mat[4] = vectors[1].X();
                mat[5] = vectors[1].Y();
                mat[6] = vectors[1].Z();
                mat[7] = 0.0;
                mat[8] = vectors[2].X();
                mat[9] = vectors[2].Y();
                mat[10] = vectors[2].Z();
                mat[11] = 0.0;
                mat[12] = vectors[3].X();
                mat[13] = vectors[3].Y();
                mat[14] = vectors[3].Z();
                var fov = camera.fov < 10.0 ? 10.0 : camera.fov>85.0 ? 85.0 : camera.fov;
                mat[15] = Math.sin(fov * Math.PI / 180.0);
                gl.uniformMatrix4fv( location, false, mat );
            }
        });
    }
    // new scene for the fragment shader deffered into the render target ...
    // usefull for allowing to run ray-tracing on a not efficient GPU or with a complex scene
    this.scene2 = new Scene();
    this.scene2.AddShader( shader2 );
        // Objects are defined here ..
    var rectangle2 = new Rectangle( "Rectangle1" , shader2 ) ;
    this.scene2.AddObject( rectangle2 ) ;
    this.scene2.AddCamera( this.rtScene.camera );
};

//
// ExerciseFragmentRT.prototype.reset = function ()
// {
//     this.rtScene.setCamera( new Camera( new Vector(0, -12.5, 5),
//                     					new Vector(0,0,5),
//                     					new Vector(0,0,1),
//                     					this.width,
//                     					this.height,
//                     					45.0 ) );
//     this.update_camera();
// };


ExerciseFragmentRT.prototype.Animate = function( )
{
    this.rtScene.Animate();
};

ExerciseFragmentRT.prototype.Display = function(einfo)
{
    // modify displayed information
    einfo.innerHTML  = ""
    + "time  : "+ this.diff + " ms<BR>"
    + "power : "+ (new Number(this.power).toFixed(1)).toString() + "<BR>"
    + "passes: "+ (new Number(this.passNumber).toFixed(0)).toString() + "<BR>";
};


ExerciseFragmentRT.prototype.Show = function() {
    document.getElementById("menu").display = 'block';
    this.divHTML.style.display = 'block';
};

ExerciseFragmentRT.prototype.Hide = function() {
    this.divHTML.style.display = 'none';
};


ExerciseFragmentRT.prototype.Prepare = function( gl )
{
    this.scene.Prepare(gl);
    this.scene2.Prepare(gl);
};


ExerciseFragmentRT.prototype.Draw = function( gl )
{
    if( this.ReTarget == null ) return ;
    var start = new Date().getMilliseconds();
    this.rtScene.ExportToTextures(gl);
    this.ReTarget.StartDrawing(gl);
    this.scene2.Draw(gl,false);
    this.ReTarget.StopDrawing(gl);
    this.scene.Draw(gl,true);
    gl.finish();
    this.diff = (new Date()).getMilliseconds() - start;
    this.incPassNumber();
};

ExerciseFragmentRT.prototype.reset = function(gl) {
    this.width = Math.ceil(this.scene.getWidth()/this.zoom);
    this.height = Math.ceil(this.scene.getHeight()/this.zoom);
    this.scene2.setWidth( this.width );
    this.scene2.setHeight( this.height );
    this.resetPassNumber();
    if ( this.ReTarget != null ) this.ReTarget.ReleaseAll( gl );
    // Random Numbers
    var random = new Uint32Array(width*height*4);
    var texture = new Float32Array(width*height*4);
	  for(var i=0; i<4*width*height; ++i) {
        random[i] = Math.random()*(0x7FFFFFFF);
        if (random[i] == 0) random[i] = 0x7F0F0F0F;
		    texture[i] = 0.0;
    }
    this.ReTarget = new MultipleRenderingTarget( gl, this.width, this.height, true,
        [
            [gl.RGBA32F , gl.RGBA        , gl.FLOAT       , texture],
            [gl.RGBA32UI, gl.RGBA_INTEGER, gl.UNSIGNED_INT, random ]
        ]
    );
};

// Change dimensions ... can be overloaded
ExerciseFragmentRT.prototype.setDimension = function( width, height )
{
    this.scene.setWidth( width );
    this.scene.setHeight( height );
    this.reset(gl);
};


ExerciseFragmentRT.prototype.setZoom = function( zoom ) {
    if(this.zoom == zoom) return;
    this.zoom = zoom;
    this.reset(gl);
    if( !this.animate ) this.Draw(gl);
};


ExerciseFragmentRT.prototype.StartAnimation = function() {
    this.animate = true;
};
ExerciseFragmentRT.prototype.StopAnimation = function() {
    this.animate = false;
};


ExerciseFragmentRT.prototype.onkeypress = function( event ) {
    var MOVE_STEP = 0.33;

    if(event.key == 'z' || event.key == 'Z'){ // go forward
    	this.rtScene.camera.backAndForward(MOVE_STEP);
    	this.update_camera();
    	return true;
    } else if(event.key == 'q' || event.key == 'Q') { // go left
    	this.rtScene.camera.goLeftOrRight(-MOVE_STEP);
    	this.update_camera();
    	return true;
    } else if(event.key == 's' || event.key == 'S') { // go backward
    	this.rtScene.camera.backAndForward(-MOVE_STEP);
    	this.update_camera();
    	return true;
    } else if(event.key == 'd' || event.key == 'D') { // go right
    	this.rtScene.camera.goLeftOrRight(MOVE_STEP);
    	this.update_camera();
    	return true;
    } else if(event.key ==  'PageUp' || event.key == 'r' || event.key == 'R') { // go up
    	this.rtScene.camera.goUpOrDown(MOVE_STEP);
    	this.update_camera();
    	return true;
    } else if(event.key == 'PageDown' || event.key == 'f' || event.key == 'F') { // go down
    	this.rtScene.camera.goUpOrDown(-MOVE_STEP);
    	this.update_camera();
    	return true;
    }
    return false;
}

ExerciseFragmentRT.prototype.setMouse = function( x, y ) {
    this.clicked = true;
    this.mouseX = x;
    this.mouseY = y;
};

ExerciseFragmentRT.prototype.mouseMove = function( x, y ) {
    if(this.clicked) {
    	var ROTATE_STEP = Math.PI / this.scene.width;
    	this.rtScene.camera.upAndDown( (y - this.mouseY) * ROTATE_STEP );
    	this.mouseY = y;
    	this.rtScene.camera.turnLeftOrRight( (this.mouseX - x) * ROTATE_STEP );
    	this.mouseX = x;
    	this.update_camera();
    }
};

ExerciseFragmentRT.prototype.releaseMouse = function() {
    this.clicked = false;
};


//
ExerciseFragmentRT.prototype.update_camera = function() {
    this.resetPassNumber();
    if( !this.animate ) this.Draw(gl);
};

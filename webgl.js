// OpenGL Canvas
var canvas ;

// OpenGL Context
var gl = null;

// Exercises
var exercises = new Array();

var ticks = 0;
var animate = false;
var width = 2024, height = 1768;
var mouse_x = 512;
var mouse_y = 384;

// objects
var exo = 0;
var einfo = null;

// Init WebGL
function initGL()
{
    einfo = document.getElementById("info");
    canvas = document.getElementById("glCanvas") ;

    if( ! canvas )
    {
  		console.log( "Unable to find canvas" );
  		return ;
    }

    gl = canvas.getContext("webgl2") ;

    if (gl == null)
	     gl = WebGLDebugUtils.makeDebugContext( canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));

    if( ! (gl.getExtension( "EXT_color_buffer_float")
            ||  gl.getExtension( "OES_texture_float" )) ) {
        alert( "No OES_texture_float support for float textures!" );
        //return;
    }
    addEvent( window, 'resize', onWindowResize );
    /*canvas.onmousedown = function(event) {
  		mouse_x = event.clientX-120;
  		mouse_y = canvas.height-event.clientY;
  		exercises[exo].setMouse( mouse_x, mouse_y );
  		if( !animate ) update();
    };
    canvas.onmouseclick = function(event) {
		    exercises[exo].releaseMouse();
    };
    canvas.onmouseup = function(event) {
		    exercises[exo].releaseMouse();
    };
    canvas.onmouseout = function(event) {
		    exercises[exo].releaseMouse();
    };
    canvas.onmousemove = function(event) {
  		if( !exercises[exo].isClicked() ) return;
  		mouse_x = event.clientX-120;
  		mouse_y = canvas.height-event.clientY;
  		//console.log("mousemove: "+mouse_x+","+mouse_y);
  		exercises[exo].mouseMove( mouse_x, mouse_y );
  		if( !animate ) update();
    };*/
    gl.viewportWidth  = canvas.width ;
    gl.viewportHeight = canvas.height ;

    gl.clearColor( 0.0 , 0.0 , 0.0 , 1.0 ) ;
    //gl.disable( gl.DEPTH_TEST ) ;

    // Prepare scene
    prepareScene() ;
    onWindowResize();

    // Start render loop
    update() ;
} ;


var changeExercise = function(num) {
    if( num >= exercises.length ) return ;
    document.getElementById("exo"+exo).className = "button";
    exercises[exo].Hide();
    exercises[exo].StopAnimation();
    exercises[num].Show();
    exercises[num].Reload();
    exercises[num].setDimension( canvas.width, canvas.height );
    exo = num;
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT ) ;
    if( !animate ) {
		    update();
    }
    else {
		    exercises[num].StartAnimation();
    }
    document.getElementById("exo"+exo).className = "button-selected";
    window.onkeypress = function(event) {
		if ( exercises[exo].onkeypress(event) && !animate )
	    	update();
    }
};


// Scene creation
function prepareScene()
{
    // add shaders
    exercises.push( new ExerciseParticleFountain( "Exercise 1", exercises.length, changeExercise, gl, 100000 ) );
    exercises.push( new ExerciseParticles( "Exercise 2", exercises.length, changeExercise, gl, 64, {ground:false,cube:false,rotate:false}, "./Student/gpgpu-particles-1.fs" ) );
    exercises.push( new ExerciseParticles( "Exercise 3", exercises.length, changeExercise, gl, 64, {ground:false,cube:false,rotate:false}, "./Student/gpgpu-particles-2.fs" ) );
    exercises.push( new ExerciseParticles( "Exercise 4", exercises.length, changeExercise, gl, 64, {ground:true,cube:false,rotate:false}, "./Student/gpgpu-particles-3.fs" ) );
    exercises.push( new ExerciseParticles( "Exercise 5", exercises.length, changeExercise, gl, 64, {ground:false,cube:true,rotate:false}, "./Student/gpgpu-particles-4.fs" ) );
    exercises.push( new ExerciseParticles( "Exercise 6", exercises.length, changeExercise, gl, 64, {ground:false,cube:true,rotate:true}, "./Student/gpgpu-particles-5.fs" ) );
    exercises.push( new ExerciseParticles( "Exercise 7", exercises.length, changeExercise, gl, 64, {ground:false,cube:true,rotate:true}, "./Student/gpgpu-particles-6.fs" ) );
    exercises.push( new ExerciseParticles( "Exercise 8", exercises.length, changeExercise, gl, 64, {ground:false,cube:true,rotate:true}, "./Student/gpgpu-particles-7.fs" ) );
    exercises.push( new ExerciseCloth( "Exercise 9",   exercises.length, changeExercise, gl, 256, 256 ) );

    document.getElementById("exo"+exo).className = "button-selected";
    window.onkeypress = function(event){
    	if ( exercises[exo].onkeypress(event) && !animate )
    	    update();
    }

    exercises[exo].Show();
};


/** Render Loop */
function update()
{
    if ( animate ) {
  		// animate objects ...
  		exercises[exo].Animate();
  		requestAnimFrame( update ) ;
    }

    exercises[exo].Display(einfo);
    // Call rendering
    draw() ;
} ;


/** Draw function */
function draw()
{
    exercises[exo].Draw( gl ) ;
};


function startAnimation() {
    animate = !animate;
    if( animate ) {
		exercises[exo].StartAnimation();
		update();
		document.getElementById("animButton").className = "button-selected";
    }
    else {
		exercises[exo].StopAnimation();
		document.getElementById("animButton").className = "button";
    }
};


// resize window ...
var onWindowResize = function( event ) {
    canvas.width = window.innerWidth - 120;
    canvas.height = window.innerHeight;

    width  = canvas.width ;
    height = canvas.height;
    console.log("width = "+width+", height = "+height);

    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';

    for(var i=0; i<exercises.length; ++i) {
		exercises[i].setDimension( width, height );
    }
    if (gl) {
        gl.viewport( 0, 0, width, height );
        if(!animate) update();
    }
};


var addEvent = function(elem, type, eventHandle) {
    if (elem == null || typeof(elem) == 'undefined') return;
    if ( elem.addEventListener ) {
        elem.addEventListener( type, eventHandle, false );
    } else if ( elem.attachEvent ) {
        elem.attachEvent( "on" + type, eventHandle );
    } else {
        elem["on"+type]=eventHandle;
    }
};

// All exercises must inherit from GenericExercise
ExerciseFragment.prototype = new GenericExercise();
ExerciseFragment.prototype.constructor = ExerciseFragment;

// Constructor
function ExerciseFragment( name, number, callback, gl, shaderName ) 
{    
    GenericExercise.call(this, name, number, callback); // mandatory ...

    this.scene = new Scene();
    this.diff = 0;

    // Shaders
    this.shader = new FragmentShader( gl, shaderName ) ;
    this.scene.AddShader( this.shader );

    // Objects are defined here ..
    var rectangle = new Rectangle( "Rectangle1" , this.shader ) ; 
    this.scene.AddObject( rectangle ) ;  

    // add parameters to UI
    this.divHTML = document.createElement("div");
    this.divHTML.id = "exo-param-"+number;
    this.divHTML.style.display = 'none';
    var menu = document.getElementById("menu");
    menu.insertBefore(this.divHTML, document.getElementById("param-bottom"));

    // the parameters are button ... none
};

ExerciseFragment.prototype.onkeypress = function( event ) {
    return false;
};


ExerciseFragment.prototype.Animate = function( ) 
{
    this.scene.Animate();
};

ExerciseFragment.prototype.Display = function(einfo)
{
    // modify displayed information 
    einfo.innerHTML  = this.diff + " ms";
};


ExerciseFragment.prototype.Show = function() {
    this.divHTML.style.display = 'block';
};
ExerciseFragment.prototype.Hide = function() {
    this.divHTML.style.display = 'none';
};


ExerciseFragment.prototype.Prepare = function( gl ) 
{
    this.scene.Prepare(gl);
};


ExerciseFragment.prototype.Draw = function( gl ) 
{
    var start = new Date().getMilliseconds();
    this.scene.Draw(gl);
    gl.flush();
    this.diff = (new Date()).getMilliseconds() - start;
};




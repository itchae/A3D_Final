// All exercises must inherit from GenericExercise
ExerciseParticleFountain.prototype = Object.create( GenericExercise.prototype );
ExerciseParticleFountain.prototype.constructor = ExerciseParticleFountain;

// Constructor
function ExerciseParticleFountain( name, number, callback, gl, nbParticles )
{
    GenericExercise.call(this, name, number, callback); // mandatory ...

    this.diff = 0;
    this.width = 100;
    this.height = 100;
    this.animate = false;
    this.einfo = document.getElementById("info");
    this.numberOfParticles = nbParticles;
    if( this.numberOfParticles > 1000000 ) this.numberOfParticles = 1000000;

    var exercise = this;

    // Final display
    this.scene = new Scene();
    this.cameraAt = new Vector(-40,0,30);
    this.cameraTo = new Vector(0,0,15);
    this.scene.AddCamera(
	     new Camera( this.cameraAt, //eyePos ,
		               this.cameraTo, //centerPos ,
		               new Vector(0,0,1), //up ,
		               512, 512, 60.0, 0.01, 1000.0
		              )
    );
    this.pShader = new ParticlesFountainShader( gl ) ;
    this.scene.AddShader( this.pShader );
    this.scene.AddObject( new ParticlesFountain( "ParticlesFountain", this.numberOfParticles, this.pShader ) );

    var dShader = new DefaultShader(gl);
    var plane = new Plane( "Plane" , dShader, [0.1,.6,.1,1], new Vector(0,0,0), new Vector(0,0,1), 100 ) ;
    this.scene.AddShader( dShader );
    this.scene.AddObject( plane ) ;

    // add parameters to UI
    this.divHTML = document.createElement("div");
    this.divHTML.id = "exo-param-"+number;
    this.divHTML.style.display = 'none';
    document.getElementById("menu").insertBefore(this.divHTML, document.getElementById("param-bottom"));

    this.buttonRestart = this.createButton("Restart", "Restart", function(button){
	     exercise.restart();
    });
    this.divHTML.appendChild( this.buttonRestart );

    this.moreNeeded = 0;
    this.buttonMore = this.createButton("More", "Particles ++", function(button){
	     exercise.moreNeeded++; exercise.generateParticles(gl);
    });
    this.divHTML.appendChild( this.buttonMore );

    this.lessNeeded = 0;
    this.buttonLess = this.createButton("Less", "Particles --", function(button){
	     exercise.lessNeeded++; exercise.generateParticles(gl);
    });
    this.divHTML.appendChild( this.buttonLess );

    this.Prepare(gl);
    this.reset(gl);
};


// ================================================================
ExerciseParticleFountain.prototype.restart = function() {
    this.scene.ticks = 0;
    if( !this.animate ) this.Draw(gl);
};

ExerciseParticleFountain.prototype.generateParticles = function(gl) {
  var nb = this.numberOfParticles;
  while( this.moreNeeded > 0 ) { nb *= 2; this.moreNeeded--; }
  while( this.lessNeeded > 0 ) { nb /= 2; this.lessNeeded--; }
  nb = Math.ceil(nb);
  if( nb > 2000000 ) nb = 2000000;
  if (nb < 10000 ) nb = 10000;
  if (nb != this.numberOfParticles ) {
    this.numberOfParticles = nb;
    var pf =  new ParticlesFountain( "ParticlesFountain", this.numberOfParticles, this.pShader ) ;
    pf.Prepare(gl);
    this.scene.ReplaceObjectByName("ParticlesFountain", pf );
    this.Display(this.einfo);
  }
};


ExerciseParticleFountain.prototype.Animate = function( )
{
    this.scene.Animate();
};

ExerciseParticleFountain.prototype.Display = function(einfo)
{
    einfo.innerHTML  = this.numberOfParticles + " particles";
};


ExerciseParticleFountain.prototype.Show = function() {
    document.getElementById("menu").display = 'block';
    this.divHTML.style.display = 'block';
};

ExerciseParticleFountain.prototype.Hide = function() {
    this.divHTML.style.display = 'none';
};


ExerciseParticleFountain.prototype.Prepare = function( gl )
{
    this.scene.Prepare(gl);
};


ExerciseParticleFountain.prototype.Draw = function( gl )
{
  gl.enable( gl.DEPTH_TEST );
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.disable(gl.BLEND);
  this.scene.Draw(gl,true);
};

 ExerciseParticleFountain.prototype.reset = function(gl) {
    this.width = this.scene.getWidth();
    this.height = this.scene.getHeight();
    this.restart();
};

// Change dimensions ... can be overloaded
ExerciseParticleFountain.prototype.setDimension = function( width, height ) {
    this.scene.setDimension( width, height );
    this.reset(gl);
};


ExerciseParticleFountain.prototype.StartAnimation = function() {
    this.animate = true;
};

ExerciseParticleFountain.prototype.StopAnimation = function() {
    this.animate = false;
};

ExerciseParticleFountain.prototype.onkeypress = function( event ) {
    if ( event.key == 'Up' || event.key == 'z' || event.key == 'Z' ) {
		    exercises[exo].addTranslateXYZ( 0, 1.0/5.0 );
    } else if( event.key == 'Down' || event.key == 's' || event.key == 'S' ) {
		    exercises[exo].addTranslateXYZ( 0, -1.0/5.0 );
    } else if( event.key == 'Left' || event.key == 'q' || event.key == 'Q' ) {
		    exercises[exo].addTranslateXYZ( 1, 1.0/5.0 );
    } else if( event.key == 'Right' || event.key == 'd' || event.key == 'D' ) {
		    exercises[exo].addTranslateXYZ( 1, -1.0/5.0 );
    } else if( event.key == 'a' || event.key == 'A'  ) {
		    exercises[exo].addTranslateXYZ( 2, 1.0/5.0 );
    } else if( event.key == 'e' || event.key == 'E' ) {
		    exercises[exo].addTranslateXYZ( 2, -1.0/5.0 );
    }
    else return false;
    return true;
};

ExerciseParticleFountain.prototype.addTranslateXYZ = function( xyz, val ) {
    this.cameraAt.m[xyz] += val;
    this.cameraTo.m[xyz] += val;
    this.scene.GetActiveCamera().ComputeMatrices();
    // call the postRedisplay() function (in webgl.js)
    if( !animate ) update();
};


//
ExerciseParticleFountain.prototype.update_camera = function() {
    if( !this.animate ) this.Draw(gl);
};

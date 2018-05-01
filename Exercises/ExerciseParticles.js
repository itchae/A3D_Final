// All exercises must inherit from GenericExercise
ExerciseParticles.prototype = Object.create( GenericExercise.prototype );
ExerciseParticles.prototype.constructor = ExerciseParticles;

// Constructor
function ExerciseParticles( name, number, callback, gl, nbParticles, options, fShader )
{
    GenericExercise.call(this, name, number, callback); // mandatory ...

    this.diff = 0;
    this.width = 100;
    this.height = 100;
    this.animate = false;
    this.einfo = document.getElementById("info");
    this.numberOfParticles = nbParticles;
    this.options = options; // { ground:true/false, cube:true/false, rotating:true/false }
    //console.log("options: "+this.options);
    this.fShader = fShader; // fragment shader filename for computations
    this.boxSize = 4.0;
    this.deltaT = 0.01 / 80.0; // in seconds
    this.lambda = options.ground ? 0.4 : 0.1;
    this.rotPhi = 0.0;
    this.groundZ = -4.0;
    this.bigBox1 = null;
    this.bigBox2 = null;
    this.elasticity = 0.7; // less than 1, greater than 0

    var exercise = this;

    /*
    We use two shaders:
    - First one is used to display a scene containing spheres for
    simulating small particles, and also some geometry. Sphere are
    scaled and translated according to information stored in
    ModelViewMatrix for the first, and a texture for the second.
    - Second one does the physical calculation, but into a
    MultipleRenderingTarget. Then, the resulting state vector is
    automatically stored into others textures, that becomes the
    entry of the first shader (texture Position). A ping/pong
    mechanism is used in order do the simulation ;-)
    */

    // One rendering target
    this.ReTarget = null;

    // Final display
    this.sceneGEO = new Scene();
    this.cameraAt = new Vector(-8,0, options.ground ? this.groundZ+0.025 : 0);
    this.cameraTo = new Vector( 0,0, options.ground ? this.groundZ+0.025 : 0);
    this.camera = new Camera( this.cameraAt, //eyePos ,
      this.cameraTo, //centerPos ,
      new Vector(0,0,1), //up ,
      this.width, this.height, 45.0, 0.01, 1000.0
    );
    this.sceneGEO.AddCamera( this.camera );
    this.sceneGEOcube = new Scene();
    this.sceneGEOcube.AddCamera( this.camera );

    // add here the particles ...
    // and the ground
    this.planeShader = new DefaultShader(gl);
    this.sceneGEO.AddShader( this.planeShader );
    this.spheresShader = new ParticleSphereShader(gl);
    this.sceneGEO.AddShader( this.spheresShader );

    // and the (rotating) box
    this.boxShader1 = new BoxShader1( gl );
    this.sceneGEO.AddShader( this.boxShader1 );
    this.boxShader2 = new BoxShader2( gl );
    this.sceneGEOcube.AddShader( this.boxShader2 );

    // add parameters to UI
    this.divHTML = document.createElement("div");
    this.divHTML.id = "exo-param-"+number;
    this.divHTML.style.display = 'none';
    document.getElementById("menu").insertBefore(this.divHTML, document.getElementById("param-bottom"));

    this.divHTML.appendChild(
    	this.createButton("moreP", "++ particles", function(button) {
        if( exercise.numberOfParticles >= exercise.particles.maxSize )
          return;
        exercise.numberOfParticles *= 2;
        if( this.numberOfParticles > exercise.particles.maxSize )
          exercise.numberOfParticles = exercise.particles.maxSize;
  	    exercise.reset(gl);
  	    if(!exercise.animate) update();
    	})
    );
    this.divHTML.appendChild(
    	this.createButton("lessP", "-- particles", function(button) {
        if( exercise.numberOfParticles <= exercise.particles.minSize )
          return;
        exercise.numberOfParticles /= 2;
        if( exercise.numberOfParticles < exercise.particles.minSize )
          exercise.numberOfParticles = exercise.particles.minSize;
  	    exercise.reset(gl);
  	    if(!exercise.animate) update();
    	})
    );
    this.divHTML.appendChild(
    	this.createButton("moreL", "++ lambda", function(button) {
        if( exercise.lambda >= 10.0 )
          return;
        exercise.lambda *= 2;
        if( exercise.lambda >= 10.0 )
          exercise.lambda = 10.0;
  	    if(!exercise.animate) update();
    	})
    );
    this.divHTML.appendChild(
    	this.createButton("lessL", "-- lambda", function(button) {
        if( exercise.lambda <= 0.001 )
          return;
        exercise.lambda -= 0.1;
        if( exercise.lambda < 0.001 )
          exercise.lambda = 0.001;
  	    if(!exercise.animate) update();
    	})
    );
    if( options.ground || options.cube ) {
      this.divHTML.appendChild(
      	this.createButton("moreD", "++ elasticity", function(button) {
          if( exercise.elasticity >= 1.0 )
            return;
          exercise.elasticity += 0.1;
          if( exercise.elasticity >= 1.0 )
            exercise.elasticity = 1.0;
    	    if(!exercise.animate) update();
      	})
      );
      this.divHTML.appendChild(
      	this.createButton("lessD", "-- elasticity", function(button) {
          if( exercise.elasticity <= 0.0001 )
            return;
          exercise.elasticity /= 2;
          if( exercise.elasticity < 0.0001 )
            exercise.elasticity = 0.0001;
    	    if(!exercise.animate) update();
      	})
      );
    }
    if( options.cube ) {
      this.divHTML.appendChild(
      	this.createButton("moreGS", "++ grid", function(button) {
          if( exercise.boxSize >= 8.0 )
            return;
          exercise.boxSize *= 1.25;
          if( exercise.boxSize >= 8.0 )
            exercise.boxSize = 8.0;
          exercise.reset(gl);
          if( this.bigBox1 != null )
            this.bigBox1.SetMatrix( new Matrix().Scale(this.boxSize) );
          if( this.bigBox2 != null )
            this.bigBox2.SetMatrix( new Matrix().Scale(this.boxSize) );
    	    if(!exercise.animate) update();
      	})
      );
      this.divHTML.appendChild(
      	this.createButton("lessG", "-- grid", function(button) {
          if( exercise.boxSize <= 2.0 )
            return;
          exercise.boxSize /= 1.25;
          if( exercise.boxSize < 2.0 )
            exercise.boxSize = 2.0;
    	    exercise.reset(gl);
          if( this.bigBox1 != null )
            this.bigBox1.SetMatrix( new Matrix().Scale(this.boxSize) );
          if( this.bigBox2 != null )
            this.bigBox2.SetMatrix( new Matrix().Scale(this.boxSize) );
    	    if(!exercise.animate) update();
      	})
      );
    }
    this.reset(gl);
};



// Reload an exercise (UI) : can (should?) be overloaded
ExerciseParticles.prototype.Reload = function()
{
    this.sceneGEO.Reload();
    this.sceneGEOcube.Reload();
};


// ================================================================
ExerciseParticles.prototype.rebuild_GPGPU = function(gl)
{
  if ( this.ReTarget != null ) this.ReTarget.ReleaseAll( gl );

  var exercise = this;
  // first scene, a single rectangle to do calculation (simulate the ComputeShader)
  this.sceneGPGPU = new Scene();
  this.shaderGPGPU = new FragmentShader( gl, this.fShader );
  this.particles = new ParticlesBuffer(gl);
  this.sceneGPGPU.AddCamera(
    // useless, except the viewport dimension !!
    new Camera( new Vector(0,1,0), //eyePos ,
	              new Vector(0,0,0), //centerPos ,
	              new Vector(0,1,0), //up ,
	              this.particles.width, this.particles.height, 60.0, 0.01, 1000.0
	             )
  );

  this.shaderGPGPU.addUniform(
    function(gl) {
      var location = exercise.shaderGPGPU.GetUniformLocation( "uTexPositionRadius" );
      if( location != null && exercise.ReTarget != null ) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, exercise.ReTarget.GetBackBuffers()[0]);
          gl.uniform1i(location, 0);
      }
      else console.log("cannot find uTexPositionRadius");
      location = exercise.shaderGPGPU.GetUniformLocation( "uTexVelocityMass" );
      if( location != null && exercise.ReTarget != null ) {
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, exercise.ReTarget.GetBackBuffers()[1]);
          gl.uniform1i( location, 1);
      }
      else console.log("cannot find uTexVelocityMass");
      location = exercise.shaderGPGPU.GetUniformLocation( "uNumberOfParticles" );
      if( location != null ) {
        gl.uniform1i( location, exercise.numberOfParticles );
      }
      else console.log("cannot find uNumberOfParticles ...");
      location = exercise.shaderGPGPU.GetUniformLocation( "uWidth" );
      if( location != null ) { gl.uniform1i( location, exercise.particles.width ); }
      else console.log("cannot find uWidth");
      location = exercise.shaderGPGPU.GetUniformLocation( "uHeight" );
      if( location != null ) { gl.uniform1i( location, exercise.particles.height ); }
      else console.log("cannot find uHeight");
      location = exercise.shaderGPGPU.GetUniformLocation( "uDeltaT" );
      if( location != null ) { gl.uniform1f( location, exercise.deltaT ); }
      else console.log("cannot find uDeltaT");
      location = exercise.shaderGPGPU.GetUniformLocation( "uLambda" );
      if( location != null ) { gl.uniform1f( location, exercise.lambda ); }
      //else console.log("cannot find uLambda");
      if( exercise.options.cube ) {
        location = exercise.shaderGPGPU.GetUniformLocation( "uBoxSize" );
        if( location != null ) { gl.uniform1f( location, exercise.boxSize ); }
        else console.log("cannot find uBoxSize");
      }
      if( exercise.options.rotate ) {
        location = exercise.shaderGPGPU.GetUniformLocation( "uRotationAngle" );
        if( location != null ) { gl.uniform1f( location, exercise.rotPhi ); }
        else console.log("cannot find uRotationAngle");
      }
      if( exercise.options.ground ) {
        location = exercise.shaderGPGPU.GetUniformLocation( "uGroundZ" );
        if( location != null ) { gl.uniform1f( location, exercise.groundZ ); }
        else console.log("cannot find uGroundZ");
      }
      if (exercise.options.ground||exercise.options.cube) {
        location = exercise.shaderGPGPU.GetUniformLocation( "uElasticity" );
        if( location != null ) { gl.uniform1f( location, exercise.elasticity ); }
        else console.log("cannot find uElasticity");
      }
    }
  );

  this.spheresShader.addUniform(
    function(gl) {
      var location = exercise.spheresShader.GetUniformLocation( "uTexPositionRadius" );
      if( location != null && exercise.ReTarget != null ) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, exercise.ReTarget.GetFrontBuffers()[0]);
          gl.uniform1i(location, 0);
      }
      else console.log("cannot find uTexPositionRadius ...");
      location = exercise.spheresShader.GetUniformLocation( "uWidth" );
      if( location != null ) gl.uniform1i( location, exercise.particles.width );
      else console.log("cannot find uWidth");
      location = exercise.spheresShader.GetUniformLocation( "uHeight" );
      if( location != null ) gl.uniform1i( location, exercise.particles.height );
      //else console.log("cannot find uHeight");
    }
  );

  this.sceneGPGPU.AddShader( this.shaderGPGPU );
  this.sceneGPGPU.AddObject( new Rectangle( "Rectangle1" , this.shaderGPGPU ) ) ;
  // that's all for GP-GPU
};


ExerciseParticles.prototype.Animate = function( )
{
  this.rotPhi = (this.sceneGEOcube.ticks+1.0)*Math.PI*0.001;
  var start = Date.now();
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.disable(gl.BLEND);
  for(var i=0; i<80; ++i) {
    this.ReTarget.StartDrawing(gl);
    this.sceneGPGPU.Draw(gl,true);
    this.ReTarget.StopDrawing(gl);
  }
  gl.finish();
  this.sceneGEO.Animate();
  this.sceneGEOcube.Animate();
  gl.finish();
  this.diff = Date.now() - start;
};

ExerciseParticles.prototype.Display = function(einfo)
{
    // modify displayed information
    einfo.innerHTML  = ""
    + "time  : "+ this.diff + " ms<BR>"
    + this.numberOfParticles + " particles<BR>"
    + "Lambda: "+ this.lambda + "<BR>"
    + "Elasticity: "+ this.elasticity + "<BR>"
    + "BoxSize: "+ this.boxSize + "<BR>"
    ;
};


ExerciseParticles.prototype.Show = function() {
    document.getElementById("menu").display = 'block';
    this.divHTML.style.display = 'block';
};

ExerciseParticles.prototype.Hide = function() {
    this.divHTML.style.display = 'none';
};


ExerciseParticles.prototype.Prepare = function( gl )
{
    this.sceneGEO.Prepare(gl);
    this.sceneGEOcube.Prepare(gl);
    this.sceneGPGPU.Prepare(gl);
};


ExerciseParticles.prototype.Draw = function( gl )
{
    if( this.ReTarget == null ) return ;
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    this.sceneGEO.Draw(gl,true);
    if( this.options.cube ) {
      gl.enable(gl.BLEND);
      gl.depthFunc(gl.LESS);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      this.sceneGEOcube.Draw(gl,false);
      gl.disable(gl.BLEND);
    }
    gl.finish();
};

ExerciseParticles.prototype.reset = function(gl)
{
  this.width = this.sceneGEO.getWidth();
  this.height = this.sceneGEO.getHeight();
  this.rebuild(gl);
};


ExerciseParticles.prototype.Find_Cube_Root = function (input)
{
  var t=0;
  var n = input;
  if (n < 0) {n=-n; t=1;};
  var m = Math.sqrt (n);
  var ctr = 1
  while (ctr < 101) {
  	var m = m*n;
  	var m = Math.sqrt (Math.sqrt(m));
  	ctr++;
  }
  if (t==1) {m=-m;};
  return m;//Cube Root Value
};

ExerciseParticles.prototype.rebuild_Box = function(gl)
{
  if( this.options.cube ) {
    if( this.bigBox1 != null )
      this.sceneGEO.RemoveObjectByName("box1", true);
    if( this.bigBox2 != null )
      this.sceneGEOcube.RemoveObjectByName("box2", true);

    this.bigBox1 = new Box( "box1", this.boxShader1, [0.8,0.4,0.4,1], // A is small
		                         new Vector(0.0,0.0,0.0) );
    this.bigBox2 = new Box( "box2", this.boxShader2, [0.5,0.5,0.5,0.2], // A is small
     		                     new Vector(0.0,0.0,0.0) );

    this.bigBox1.SetMatrix( new Matrix().Scale(this.boxSize) );
    this.bigBox2.SetMatrix( new Matrix().Scale(this.boxSize) );
    this.sceneGEO.AddObject( this.bigBox1 );
    this.sceneGEOcube.AddObject( this.bigBox2 );
    var exercise = this;
    if( this.options.rotate ) {
      var exercise = this;
      this.bigBox1.SetAnimate( function(tick,obj) {
        obj.SetMatrix( new Matrix().Scale(exercise.boxSize).RotateX(exercise.rotPhi)) ;
      } );
      this.bigBox2.SetAnimate( function(tick,obj) {
        obj.SetMatrix( new Matrix().Scale(exercise.boxSize).RotateX(exercise.rotPhi) );
      } );
    }
  }
};


ExerciseParticles.prototype.rebuild = function(gl)
{
  prevTime = Date.now();

  this.sceneGEO.RemoveAllObjects();
  this.sceneGEOcube.RemoveAllObjects();

  this.rebuild_GPGPU(gl);

  var sphereMinWeight = 0.00125,
      sphereMaxWeight = 0.005;

  if( this.options.ground ) {
    var plane = new Plane( "Plane" , this.planeShader,
                           [0.1,.6,.1,1], new Vector(0,0,this.groundZ),
                           new Vector(0,0,1), 100 ) ;
    this.sceneGEO.AddObject( plane ) ;
  }
  else if ( this.options.cube ) {
    this.rebuild_Box(gl);
  }

  // creates set of random spheres
  for(var i=0; i<this.numberOfParticles; ++i) {
    var position = [
      (1.0-2.0*Math.random()),
      (1.0-2.0*Math.random()),
      (1.0-2.0*Math.random()) ];
	  var velocity = [
      (1.0-2.0*Math.random())*2.0,
      (1.0-2.0*Math.random())*2.0,
	    10.0*Math.random() ];
    var color = [
  	  0.2+0.8*Math.random(),
  	  0.2+0.8*Math.random(),
  	  0.2+0.8*Math.random(),
      1.0 ];
  	var mass = sphereMinWeight + (sphereMaxWeight - sphereMinWeight)*Math.random();
  	var radius = 0.0 + this.Find_Cube_Root( mass );

  	var sphere = new Sphere( "sphere"+i,
  				 this.spheresShader,
  				 8, 8,
  				 color,
           i
  	);
    //sphere.SetMatrix( new Matrix().Scale(radius).Translate(new Vector(position[0], position[1], position[2])) );
  	this.sceneGEO.AddObject( sphere );
    this.particles.AddAParticle( position, radius, velocity, mass );
  }

  this.sceneGPGPU.setDimension(this.particles.width, this.particles.height);
  this.Prepare( gl ) ;

  this.ReTarget = new MultipleRenderingTarget(
    gl, this.particles.width, this.particles.height,
    true, // double buffer
    [
      [ gl.RGBA32F, gl.RGBA, gl.FLOAT, this.particles.getPositionRadius() ],
      [ gl.RGBA32F, gl.RGBA, gl.FLOAT, this.particles.getVelocityMass() ]
    ]
  );
};

// Change dimensions ... can be overloaded
ExerciseParticles.prototype.setDimension = function( width, height )
{
    this.sceneGEO.setDimension( width, height );
    this.sceneGEOcube.setDimension( width, height );
    this.reset(gl);
};


ExerciseParticles.prototype.StartAnimation = function() {
    this.animate = true;
};
ExerciseParticles.prototype.StopAnimation = function() {
    this.animate = false;
};


ExerciseParticles.prototype.onkeypress = function( event ) {
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
}


ExerciseParticles.prototype.addTranslateXYZ = function( xyz, val ) {
    this.cameraAt.m[xyz] += val;
    this.cameraTo.m[xyz] += val;
    this.sceneGEO.GetActiveCamera().ComputeMatrices();
    this.sceneGEOcube.GetActiveCamera().ComputeMatrices();
    // call the postRedisplay() function (in webgl.js)
    if( !animate ) update();
};

//
ExerciseParticles.prototype.update_camera = function() {
    if( !this.animate ) this.Draw(gl);
};

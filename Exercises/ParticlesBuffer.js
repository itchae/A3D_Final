function ParticlesBuffer( gl )
{
  this.numberOfParticles = 0;
  this.positions = [];
  this.velocitys = [];
  this.masses = [];
  this.radiuses = [];

  // at most 2^10 particles (but its a huge number considering spheres drawing)
  this.width = 32;
  this.height = 32;
  this.minSize = 4;
  this.maxSize = this.width*this.height;

  this.updated = false;
};

ParticlesBuffer.prototype.AddAParticle = function (p, r, v, m) {
  if (this.numberOfParticles >= this.width*this.height)
  {
    console.log("too much particles ...");
    return;
  }
  this.positions[this.numberOfParticles] = [p[0], p[1], p[2]];
  this.velocitys[this.numberOfParticles] = [v[0], v[1], v[2]];
  this.masses[this.numberOfParticles] = m;
  this.radiuses[this.numberOfParticles] = r;
  this.numberOfParticles++;
  this.updated = false;
};


ParticlesBuffer.prototype.getNumberOfParticles = function() {
    return this.numberOfParticles;
};


ParticlesBuffer.prototype.getPositionRadius = function() {
    var result = new Float32Array( this.width*this.height*4 );
		// push the particles
		for(var i=0; i<this.numberOfParticles; ++i) {
		    var pos = this.positions[i];
		    var rad = this.radiuses[i];
        result[4*i + 0] = pos[0];
        result[4*i + 1] = pos[1];
        result[4*i + 2] = pos[2];
        result[4*i + 3] = rad;
		}
    //console.log("PR = "+result);
    return result;
};


ParticlesBuffer.prototype.getVelocityMass = function() {
    var result = new Float32Array( this.width*this.height*4 );
		for(var i=0; i<this.numberOfParticles; ++i) {
		    var vel = this.velocitys[i];
		    var mas = this.masses[i];
        result[4*i+0] = vel[0];
        result[4*i+1] = vel[1];
        result[4*i+2] = vel[2];
        result[4*i+3] = mas;
		}
    //console.log("VM = "+result);
    return result;
};


ParticlesBuffer.prototype.writeTexture = function(gl, id, width, height, input) {
    // Make sure that texture is bound.
    gl.bindTexture(gl.TEXTURE_2D, id);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, input);
    gl.finish();
};


ParticlesBuffer.prototype.ExportToTextures = function(gl, texPR, texVM) {
	if (this.updated) return;
	this.writeTexture(gl, texPR, this.width, this.height, this.getPositionRadius());
	this.writeTexture(gl, texVM, this.width, this.height, this.getVelocityMass());
	this.updated = true;
};

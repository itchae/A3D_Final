/*
 * Perspective camera class
 *
 */
function Camera( eyePos , centerPos , up , width , height , fov , near , far )
{
	this.eyePos = eyePos ;
	//this.centerPos = centerPos ;
  this.dir = new Vector(centerPos).Sub(eyePos).Normalize();
	var U = new Vector(0,0,1); // ignore up
  this.right = this.dir.Cross(U).Normalize();
  this.up = this.right.Cross(this.dir).Normalize();
	this.width = width ;
	this.height = height ;
	this.fov = fov || 45 ;
	this.near = near || 0.1 ;
	this.far = far || 1000.0 ;

	this.view_matrix = null ;
	this.projection_matrix = null ;

	this.ComputeMatrices() ;
};


/**
 * Compute View and Projection Matrices
 */
Camera.prototype.ComputeMatrices = function( )
{
    this.view_matrix = new Matrix( this.eyePos ,
		                               new Vector(this.eyePos).Add(this.dir),
		                               this.up ) ;

    this.projection_matrix = new Matrix( Matrix.prototype.deg_to_rad(this.fov) ,
                    					 					 this.width / this.height , 
                    					 					 this.near , this.far ) ;
};

/**
 * Get View Matrix
 */
Camera.prototype.GetViewMatrix = function()
{
    return this.view_matrix ;
};

/**
 * Get Projection Matrix
 */
Camera.prototype.GetProjectionMatrix = function()
{
    return this.projection_matrix ;
};

/**
* Set Current Field Of View
*/
Camera.prototype.SetFov = function( aFov )
{
    this.fov = aFov ;
    this.ComputeMatrices() ;
};


/**
* Export to ray-tracer
*/
Camera.prototype.Export = function()
{
    var result = new Float32Array(13);
    // eye position
    result[0] = this.eyePos.m[0];
    result[1] = this.eyePos.m[1];
    result[2] = this.eyePos.m[2];
    // target
    result[3] = this.dir.X();
    result[4] = this.dir.Y();
    result[5] = this.dir.Z();
    // right
    result[6] = this.right.X();
    result[7] = this.right.Y();
    result[8] = this.right.Z();
    // up
    result[9]  = this.up.X();
    result[10] = this.up.Y();
    result[11] = this.up.Z();
    // fov: set the length of up (and so right, after aspect ratio multiplication)
    result[12] = 2.0*Math.tan(this.fov*Math.PI/180.0); // deg to rad
    // that's all
    //console.log("camera exports is: "); console.log(result);
    return result;
} ;


/* look up and down ... */
Camera.prototype.upAndDown = function( angle ) {
    var theta = Math.acos(this.dir.Z());
    if( theta+angle >= Math.PI*0.95 ) return;
    if (theta+angle <= Math.PI*0.05 ) return;
    this.dir = this.dir.rotate(this.right, angle).Normalize();
    //console.log("upAndDown -> "+this.dir.toString());
} ;

/* turn the head ... */
Camera.prototype.turnLeftOrRight = function( angle ) {
    var U = new Vector(0,0,1);
    this.right = this.right.rotate(U,angle).Normalize();
    this.dir = this.dir.rotate(U,angle).Normalize();
    //console.log("turnLeftOrRight -> "+this.right.toString()+" and "+this.dir.toString());
} ;

/* move backward and forward */
Camera.prototype.backAndForward = function( step ) {
    var dir = new Vector(this.dir).Mul(step);
    this.eyePos.Add(dir);
};

/* move left or right */
Camera.prototype.goLeftOrRight = function( step ) {
    var right = new Vector(this.right).Mul(step);
    this.eyePos.Add(right);
};

/* move up or down */
Camera.prototype.goUpOrDown = function( step ) {
    this.eyePos.m[2] += step ;
};

Camera.prototype.getVectors = function() {
    return [
        this.eyePos,
        this.dir,
        this.right.Cross(this.dir).Normalize(),
        this.right
    ];
}

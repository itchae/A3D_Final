/* Point with data ...
 * Point lies in 3-dimensional space.
 * Associated data can be a color, a normal, a color and a normal, 
 * or whatever you want ...
 */

/* constructor */
function PointData() {
    if( arguments.length > 2 ) {
	this.n = arguments.length;
	this.m = new Array( this.n );
	for(var i=0; i<this.n; i++) {
	    this.m[i] = arguments[i];
	}
    }
    else if(( arguments.length == 1 ) && (arguments[0] instanceof PointData )) {
	this.n = arguments[0].n;
	this.m = new Array( this.n );
	for(var i=0; i<this.n; i++) {
	    this.m[i] = arguments[0].m[i];
	}
    }
    else if (arguments.length == 1 && typeof(arguments[0]) == "number") {
	this.n = arguments[0];
	this.m = new Array( this.n );
	for(var i=0; i<this.n; i++) {
	    this.m[i] = 0.0;
	}
    }
    else if (arguments.length == 1 && (arguments[0] instanceof Array)) {
	this.n = arguments[0].length;
	this.m = new Array( this.n );
	for(var i=0; i<this.n; ++i) {
	    this.m[i] = arguments[0][i];
	}
    }
    else throw new Error("PointData constructor call! ("+arguments+")");
};

/* object definition */
PointData.prototype.constructor = PointData;

/* size of the pointdata */
PointData.prototype.GetSize = function() {
    return this.n;
};

/* addition of two points */
PointData.prototype.Add = function( that ) {
    for(var i=0; i<this.n; ++i) this.m[i] += that.m[i];
    return this;
};

/* addition of a scaled point */
PointData.prototype.AddScale = function( s, that ) {
    for(var i=0; i<this.n; ++i) this.m[i] += s*that.m[i];
    return this;
};

/* subtraction of two points */
PointData.prototype.Sub = function( that ) {
    for(var i=0; i<this.n; ++i) this.m[i] -= that.m[i];
    return this;
};

/* multiplication by a scalar */
PointData.prototype.Mul = function( that ) {
    for(var i=0; i<this.n; ++i) this.m[i] *= that;
    return this;
};

/* normalization */
PointData.prototype.Normalize = function() {
    var l = 0.0;
    for(var i=0; i<this.n; ++i) l += this.m[i]*this.m[i];
    if( l==0 ) return this;
    l = 1.0 / Math.sqrt( l );
    for(var i=0; i<this.n; ++i) this.m[i] *= l;
    return this;
}

/* linear interpolation: t the interpolation factor, that the second point */
PointData.prototype.Lerp = function( t, that ) {
    for(var i=0; i<this.n; ++i) {
	this.m[i] *= (1.0 - t);
	this.m[i] += t*that.m[i];
    }
    return this;
}  

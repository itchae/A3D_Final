// texture file is loaded ...
var handleLoadedTexture = function( texture ) {
    texture.loaded = 1;
} ; 

// Texture's constructor
function Texture( gl, file ) 
{
    this.texture = null;
    if( gl != null ) 
	this.set( gl, file );
};

// binder
Texture.prototype.bind = function( gl, location ) {
    if( this.texture.loaded == 1 ) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.texture );
	if( this.texture.image != null )
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, 
			  gl.UNSIGNED_BYTE, this.texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);	
	gl.bindTexture(gl.TEXTURE_2D, null); // unbind
	this.texture.loaded = 2;
    }
    if( this.texture.loaded == 2 ) 
    {
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.texture);
	gl.uniform1i( location, 0);
    }
};


Texture.prototype.set = function( gl, textureName ) {
    this.reset();
    this.texture = gl.createTexture();
    this.texture.image = null;
    if( textureName != null ) {
	this.texture.loaded = 0;
	this.texture.image = new Image();
	this.texture.image.onloadend = 
	    (function (texture) {handleLoadedTexture( texture );})(this.texture);
	this.texture.image.src = textureName;
    }
    else 
	this.texture.loaded = 1;
};


Texture.prototype.reset = function() {
    if (this.texture != null)
	gl.deleteTexture( this.texture );
};


Texture.prototype.maj = function(gl, width, height, buffer) {
    if( this.texture.image != null ) 
	return;
    try {
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 
		      width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, 
		      buffer);
    }catch(e) {
	console.log("Texture.maj raises an exception ...");
	console.log(e);
	console.log("buffer is "+buffer);
    }
};

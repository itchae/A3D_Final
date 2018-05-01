// Video inherits from Texture ...
Video.prototype = new Texture();
Video.prototype.constructor = Video ;


function Video( gl, file ) 
{
    Texture.call(this, null, null); // mandatory ...
    
    this.element = document.getElementById("video");
    this.element.preload = "auto";
    this.element.loop = true;
    this.element.crossOrigin = "anonymous";
    this.ready = false;
    var video = this;
    this.element.addEventListener("canplaythrough", function() { video.ready = true; video.loaded = 1; }, true);
    this.element.src = file;
    this.loaded = 0;
};


Video.prototype.isLoaded = function() {
    return this.ready;
};


Video.prototype.Start = function() {
    if( this.ready && !this.started ) {
	this.started = true;
	this.element.play();
    }
};


Video.prototype.Stop = function() {
    if( this.ready && this.started ) {
	this.started = false;
	this.element.pause();
    }
};


Video.prototype.bind = function( gl, location ) {
    if( this.loaded == 1 ) {
	this.texture = gl.createTexture();
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.texture );
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.element);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);	
	gl.bindTexture(gl.TEXTURE_2D, null); // unbind
	this.loaded = 2;
    }
    if( this.loaded == 2 ) 
    {
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.texture);
	gl.uniform1i( location, 0);
    }
};


Video.prototype.Set = function(gl) {
    if( this.loaded == 2 ) {
	gl.deleteTexture( this.texture ) ;
    }
    this.loaded = 1;
};

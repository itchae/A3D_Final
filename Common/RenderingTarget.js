function RenderingTarget( gl, width, height ) 
{
    // resultat ... d'abord le frameBuffer
    this.rttFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.rttFramebuffer);
    this.rttFramebuffer.width = width;
    this.rttFramebuffer.height = height;

    // ensuite la texture 
    this.rttTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.rttTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );//gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );//gl.NEAREST);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);	
	var data = new Uint32Array(4*width*height);
	for(var i=0;i<4*width*height; ++i)
		data[i] = 0;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0,
		  gl.RGBA, gl.UNSIGNED_BYTE, data);

    // Enfin, le "depth" render buffer ...
    this.renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.rttTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);

    // on supprime les liaisons (sont-elles dangereuses ?).
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

// retourne la texture 
RenderingTarget.prototype.GetTexture = function()
{
    return this.rttTexture;
};

// start drawing (in this rendering target) ...
RenderingTarget.prototype.StartDrawing = function( gl ) 
{
    // on rend dans le frameBuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.rttFramebuffer);
};

// stop drawing (in this rendering target) ...
RenderingTarget.prototype.StopDrawing = function( gl )
{
    // on remet le comportement normal (rendu dans le canvas)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);    
};

RenderingTarget.prototype.ReleaseAll = function(gl) 
{ 
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);    
    gl.deleteRenderbuffer( this.renderbuffer );
    gl.deleteTexture( this.rttTexture );
    gl.deleteFramebuffer( this.rttFramebuffer );
};

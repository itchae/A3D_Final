/*
 Handles a multiple rendering target, with simple or double buffers.
 Take as fourth parameter a boolean true for double buffering.
 Take as fifth parameter an array of triple that describe the buffer, with:
 [ internalformat, format, type, pixels ].
*/
function MultipleRenderingTarget( gl, width, height, double, bufferParams )
{
    // resultat ... d'abord le frameBuffer
    this.rttFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.rttFramebuffer);
    this.rttFramebuffer.width = width;
    this.rttFramebuffer.height = height;

    // ensuite les textures de couleurs
    this.nbBuffers = bufferParams.length;
    this.doubleBuffer = double ? 2 : 1;
    this.rttTexture = new Array(this.doubleBuffer);
    for(var i=0; i<this.doubleBuffer; ++i) {
        var buffers = new Array(this.nbBuffers);
        for(var b=0; b<this.nbBuffers; ++b) {
            buffers[b] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, buffers[b]);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, bufferParams[b][0], width, height, 0,
                          bufferParams[b][1], bufferParams[b][2], new Float32Array(bufferParams[b][3]));
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        this.rttTexture[i] = buffers;
    }
    // Enfin, le "depth" render buffer ...
    this.renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);

    // on supprime les liaisons (sont-elles dangereuses ?).
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.pass = 1;
};

// Returns front buffer (where drawing is made)
MultipleRenderingTarget.prototype.GetFrontBuffers = function() {
    return this.rttTexture[this.pass];
};
// Returns back buffer (previous drawing)
MultipleRenderingTarget.prototype.GetBackBuffers = function() {
    return this.rttTexture[(this.pass + 1) % 2];
}

// start drawing (in this rendering target) ...
MultipleRenderingTarget.prototype.StartDrawing = function( gl )
{
    // on rend dans le frameBuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.rttFramebuffer);
    this.pass = (this.pass + 1 ) % 2;
    var drawArray = new Array(this.nbBuffers);
    for(var i=0; i<this.nbBuffers; ++i) {
        drawArray[i] = gl.COLOR_ATTACHMENT0+i;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, drawArray[i], gl.TEXTURE_2D, this.rttTexture[this.pass][i], 0);
    }
    //gl.clearBufferfv(gl.COLOR, 0, [ 0.0, 0.0, 0.0, 0.0 ]);
    gl.clearBufferfi(gl.DEPTH_STENCIL, 0, 0.0, 0);
    gl.drawBuffers( drawArray );
};

// stop drawing (in this rendering target) ...
MultipleRenderingTarget.prototype.StopDrawing = function( gl )
{
    // on remet le comportement normal (rendu dans le canvas)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

MultipleRenderingTarget.prototype.ReleaseAll = function(gl)
{
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteRenderbuffer( this.renderbuffer );
    for(var i=0; i<this.doubleBuffer; ++i) {
        for (var j=0; j<this.nbBuffers; ++j) {
            gl.deleteTexture( this.rttTexture[i][j] );
        }
    }
    gl.deleteFramebuffer( this.rttFramebuffer );
};

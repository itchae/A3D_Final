#version 300 es
// sp�cifie la qualit� des calculs demand�es
precision highp float ;
precision highp int ;

in vec4 vColor;

//layout(location = 0)
out vec4 color;

// main function
void main(void)
{
  color = vColor;
}

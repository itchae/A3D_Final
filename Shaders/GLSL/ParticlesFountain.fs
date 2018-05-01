#version 300 es
// spécifie la qualité des calculs demandées
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

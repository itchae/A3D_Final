#version 300 es

precision highp float ;
precision highp int ;

uniform highp sampler2D uTexPositionRadius;
uniform highp sampler2D uTexVelocityMass;

uniform int uWidth;
uniform int uHeight;
uniform int uNumberOfParticles;
uniform float uDeltaT;
uniform float uLambda; // exercise 2 and after
uniform float uGroundZ; // only for exercise 3
uniform float uBoxSize; // exercise 4 and after
uniform float uRotationAngle; // exercise 5 and after

smooth in vec2 vCoord;

// ouput: two textures
layout(location = 0) out vec4 oPositionRadius;
layout(location = 1) out vec4 oVelocityMass;

// main function
void main(void)
{
  // vCoord is in [0,1] ... we must enlarge it
  vec2 dim = vec2(float(uWidth),float(uHeight));
  vec2 coord = dim*vCoord-vec2(0.5);
  // verify we are considering a particle ...
  if( int(coord.x) + uWidth*int(coord.y) < uNumberOfParticles )
  {
    // you should replace this by your implementation ...
    // do not hesitate to define some functions
    float imass = texture(uTexVelocityMass, vCoord).w;
  	float iradius = texture(uTexPositionRadius, vCoord).w;
  	vec3 g = vec3(0.0,0.0,-9.81)*imass;
  	vec3 F = g;
  	vec3 vi = texture(uTexVelocityMass, vCoord).xyz;
  	vec3 pi = texture(uTexPositionRadius, vCoord).xyz;

  	vec3 vo = vi + uDeltaT*F/imass;
  	vec3 po = pi + uDeltaT*vi;
  	float omass = imass;
  	float oradius = iradius;
  	oPositionRadius = vec4(po,oradius);
  	oVelocityMass = vec4(vo,omass);
  }
}

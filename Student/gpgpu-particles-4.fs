#version 300 es

precision highp float ;
precision highp int ;

uniform highp sampler2D uTexPositionRadius;
uniform highp sampler2D uTexVelocityMass;

uniform int uWidth;
uniform int uHeight;
uniform int uNumberOfParticles;
uniform float uDeltaT;
uniform float uLambda;
uniform float uGroundZ; // only for exercise 3
uniform float uElasticity; // exercise 3 and after
uniform float uBoxSize; // exercise 4 and after
uniform float uRotationAngle; // exercise 5 and after

smooth in vec2 vCoord;

// ouput: two textures
layout(location = 0) out vec4 oPositionRadius;
layout(location = 1) out vec4 oVelocityMass;

void apericube(){

	float imass = texture(uTexVelocityMass, vCoord).w;
	float iradius = texture(uTexPositionRadius, vCoord).w;
	vec3 vi = texture(uTexVelocityMass, vCoord).xyz;
	vec3 pi = texture(uTexPositionRadius, vCoord).xyz;

	vec3 g = vec3(0.0,0.0,-9.81)*imass;
	vec3 am = -uLambda*imass*vi;
	vec3 F = g + am;

	vec3 vo = vi + uDeltaT*F/imass;
	vec3 po = pi + uDeltaT*vi;
	float omass = imass;
	float oradius = iradius;


	if(po.z+oradius>uBoxSize){
		po.z = uBoxSize-oradius;
		vec3 vope = vec3(0.0,0.0,dot(vec3(0.0,0.0,1.0),vo));
		vec3 vopa = vo-vope;
		vo = uElasticity*(vopa - vope);
	}
	if(po.z-oradius<-uBoxSize){
		po.z = -uBoxSize+oradius;
		vec3 vope = vec3(0.0,0.0,dot(vec3(0.0,0.0,1.0),vo));
		vec3 vopa = vo-vope;
		vo = uElasticity*(vopa - vope);
	}
	if(po.y+oradius>uBoxSize){
		po.y = uBoxSize-oradius;
		vec3 vope = vec3(0.0,dot(vec3(0.0,1.0,0.0),vo),0.0);
		vec3 vopa = vo-vope;
		vo = uElasticity*(vopa - vope);
	}
	if(po.y-oradius<-uBoxSize){
		po.y = -uBoxSize+oradius;
		vec3 vope = vec3(0.0,dot(vec3(0.0,1.0,0.0),vo),0.0);
		vec3 vopa = vo-vope;
		vo = uElasticity*(vopa - vope);
	}
	if(po.x+oradius>uBoxSize){
		po.x = uBoxSize-oradius;
		vec3 vope = vec3(dot(vec3(1.0,0.0,0.0),vo),0.0,0.0);
		vec3 vopa = vo-vope;
		vo = uElasticity*(vopa - vope);
	}
	if(po.x-oradius<-uBoxSize){
		po.x = -uBoxSize+oradius;
		vec3 vope = vec3(dot(vec3(1.0,0.0,0.0),vo),0.0,0.0);
		vec3 vopa = vo-vope;
		vo = uElasticity*(vopa - vope);
	}
	oPositionRadius = vec4(po,oradius);
	oVelocityMass = vec4(vo,omass);

}


// main function
void main(void)
{
  // vCoord is in [0,1] ... we must enlarge it
  vec2 dim = vec2(float(uWidth),float(uHeight));
  vec2 coord = dim*vCoord-vec2(0.5);

  if( int(coord.x) + uWidth*int(coord.y) < uNumberOfParticles )
  {
    // you should replace this by your implementation ...
    // do not hesitate to define some functions
    //oPositionRadius = texture(uTexPositionRadius, vCoord);
    //oVelocityMass = texture(uTexVelocityMass, vCoord);
    apericube();
  }
}

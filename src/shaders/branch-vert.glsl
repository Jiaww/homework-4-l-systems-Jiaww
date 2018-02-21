#version 300 es

//This is a vertex shader. While it is called a "shader" due to outdated conventions, this file
//is used to apply matrix transformations to the arrays of vertex data passed to it.
//Since this code is run on your GPU, each vertex is transformed simultaneously.
//If it were run on your CPU, each vertex would have to be processed in a FOR loop, one at a time.
//This simultaneous transformation allows your program to run much faster, especially when rendering
//geometry with millions of vertices.

uniform mat4 u_Model;       // The matrix that defines the transformation of the
                            // object we're rendering. In this assignment,
                            // this will be the result of traversing your scene graph.
uniform mat4 u_ModelInvTr;  // The inverse transpose of the model matrix.
                            // This allows us to transform the object's normals properly
                            // if the object has been non-uniformly scaled.

uniform mat4 u_ViewProj;    // The matrix that defines the camera's transformation.
                            // We've written a static matrix for you to use for HW2,
                            // but in HW3 you'll have to generate one yourself
// uniform vec4 u_Color; // The color with which to render this instance of geometry.

uniform float u_Time;

uniform vec2 u_WindDir;
uniform float u_BendScale;
uniform float u_WindSpeed;
uniform float u_WaveWidth;
uniform float u_WindStrength;

in vec4 vs_Pos;             // The array of vertex positions passed to the shader

in vec4 vs_Nor;             // The array of vertex normals passed to the shader

in vec4 vs_Col;             // The array of vertex colors passed to the shader.
in vec2 vs_Uv;

out vec4 fs_Nor;            // The array of normals that has been transformed by u_ModelInvTr. This is implicitly passed to the fragment shader.
out vec4 fs_LightVec;       // The direction in which our virtual light lies, relative to each vertex. This is implicitly passed to the fragment shader.
out vec4 fs_Col;            // The color of each vertex. This is implicitly passed to the fragment shader.
out vec2 fs_Uv;

const vec4 lightPos = vec4(5, 5, 3, 1); //The position of our virtual light, which is used to compute the shading of
                                        //the geometry in the fragment shader.

void ApplyMainBending(inout vec3 vPos, vec2 vWind, float fBendScale){
    // Calculate the length from the ground, since we'll need it.
    float fLength = length(vPos);
    // Bend factor - Wind variation is done on the CPU.
    float fBF = vPos.y * fBendScale;
    // Smooth bending factor and increase its nearby height limit.
    fBF += 1.0;
    fBF *= fBF;
    fBF = fBF * fBF - fBF;
    fBF = fBF * fBF;
    // Displace position
    vec3 vNewPos = vPos;
    vNewPos.xz += vWind.xy * fBF;
    vPos.xyz = normalize(vNewPos.xyz)* fLength;
}

void main()
{
    fs_Col = vs_Col;                         // Pass the vertex colors to the fragment shader for interpolation
    fs_Uv = vs_Uv;
    
    //mat3 invTranspose = mat3(u_ModelInvTr);
    fs_Nor = vec4(vec3(vs_Nor), 0);          // Pass the vertex normals to the fragment shader for interpolation.
                                                            // Transform the geometry's normals by the inverse transpose of the
                                                            // model matrix. This is necessary to ensure the normals remain
                                                            // perpendicular to the surface after the surface is transformed by
                                                            // the model matrix.

    //Wind
    vec3 vPos = vec3(vs_Pos);
    vec3 wind_dir = normalize(vec3(u_WindDir.x, 0, u_WindDir.y));
    float wave_info = (cos((dot(vec3(0, 0, 0), wind_dir) - u_WindSpeed * u_Time) / u_WaveWidth) + 0.7);
    
    //vec3 w = wind_dir * wind_power * wave_info * fd * fr;
    vec3 w=wind_dir * u_WindStrength * wave_info*0.05;
    vec2 Wind=vec2(w.x,w.z);

    vec3 objectPosition = vec3(0,0,0);
    vPos -= objectPosition; // Reset the vertex to base-zero
    ApplyMainBending(vPos, Wind, u_BendScale);
    vPos += objectPosition;

    vec4 modelposition =  vec4(vPos, 1.0);   // Temporarily store the transformed vertex positions for use below

    fs_LightVec = lightPos - modelposition;  // Compute the direction in which the light source lies

    gl_Position = u_ViewProj * modelposition;// gl_Position is a built-in variable of OpenGL which is
                                             // used to render the final positions of the geometry's vertices
}

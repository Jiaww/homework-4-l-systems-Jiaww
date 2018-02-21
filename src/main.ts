import {vec3, mat4, quat} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Cylinder from './geometry/Cylinder';
import Plane from './geometry/Plane';
import Flower from './geometry/Flower';
import Scene from './rendering/gl/Scene';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import {Branch, Geometry, LSystem} from './LSystem'

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
export const controls = {
  Flower: true,
  Flower_Poly_Level: 1,
  Flower_Scale: 1.25,
  DefaultStep: 0.5,
  DefaultAngle: 23,
  ShrinkExp: 0.94,
  Thickness: 1.0,
  Base: 'A',
  Grammar1: 'A->[&FL*A]/////[&FL*A]///////[&FL*A]',
  Grammar2: 'F->S/////F',
  Grammar3: 'S->FL',
  Grammar4: 'L->[^^-f+f+f-|-f+f+f]',
  Grammar5: '',
  Iterations: 8,
  'Load Scene': loadScene, // A function pointer, essentially 
  WindDirX: 0.5,
  WindDirY: 0.0,
  WindSpeed: 8.0,
  WaveWidth: 5.0,
  WindStrength: 20.0,
  BendScale: 0.01
};


let cylinder: Cylinder;
let LS: LSystem;
export var branches: Scene;
export var flowers: Scene;
export var ground: Scene;
let MeshManager : Array<string> = [];
//OBJ loading
// var fs = require('fs');
// var OBJ = require('webgl-obj-loader');

// var meshPath = '../mesh/lotus_OBJ_low.obj';
// var opt = {encoding: 'utf8'};

function loadScene() {
  ground = new Scene();
  //Plane
  let plane = new Plane(vec3.fromValues(0,0,0), 25);
  plane.create();
  ground.add(plane, mat4.create());
  ground.createBuffer();
  ground.bindTex("./src/models/grass.jpg");
  //Tree
  branches = new Scene();
  LS = new LSystem();
  let program = controls.Base + '\n' 
  + controls.Grammar1 + '\n' 
  + controls.Grammar2 + '\n'
  + controls.Grammar3 + '\n'
  + controls.Grammar4 + '\n'
  + controls.Grammar5 + '\n';
  LS.loadProgramFromString(program);
  LS.setDefaultStep(controls.DefaultStep);
  LS.setDefaultAngle(controls.DefaultAngle);
  LS.process(controls.Iterations-1);
  console.log(LS);
  for(let i = 0; i < LS.Branches.length; i++){
    cylinder = new Cylinder(vec3.fromValues(0.0,0.0,0.0), 
      LS.Branches[i].topRadius, 
      LS.Branches[i].bottomRadius, 
      LS.DefaultStep*0.5, 
      6);
    cylinder.create();
    let rotQuat = quat.create();
    let targetUp = vec3.create();
    vec3.subtract(targetUp, LS.Branches[i].endPos, LS.Branches[i].startPos);
    vec3.normalize(targetUp, targetUp);
    quat.rotationTo(rotQuat, vec3.fromValues(0,1,0), targetUp);
    let rotationMat = mat4.create();
    mat4.fromQuat(rotationMat, rotQuat);
    let midPos = vec3.create();
    vec3.add(midPos, LS.Branches[i].startPos, LS.Branches[i].endPos);
    vec3.scale(midPos, midPos, 0.5);
    let translationMat = mat4.create();
    mat4.fromTranslation(translationMat, midPos);
    let modelMat = mat4.create();
    let subLen = vec3.create();
    vec3.subtract(subLen, LS.Branches[i].endPos, LS.Branches[i].startPos);
    let scaleY = vec3.length(subLen)/controls.DefaultStep;
    mat4.scale(modelMat, modelMat, [1.0,scaleY,1.0]);
    mat4.multiply(modelMat, rotationMat, modelMat);
    mat4.multiply(modelMat, translationMat, modelMat);
    branches.add(cylinder, modelMat);
  }
  branches.bindTex("./src/models/branch_col.jpg");
  branches.createBuffer();
  // Flowers
  flowers = new Scene();
  var flower = new Flower(vec3.fromValues(0.0,0.0,0.0));
  flower.createdByLoader(MeshManager[controls.Flower_Poly_Level-1]);
  if(controls.Flower){
    for (let i=0; i < LS.Geometries.length; i++){
      let rotQuat = quat.create();
      quat.fromEuler(rotQuat, 180*0.5*Math.random()-45,180*0.5*Math.random()-45,180*0.5*Math.random()-45);
      let rotationMat = mat4.create();
      mat4.fromQuat(rotationMat, rotQuat);
      let fPos = LS.Geometries[i].position;
      let translationMat = mat4.create();
      mat4.fromTranslation(translationMat, fPos);
      let modelMat = mat4.create();
      let scale = (0.07+0.05 * Math.random())*controls.Flower_Scale;
      mat4.scale(modelMat, modelMat, [scale,scale,scale]);
      mat4.multiply(modelMat, rotationMat, modelMat);
      mat4.multiply(modelMat, translationMat, modelMat);
      flowers.add(flower, modelMat);
      console.log("Add Flower");
    }
  }
  flowers.bindTex("./src/models/lotus_petal_diffuse.jpg");
  flowers.createBuffer();
  console.log("Flower Created");
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'Flower');
  gui.add(controls, 'Flower_Poly_Level', 1, 4).step(1);
  gui.add(controls, 'Flower_Scale', 0.0, 2.0).step(0.1);
  gui.add(controls, 'DefaultStep', 0.1, 3.0);
  gui.add(controls, 'DefaultAngle', 0.0, 90.0);
  gui.add(controls, 'ShrinkExp', 0.0, 1.0).step(0.01);
  gui.add(controls, 'Thickness', 0.0, 5.0).step(0.1);
  gui.add(controls, 'Base');
  gui.add(controls, 'Grammar1');
  gui.add(controls, 'Grammar2');
  gui.add(controls, 'Grammar3');
  gui.add(controls, 'Grammar4');
  gui.add(controls, 'Grammar5');
  gui.add(controls, 'Iterations', 1.0, 10.0).step(1.0);
  gui.add(controls, 'Load Scene');
  var wind = gui.addFolder("Wind");
  wind.add(controls, 'WindDirX', -1.0, 1.0);
  wind.add(controls, 'WindDirY', -1.0, 1.0);
  wind.add(controls, 'WindSpeed', 0.01, 20.0);
  wind.add(controls, 'WaveWidth', 0.01, 20.0);
  wind.add(controls, 'WindStrength', 0.0, 40.0);
  wind.add(controls, 'BendScale', 0.0, 0.2);
  wind.open();
  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(25, 25, 25), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.0,0.0,0.0, 1);
  gl.enable(gl.DEPTH_TEST);

  const tricolor = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    let shader = tricolor;
    renderer.render(camera, shader, [
      ground
    ]);
    renderer.render(camera, shader, [
      branches
    ]);
    renderer.render(camera, shader, [
      flowers
    ]);
    stats.end();
    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

function readTextFile(file : string) : string
{
   console.log("Download" + file + "...");
    var rawFile = new XMLHttpRequest();
    let resultText : string;
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                resultText= rawFile.responseText;                
            }
        }
    }
    rawFile.send(null);

    return resultText;
}

function DownloadMeshes()
{
  MeshManager.push(readTextFile("./src/models/flower_lowest.obj"));
  MeshManager.push(readTextFile("./src/models/flower_low.obj"));
  MeshManager.push(readTextFile("./src/models/flower.obj"));
  MeshManager.push(readTextFile("./src/models/flower_high.obj"));
  console.log("Downloading is complete!");

  main();  
}

DownloadMeshes();
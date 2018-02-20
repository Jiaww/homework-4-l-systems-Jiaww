import { vec3, mat4, quat } from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Cylinder from './geometry/Cylinder';
import Scene from './rendering/gl/Scene';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import { setGL } from './globals';
import ShaderProgram, { Shader } from './rendering/gl/ShaderProgram';
import { LSystem } from './LSystem';
// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
export const controls = {
    TrickTrig: true,
    Base: 'F',
    Grammar1: 'F->F[-F+F*][+F+F*]',
    Grammar2: '',
    'Load Scene': loadScene,
};
let cylinder;
let LS;
export var scene;
function loadScene() {
    LS = new LSystem();
    let program = controls.Base + '\n' + controls.Grammar1 + '\n' + controls.Grammar2;
    LS.loadProgramFromString();
    LS.process(2);
    console.log(LS);
    scene = new Scene();
    for (let i = 0; i < LS.Branches.length; i++) {
        cylinder = new Cylinder(vec3.fromValues(0.0, 0.0, 0.0), LS.Branches[i].topRadius, LS.Branches[i].bottomRadius, LS.DefaultStep * 0.5, 3);
        cylinder.create();
        let rotQuat = quat.create();
        let targetUp = vec3.create();
        vec3.subtract(targetUp, LS.Branches[i].endPos, LS.Branches[i].startPos);
        quat.rotationTo(rotQuat, vec3.fromValues(0, 1, 0), targetUp);
        let rotationMat = mat4.create();
        mat4.fromQuat(rotationMat, rotQuat);
        let midPos = vec3.create();
        vec3.add(midPos, LS.Branches[i].startPos, LS.Branches[i].endPos);
        vec3.scale(midPos, midPos, 0.5);
        let translationMat = mat4.create();
        mat4.fromTranslation(translationMat, midPos);
        let modelMat = mat4.create();
        mat4.multiply(modelMat, translationMat, rotationMat);
        scene.add(cylinder, translationMat);
    }
    scene.createBuffer();
    console.log(scene);
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
    gui.add(controls, 'Load Scene');
    gui.add(controls, 'TrickTrig');
    gui.add(controls, 'Base');
    gui.add(controls, 'Grammar1');
    gui.add(controls, 'Grammar2');
    // get canvas and webgl context
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        alert('WebGL 2 not supported!');
    }
    // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
    // Later, we can import `gl` from `globals.ts` to access it
    setGL(gl);
    // Initial call to load scene
    loadScene();
    const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));
    const renderer = new OpenGLRenderer(canvas);
    renderer.setClearColor(1.0, 1.0, 1.0, 1);
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
            scene
        ]);
        stats.end();
        // Tell the browser to call `tick` again whenever it renders a new frame
        requestAnimationFrame(tick);
    }
    window.addEventListener('resize', function () {
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
main();
//# sourceMappingURL=main.js.map
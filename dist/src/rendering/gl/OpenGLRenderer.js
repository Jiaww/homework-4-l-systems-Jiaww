import { mat4, vec2 } from 'gl-matrix';
import { gl } from '../../globals';
function frac(f) {
    return f % 1;
}
// In this file, `gl` is accessible because it is imported above
class OpenGLRenderer {
    constructor(canvas) {
        this.canvas = canvas;
    }
    setClearColor(r, g, b, a) {
        gl.clearColor(r, g, b, a);
    }
    setSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
    clear() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    render(camera, prog, scenes) {
        let PI = 3.14159265359;
        let model = mat4.create();
        let viewProj = mat4.create();
        var d = new Date();
        let time = ((d.getTime()) / 1000.0) * 1.3;
        mat4.identity(model);
        let idm = mat4.create();
        mat4.identity(idm);
        // let dt = Math.max(0.0, frac(time*0.5)*4.0-3.0) + Math.floor(time*0.5)%4;
        // let dt1 = Math.floor(time*0.5)%4;
        // let rot1 = mat4.create();
        // let rot2 = mat4.create();
        // let rot3 = mat4.create();
        // let rot4 = mat4.create();
        // let rot5 = mat4.create();
        // let rot6 = mat4.create();
        // let scale1 = mat4.create();
        // let scale2 = mat4.create();      
        // mat4.scale(scale1, idm, vec3.fromValues(2.5,2.5,2.5));
        // mat4.scale(scale2, idm, vec3.fromValues(1.0,1.0,1.0));
        // mat4.multiply(model, rot1, rot2);
        // if(dt1 == 0.0){
        //   //Phase 1
        //   mat4.rotate(rot5, idm, PI*2.0/3.0*dt, vec3.fromValues(-1.0,1.0,1.0));
        //   mat4.multiply(model, model, rot5);
        //   mat4.multiply(model, model, scale1);
        //   prog.setTrig(true && controls.TrickTrig);
        // }
        // else if(dt1 == 1.0){
        //   //Phase 2
        //   mat4.rotate(rot5, idm, PI*2.0/3.0, vec3.fromValues(-1.0,1.0,1.0));
        //   mat4.rotate(rot4, idm, PI*0.5*(dt-1.0), vec3.fromValues(0.0,1.0,0.0));
        //   mat4.multiply(model, model, rot5);
        //   mat4.multiply(model, model, rot4);
        //   mat4.multiply(model, model, scale2);
        //   prog.setTrig(false && controls.TrickTrig);
        // }
        // else if(dt1 == 2.0){
        //   //Phase 3
        //   mat4.rotate(rot5, idm, PI*2.0/3.0, vec3.fromValues(-1.0,1.0,1.0));
        //   mat4.rotate(rot4, idm, PI*0.5, vec3.fromValues(0.0,1.0,0.0));
        //   mat4.rotate(rot6, idm, -PI*2.0/3.0*(dt-2.0), vec3.fromValues(-1.0,1.0,-1.0));
        //   mat4.multiply(model, model, rot5);
        //   mat4.multiply(model, model, rot4);
        //   mat4.multiply(model, model, rot6);
        //   mat4.multiply(model, model, scale1);
        //   prog.setTrig(true && controls.TrickTrig);
        // }
        // else if(dt1 == 3.0){
        //   //Phase 4
        //   mat4.rotate(rot5, idm, PI*2.0/3.0, vec3.fromValues(-1.0,1.0,1.0));
        //   mat4.rotate(rot4, idm, PI*0.5, vec3.fromValues(0.0,1.0,0.0));
        //   mat4.rotate(rot6, idm, -PI*2.0/3.0, vec3.fromValues(-1.0,1.0,-1.0));
        //   mat4.rotate(rot3, idm, -PI*0.5*(dt-3.0), vec3.fromValues(0.0,1.0,0.0));
        //   mat4.multiply(model, model, rot5);
        //   mat4.multiply(model, model, rot4);
        //   mat4.multiply(model, model, rot6);
        //   mat4.multiply(model, model, rot3);
        //   mat4.multiply(model, model, scale2);
        //   prog.setTrig(false && controls.TrickTrig);
        // }
        mat4.multiply(viewProj, camera.projectionMatrix, camera.viewMatrix);
        prog.setModelMatrix(model);
        prog.setViewProjMatrix(viewProj);
        prog.updateTime(Math.sin(time));
        let resolution = vec2.fromValues(window.innerWidth, window.innerHeight);
        prog.setResolution(resolution);
        for (let scene of scenes) {
            prog.draw(scene);
        }
    }
}
;
export default OpenGLRenderer;
//# sourceMappingURL=OpenGLRenderer.js.map
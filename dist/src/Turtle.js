import { vec3, mat4 } from 'gl-matrix';
export class Turtle {
    constructor() {
        this.pos = vec3.fromValues(0, 0, 0);
        this.Up = vec3.fromValues(0, 1, 0);
        this.Forward = vec3.fromValues(0, 0, 1);
        this.Left = vec3.fromValues(1, 0, 0);
    }
    moveForward(distance) {
        vec3.scaleAndAdd(this.pos, this.pos, this.Forward, distance);
    }
    applyUpRot(degrees) {
        let rad = degrees * Math.PI / 180;
        let rotation = mat4.create();
        mat4.rotate(rotation, rotation, rad, this.Up);
        vec3.transformMat4(this.Forward, this.Forward, rotation);
        vec3.transformMat4(this.Left, this.Left, rotation);
    }
    applyLeftRot(degrees) {
        let rad = degrees * Math.PI / 180;
        let rotation = mat4.create();
        mat4.rotate(rotation, rotation, rad, this.Left);
        vec3.transformMat4(this.Forward, this.Forward, rotation);
        vec3.transformMat4(this.Up, this.Up, rotation);
    }
    applyForwardRot(degrees) {
        let rad = degrees * Math.PI / 180;
        let rotation = mat4.create();
        mat4.rotate(rotation, rotation, rad, this.Forward);
        vec3.transformMat4(this.Left, this.Left, rotation);
        vec3.transformMat4(this.Up, this.Up, rotation);
    }
}
//# sourceMappingURL=Turtle.js.map
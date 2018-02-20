import { vec3 } from 'gl-matrix';
import { Turtle } from './Turtle';
export class Branch {
    constructor(sPos, ePos, bRadius = 0.1, tRadius = 0.1) {
        this.startPos = sPos;
        this.endPos = ePos;
        this.bottomRadius = bRadius;
        this.topRadius = tRadius;
    }
}
export class Geometry {
    constructor(pos, type) {
        this.position = pos;
        this.type = type;
    }
}
export class LSystem {
    constructor() {
        this.Branches = [];
        this.Geometries = [];
        this.DefaultAngle = 22.5;
        this.DefaultStep = 1.0;
        this.Iterations = [];
        this.Productions = new Map();
    }
    loadProgramFromString(program) {
        this.reset();
        this.Grammar = program;
        let index = 0;
        while (index < program.length) {
            let nextIndex = program.indexOf("\n", index);
            let line = program.substr(index, nextIndex);
            this.addProduction(line);
            if (nextIndex == -1)
                break;
            index = nextIndex + 1;
        }
    }
    setDefaultAngle(degrees) {
        this.DefaultAngle = degrees;
    }
    setDefaultStep(distance) {
        this.DefaultStep = distance;
    }
    //Iterate Grammar
    getIteration(n) {
        if (n >= this.Iterations.length) {
            for (let i = this.Iterations.length; i <= n; i++) {
                this.Current = this.iterate(this.Current);
                this.Iterations.push(this.Current);
            }
        }
        return this.Iterations[n];
    }
    //Get Geometry from running the turtle
    process(n) {
        let turtle = new Turtle();
        let stack = new Array();
        let insn = this.getIteration(n);
        let depth = new Array();
        let curDepth = 0;
        console.log(this.Iterations);
        turtle.applyLeftRot(-90);
        for (let i = 0; i < insn.length; i++) {
            let sym = insn.substr(i, 1);
            if (sym == "F") {
                let start = vec3.fromValues(turtle.pos[0], turtle.pos[1], turtle.pos[2]);
                turtle.moveForward(this.DefaultStep);
                let end = vec3.fromValues(turtle.pos[0], turtle.pos[1], turtle.pos[2]);
                this.Branches.push(new Branch(start, end));
            }
            else if (sym == "f") {
                turtle.moveForward(this.DefaultStep);
            }
            else if (sym == "+") {
                turtle.applyUpRot(this.DefaultAngle);
            }
            else if (sym == "-") {
                turtle.applyUpRot(-this.DefaultAngle);
            }
            else if (sym == "&") {
                turtle.applyLeftRot(this.DefaultAngle);
            }
            else if (sym == "^") {
                turtle.applyLeftRot(-this.DefaultAngle);
            }
            else if (sym == "\\") {
                turtle.applyForwardRot(this.DefaultAngle);
            }
            else if (sym == "/") {
                turtle.applyForwardRot(-this.DefaultAngle);
            }
            else if (sym == "|") {
                turtle.applyUpRot(180);
            }
            else if (sym == "[") {
                stack.push(turtle);
            }
            else if (sym == "]") {
                turtle = stack.pop();
            }
            else if (sym == "*") {
                let geoPos = vec3.fromValues(turtle.pos[0], turtle.pos[1], turtle.pos[2]);
                this.Geometries.push(new Geometry(geoPos, sym));
            }
            else {
                let geoPos = vec3.fromValues(turtle.pos[0], turtle.pos[1], turtle.pos[2]);
                this.Geometries.push(new Geometry(geoPos, sym));
            }
        }
    }
    reset() {
        this.Current = "";
        this.Branches = [];
        this.Iterations = [];
        this.Geometries = [];
        this.Productions.clear();
    }
    addProduction(line) {
        let index;
        // Strip whitespace
        line.replace(" ", "");
        if (line.length == 0)
            return;
        // Split productions
        index = line.indexOf("->");
        if (index != -1) {
            let symFrom = line.substr(0, index);
            let symTo = line.substr(index + 2);
            this.Productions.set(symFrom, symTo);
        }
        else {
            this.Current = line;
        }
    }
    iterate(input) {
        let output = "";
        for (let i = 0; i < input.length; i++) {
            let sym = input.substr(i, 1);
            let next = "";
            if (this.Productions.has(sym)) {
                next = this.Productions.get(sym);
            }
            else {
                next = sym;
            }
            output = output + next;
        }
        return output;
    }
}
//# sourceMappingURL=LSystem.js.map
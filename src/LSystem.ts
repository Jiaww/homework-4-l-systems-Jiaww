import {vec3, vec4, mat4} from 'gl-matrix';
import {Turtle} from './Turtle';
import {controls} from './main'

export class Branch{
	startPos: vec3;
	endPos: vec3;
	bottomRadius: number;
	topRadius: number;

	constructor(sPos:vec3, ePos:vec3, bRadius:number = 0.1, tRadius:number = 0.1){
		this.startPos = sPos;
		this.endPos = ePos;
		this.bottomRadius = bRadius;
		this.topRadius = tRadius;
	}
}

export class Geometry{
	position: vec3;
	type: string;

	constructor(pos:vec3, type:string){
		this.position = pos;
		this.type = type;
	}
}

export class LSystem{
	Branches: Array<Branch> = [];
	Geometries: Array<Geometry> = [];
	DefaultAngle: number = 22.5;
	DefaultStep: number = 1.0;
	Grammar: string;
	Productions: Map<string, string>;
	Iterations: Array<string> = [];
	Current: string;

	constructor(){
		this.Productions = new Map();
	}

	loadProgramFromString(program: string){
		this.reset();
		this.Grammar = program;

		let index = 0;
		while(index < program.length){
			let nextIndex = program.indexOf("\n", index);
			let line = program.substr(index, nextIndex-index).trim();
			this.addProduction(line);
			if (nextIndex == -1) 
				break;
			index = nextIndex+1;
		}
	}

	setDefaultAngle(degrees: number){
		this.DefaultAngle = degrees;
	}

	setDefaultStep(distance: number){
		this.DefaultStep = distance;
	}
	//Iterate Grammar
	getIteration(n : number){
		if(n >= this.Iterations.length){
			for (let i = this.Iterations.length; i <= n; i++){
				this.Current = this.iterate(this.Current);
				this.Iterations.push(this.Current);
			}
		}
		return this.Iterations[n];
	}

	//Get Geometry from running the turtle
	process(n:number){
		let turtle = new Turtle();
		let stack = new Array();
		let insn = this.getIteration(n);
		//insn = "FF" + insn;
		//console.log(insn);
		turtle.applyLeftRot(-90);

		for(let i = 0; i < insn.length; i++){
			let sym = insn.substr(i, 1);
			if(sym == "F"){
				let start = vec3.fromValues(turtle.pos[0],turtle.pos[1],turtle.pos[2]);
				turtle.moveForward(this.DefaultStep);
				let end = vec3.fromValues(turtle.pos[0],turtle.pos[1],turtle.pos[2]);
				this.Branches.push(new Branch(start, end, Math.max(controls.Thickness*Math.pow(controls.ShrinkExp,turtle.Depth), 0.05), Math.max(controls.Thickness*Math.pow(controls.ShrinkExp,turtle.Depth+1), 0.05)));
			}
			else if(sym == "f"){
				turtle.moveForward(this.DefaultStep);
			}
			else if(sym == "+"){
				turtle.applyUpRot(this.DefaultAngle);
			}
			else if(sym == "-"){
				turtle.applyUpRot(-this.DefaultAngle);
			}
			else if(sym == "&"){
				turtle.applyLeftRot(this.DefaultAngle);
			}
			else if(sym == "^"){
				turtle.applyLeftRot(-this.DefaultAngle);
			}
			else if(sym == "\\"){
				turtle.applyForwardRot(this.DefaultAngle);
			}
			else if(sym == "/"){
				turtle.applyForwardRot(-this.DefaultAngle);
			}
			else if(sym == "|"){
	            turtle.applyUpRot(180);
	        }
	        else if(sym == "["){
	        	let curTurtle = new Turtle();
	        	curTurtle.pos = vec3.fromValues(turtle.pos[0],turtle.pos[1],turtle.pos[2]);
	        	curTurtle.Up = vec3.fromValues(turtle.Up[0],turtle.Up[1],turtle.Up[2]);
	        	curTurtle.Forward = vec3.fromValues(turtle.Forward[0],turtle.Forward[1],turtle.Forward[2]);
	        	curTurtle.Left = vec3.fromValues(turtle.Left[0],turtle.Left[1],turtle.Left[2]);
	        	curTurtle.Depth = turtle.Depth;
	        	stack.push(curTurtle);
	        }
	        else if(sym == "]"){
	        	turtle = stack.pop();
	        }
	        else if(sym == "*"){
	        	let geoPos = vec3.fromValues(turtle.pos[0],turtle.pos[1],turtle.pos[2]);
	        	this.Geometries.push(new Geometry(geoPos, sym));
	        }
	        else{
				//let geoPos = vec3.fromValues(turtle.pos[0],turtle.pos[1],turtle.pos[2]);
	        	//this.Geometries.push(new Geometry(geoPos, sym));
	        }
		} 
	}

	reset(){
		this.Current = "";
		this.Branches = [];
		this.Iterations = [];
		this.Geometries = [];
		this.Productions.clear();
	}

	addProduction(line: string){
		let index;
		// Strip whitespace
		line.replace(" ", "");

		if (line.length == 0)
			return;

		// Split productions
		index = line.indexOf("->");
		if (index != -1){
			let symFrom = line.substr(0, index);
			let symTo = line.substr(index+2);
			this.Productions.set(symFrom, symTo);
		}
		else{
			this.Current = line;
		}
	}

	iterate(input: string){
		let output = "";
		for (let i = 0; i < input.length; i++){
			let sym = input.substr(i, 1);
			let next = "";
			if (this.Productions.has(sym)){
				next = this.Productions.get(sym);
			}
			else{
				next = sym;
			}
			output = output + next;
		}
		return output;
	}
}
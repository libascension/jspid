/** jspid - JavaScript PID simulator **/

"use strict";
var graph;

class Graph {
	constructor(canvas, xmin, ymin, xmax, ymax) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');

		this.canvas.width = parseInt(window.getComputedStyle(canvas).width);
		this.canvas.height = parseInt(window.getComputedStyle(canvas).height);
		
		this.xscale = new Object();
		this.yscale = new Object();
		this.xbox = new Object();
		this.ybox = new Object();
		this.xlabel = new Object();
		this.ylabel1 = new Object();
		this.ylabel2 = new Object();
		
		this.xscale.min = xmin === undefined ? 0 : xmin;
		this.xscale.max = xmax === undefined ? 50 : xmax;
		this.yscale.min = ymin === undefined ? 0 : ymin;
		this.yscale.max = ymax === undefined ? 10 : ymax;
		
		this.xbox.min = 50;
		this.xbox.max = canvas.width - 10;
		this.xbox.width = (this.xbox.max - this.xbox.min)
		this.ybox.min = 10;
		this.ybox.max = canvas.height - 50;
		this.ybox.height = (this.ybox.max - this.ybox.min)
		
		this.ctx.font = "15px sans-serif";
		this.xlabel.x = this.xbox.min + (this.xbox.width/2) - (this.ctx.measureText("Time (s)").width/2);
		this.xlabel.y = this.canvas.height - 10;
		this.ylabel1.x = -(this.ybox.max - (this.ybox.height/4 - this.ctx.measureText("Setpoint").width/2));
		this.ylabel1.y = 15;
		this.ylabel2.x = -(this.ybox.min + (this.ybox.height/4 + this.ctx.measureText("Sensor signal").width/2));
		this.ylabel2.y = 15;
		
	}
	
	initGrid() {
		//Draw outer bounds
		this.ctx.fillStyle = "#000000";
		this.ctx.fillRect(this.xbox.min, this.ybox.min, this.xbox.width, this.ybox.height);
		this.ctx.fillStyle = "#ffffff";
		this.ctx.fillRect(this.xbox.min + 2, this.ybox.min + 2, this.xbox.width - 4, this.ybox.height - 4);
		
		this.ctx.fillStyle = "#000000";
		this.ctx.fillText("Time (s)", this.xlabel.x, this.xlabel.y);
		this.ctx.rotate(-Math.PI/2);
		this.ctx.fillStyle = "#0000ff";
		this.ctx.fillText("Setpoint", this.ylabel1.x, this.ylabel1.y);
		this.ctx.fillStyle = "#ff4444";
		this.ctx.fillText("Sensor signal", this.ylabel2.x, this.ylabel2.y);
		this.ctx.restore();
	}
}

class GraphPoint {
	constructor(x,y,graph) {
		this.x = x;
		this.y = y;
	}
}

function initGraph()
{
	graph = new Graph(document.getElementById("jspid-plot"));
	graph.initGrid();
}

function doPlot(event)
{
	event = event || window.event;
	
	if (event.target.checkValidity())
	{
	
	}
	
	return true;
}
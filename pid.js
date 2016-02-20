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
		this.xscale.width = function(){ return (this.max - this.min); };
		this.yscale.min = ymin === undefined ? 0 : ymin;
		this.yscale.max = ymax === undefined ? 10 : ymax;
		this.yscale.height = function(){ return (this.max - this.min); };
		
		this.xbox.min = 50;
		this.xbox.max = canvas.width - 10;
		this.xbox.width = function() { return (this.max - this.min); };
		this.ybox.min = 10;
		this.ybox.max = canvas.height - 50;
		this.ybox.height = function(){ return (this.max - this.min); };
		
		this.ctx.font = "15px sans-serif";
		this.xlabel.x = this.xbox.min + (this.xbox.width()/2) - (this.ctx.measureText("Time (s)").width/2);
		this.xlabel.y = this.canvas.height - 10;
		this.ylabel1.x = -(this.ybox.max - (this.ybox.height()/4 - this.ctx.measureText("Setpoint").width/2));
		this.ylabel1.y = 15;
		this.ylabel2.x = -(this.ybox.min + (this.ybox.height()/4 + this.ctx.measureText("Sensor signal").width/2));
		this.ylabel2.y = 15;
		
	}
	
	//Draw the inital graph grid
	initGrid() {
		//Draw outer bounds
		this.ctx.fillStyle = "#000000";
		this.ctx.fillRect(this.xbox.min, this.ybox.min, this.xbox.width(), this.ybox.height());
		this.ctx.fillStyle = "#ffffff";
		this.ctx.fillRect(this.xbox.min + 2, this.ybox.min + 2, this.xbox.width() - 4, this.ybox.height() - 4);
		
		//Draw axis labels
		this.ctx.fillStyle = "#000000";
		this.ctx.fillText("Time (s)", this.xlabel.x, this.xlabel.y);
		this.ctx.save();
		this.ctx.rotate(-Math.PI/2);
		this.ctx.fillStyle = "#0000ff";
		this.ctx.fillText("Setpoint", this.ylabel1.x, this.ylabel1.y);
		this.ctx.fillStyle = "#ff4444";
		this.ctx.fillText("Sensor signal", this.ylabel2.x, this.ylabel2.y);
		this.ctx.restore();
		
		this.calcWindow();
		this.ctx.strokeStyle = "#878787";
		this.ctx.setLineDash([3,3]);
		
		this.ctx.font = "13px sans-serif";
		this.ctx.fillStyle = "#000000";
		
		for (var i = this.xscale.min; i <= this.xscale.max; i += this.window.xinterval)
		{
			if (i > this.xscale.min && i < this.xscale.max)
			{
				this.ctx.beginPath();
				this.ctx.moveTo(this.convX(i),this.convY(this.yscale.min));
				this.ctx.lineTo(this.convX(i),this.convY(this.yscale.max));
				this.ctx.stroke();
			}
			
			this.ctx.fillText(i, (this.convX(i) - (this.ctx.measureText(i).width/2)), this.ybox.max + 15);
		}
		
		for (var i = this.yscale.min; i <= this.yscale.max; i += this.window.yinterval)
		{
			if (i > this.yscale.min && i < this.yscale.max)
			{
				this.ctx.beginPath();
				this.ctx.moveTo(this.convX(this.xscale.min),this.convY(i));
				this.ctx.lineTo(this.convX(this.xscale.max),this.convY(i));
				this.ctx.stroke();
			}
			
			this.ctx.fillText(i, this.xbox.min - (this.ctx.measureText(i).width + 5), this.convY(i) + 4);
		}
		
	}
	
	//Get the tick spacing and interval for the currently defined window
	calcWindow() {
		//Set initial window parameters
		this.window = new Object();
		this.window.xspacing = (this.xbox.width()/this.xscale.width());
		this.window.xinterval = 1;
		this.window.yspacing = (this.ybox.height()/this.yscale.height());
		this.window.yinterval = 1;
		
		console.log("X",this.window.xspacing,this.window.xinterval);
		console.log("Y",this.window.yspacing,this.window.yinterval);
		
		//Even out X spacing
		var spacingTemp = this.window.xspacing;
		while (spacingTemp % 1 != 0)
		{
			this.window.xinterval++;
			spacingTemp = this.window.xinterval * this.window.xspacing;
		}
		this.window.xspacing = spacingTemp;
		
		//Even out Y spacing
		spacingTemp = this.window.yspacing;
		while(spacingTemp % 1 != 0)
		{
			this.window.yinterval++;
			spacingTemp = this.window.yinterval * this.window.yspacing;
		}
		this.window.yspacing = spacingTemp;
		
		console.log("Adjusted X",this.window.xspacing,this.window.xinterval);
		console.log("Adjusted Y",this.window.yspacing,this.window.yinterval);
	}
	
	convX(x) {
		return this.xbox.min + (x * (this.xbox.width()/this.xscale.width()));
	} 
	
	convY(y) {
		return this.ybox.max - (y * (this.ybox.height()/this.yscale.height()));
	}
	
	convPoint(x,y) {
		var point = new Object();
		point.x = this.convX(x);
		point.y = this.convY(y);
		
		return point;
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
/** jspid - JavaScript PID simulator **/

"use strict";
var graph;

class Graph 
{
	constructor(canvas, xmin, ymin, xmax, ymax) 
	{
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
	initGrid() 
	{
		//Reset the context in case it has properties set
		this.resetContext();
		
		//Clear grid if there is anything on it
		this.ctx.fillStyle = "#ffffff";
		this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
		
		//Draw outer bounds
		this.ctx.strokeStyle = "#000000";
		this.ctx.lineWidth = "2";
		this.ctx.strokeRect(this.xbox.min, this.ybox.min, this.xbox.width(), this.ybox.height());
		this.ctx.fillStyle = "#ffffff";
		this.ctx.fillRect(this.xbox.min + 2, this.ybox.min + 2, this.xbox.width() - 4, this.ybox.height() - 4);
		
		//Draw axis labels
		this.ctx.font = "15px sans-serif";
		this.ctx.fillStyle = "#000000";
		this.ctx.fillText("Time (s)", this.xlabel.x, this.xlabel.y);
		this.ctx.save();
		this.ctx.rotate(-Math.PI/2);
		this.ctx.fillStyle = "#0000ff";
		this.ctx.fillText("Setpoint", this.ylabel1.x, this.ylabel1.y);
		this.ctx.fillStyle = "#ff4444";
		this.ctx.fillText("Sensor signal", this.ylabel2.x, this.ylabel2.y);
		this.ctx.restore();
		
		//Get the window constraints, initialize context for grid lines
		this.calcWindow();
		this.ctx.strokeStyle = "#878787";
		this.ctx.lineWidth = "1";
		this.ctx.setLineDash([3,3]);
		this.ctx.font = "13px sans-serif";
		this.ctx.fillStyle = "#000000";
		
		//Draw x-axis labels and grid lines
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
		
		//Draw y-axis labels and grid lines
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
		
		console.log("Window set up with", this.window.xspacing, 'x', this.window.yspacing, "px unit box,", this.window.xinterval, 'x', this.window.yinterval, "graph units");
		
		//Reset context for later operations
		this.resetContext();
	}
	
	//Get the tick spacing and interval for the currently defined window
	calcWindow() 
	{
		//Set initial window parameters
		this.window = new Object();
		this.window.yminspacing = 24;
		this.window.xminspacing = 60;
		this.window.xspacing = (this.xbox.width()/this.xscale.width());
		this.window.xinterval = 1;
		this.window.yspacing = (this.ybox.height()/this.yscale.height());
		this.window.yinterval = 1;
		
		//Even out X spacing
		var spacingTemp = this.window.xspacing;
		while (spacingTemp < this.window.xminspacing)
		{
			this.window.xinterval++;
			spacingTemp = this.window.xinterval * this.window.xspacing;
		}
		this.window.xspacing = spacingTemp;
		
		//Even out Y spacing
		spacingTemp = this.window.yspacing;
		while(spacingTemp < this.window.yminspacing)
		{
			this.window.yinterval++;
			spacingTemp = this.window.yinterval * this.window.yspacing;
		}
		this.window.yspacing = spacingTemp;
	}
	
	scaleYWithPadding(ymin,ymax)
	{
		//If only one argument is passed, detect whether it's an upper bound or a lower bound
		if (ymax === undefined)
		{
			if (ymin <= this.yscale.min)
				this.yscale.min = ymin;
			else
			{
				this.yscale.max = ymin;
				ymax = ymin;
				ymin = undefined;
			}
		}
		else
		{
			this.yscale.min = (ymin === undefined) ? this.yscale.min : ymin;
			this.yscale.max = ymax;
		}
		
		this.calcWindow();
		
		if (ymin !== undefined)
			this.yscale.min -= this.window.yinterval;
		
		if (ymax !== undefined)
			this.yscale.max += this.window.yinterval;
		
		this.initGrid();
	}
	
	resetContext()
	{
		this.ctx.strokeStyle = "#000000";
		this.ctx.fillStyle = "#000000";
		this.ctx.font = "15px sans-serif";
		this.ctx.lineWidth = "1";
		this.ctx.setLineDash([]);
	}
	
	setCurveColor(color)
	{
		this.ctx.strokeStyle = color;
	}
	
	setInitialPoint(x,y)
	{
		this.ctx.beginPath();
		var point = this.convPoint(x,y)
		this.ctx.moveTo(point.x,point.y);
	}
	
	nextPoint(x,y)
	{
		var point = this.convPoint(x,y);
		this.ctx.lineTo(point.x,point.y);
	}
	
	draw()
	{
		this.ctx.stroke();
	}
	
	convX(x) {
		return this.xbox.min + ((x - this.xscale.min) * (this.xbox.width()/this.xscale.width()));
	} 
	
	convY(y) {
		return this.ybox.max - ((y - this.yscale.min) * (this.ybox.height()/this.yscale.height()));
	}
	
	convPoint(x,y) {
		var point = new Object();
		point.x = this.convX(x);
		point.y = this.convY(y);
		
		return point;
	}
}

class PID 
{
	//PID SETUP ************************************
	constructor(Kp,Ki,Kd,start,setpoint,dt) 
	{
		//Set provided constants
		this.Kp = Kp;
		this.Ki = Ki;
		this.Kd = Kd;
		this.curPos = start;
		this.setpoint = setpoint;
		this.dt = dt;
		
		//Internal variables
		this.time = 0;
		this.accumError = 0;
		this.lastPos = this.curPos;
		this.errorHistory = new Array();
		this.history = new Array();
		this.divergingCount = 0;
		this.min = Infinity;
		this.max = -Infinity;
		
		this.history[0] = this.curPos;
	}
	
	setInitialPosition(pos)
	{
		this.curPos = pos;
	}
	
	//PROPERTY ACQUISITION ****************************
	
	getNormalizedP()
	{
		return this.Kp;
	}
	
	getNormalizedI()
	{
		return this.Ki;
	}
	
	getNormalizedD()
	{
		return this.Kd;
	}	
	
	getCurrentError()
	{
		return this.setpoint - this.curPos;
	}
	
	getNormalizedError()
	{
		return this.getCurrentError()*this.dt;
	}
	
	getCurrentDerivative()
	{
		return (this.curPos - this.lastPos)/this.dt;
	}
	
	//STATISTICS UPDATE *******************************
	
	updateExtrema()
	{
		if (this.curPos > this.max)
			this.max = this.curPos;
		if (this.curPos < this.min)
			this.min = this.curPos;
	}
	
	//PID EMULATION ***********************************
	
	moveSystem(delta)
	{
		this.lastPos = this.curPos;
		this.curPos += delta;
	}
	
	diverging()
	{
		if (this.errorHistory.length == 3)
		{
			var ratios;
			var ratioDeriv;
			
			ratios[0] = (this.errorHistory[0]/this.errorHistory[1]);
			ratios[1] = (this.errorHistory[1]/this.errorHistory[2]);
			
			ratioDeriv = (ratios[0] - ratios[1])/this.dt;
			
			this.divergingCount = ratioDeriv > 0 ? this.divergingCount + 1 : 0;
			
			return this.divergingCount > 10;
		}
		else
			return false;
	}
	
	testRun()
	{
		var pTerm, iTerm, dTerm;

		do 
		{
			pTerm = this.Kp*this.getCurrentError();
			
			this.accumError += this.getNormalizedError();
			iTerm = this.Ki*this.accumError;
			
			dTerm = this.Kd*this.getCurrentDerivative();
			
			this.moveSystem(this.dt*(pTerm + iTerm + dTerm));
			
			for (var i = 0; i < 3; i++)
			{
				if (this.errorHistory[i] !== undefined)
					this.errorHistory[i+1] = this.errorHistory[i];
			}
			
			this.errorHistory[0] = this.getCurrentError();
			
			this.updateExtrema();
			this.history.push(this.curPos)
		} while (Math.abs(this.getCurrentError()) > 0.0001 && !this.diverging());
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
	var jspidForm = event.target.form;
	
	if (jspidForm.checkValidity())
	{
		var Kp, Ki, Kd;
		var start, setpoint;
		var dt;
		
		//Get all of the input values
		for (var i=0; i < jspidForm.elements.length; i++)
		{
			if (jspidForm.elements[i].name == "jspid-Kp")
				Kp = parseFloat(jspidForm.elements[i].value);
			
			if (jspidForm.elements[i].name == "jspid-Ki")
				Ki = parseFloat(jspidForm.elements[i].value);
			
			if (jspidForm.elements[i].name == "jspid-Kd")
				Kd = parseFloat(jspidForm.elements[i].value);
			
			if (jspidForm.elements[i].name == "jspid-start")
				start = parseFloat(jspidForm.elements[i].value);
			
			if (jspidForm.elements[i].name == "jspid-setpoint")
				setpoint = parseFloat(jspidForm.elements[i].value);
			
			if (jspidForm.elements[i].name == "jspid-dt")
				dt = parseFloat(jspidForm.elements[i].value);
		}
		
		//DRAW SETPOINT LINE *************
		graph.scaleYWithPadding(setpoint);
		graph.resetContext();
		graph.setCurveColor("#0000ff");
		graph.setInitialPoint(0,setpoint);
		graph.nextPoint(graph.xscale.max,setpoint);
		graph.draw();
	}
}

function alertValidity (event)
{
	event = event || window.event;
	
	var name;
	
	if (event.target.name == "jspid-Kp")
		name = "Kp";
	else if (event.target.name == "jspid-Ki")
		name = "Ki";
	else if (event.target.name == "jspid-Kd")
		name = "Kd";
	else if (event.target.name == "jspid-start")
		name = "System start";
	else if (event.target.name == "jspid-setpoint")
		name = "Setpoint";
	else if (event.target.name == "jspid-dt")
		name = "Sample interval";
	
	alert(name + ": " + event.target.validationMessage);
}
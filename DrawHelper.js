var DrawHelper = {
	// note: set fillStyle (color) before calling this.
	drawSolidCircle : function(context, xPos, yPos, radius, lineWidth) {
		context.lineWidth = lineWidth !== undefined ? lineWidth : 1;
		context.beginPath();
		context.arc(xPos, yPos, radius, 0, Math.PI*2, true);
		context.fill();
	},
	
	// note: set strokeStyle (color) before calling this.
	drawEmptyCircle : function(context, xPos, yPos, radius, lineWidth) {
		context.lineWidth = lineWidth !== undefined ? lineWidth : 1;
		context.beginPath();
		context.arc(xPos, yPos, radius, 0, Math.PI*2, true);
		context.stroke();
	},
	
	drawRect : function(context, xPos, yPos, width, height, color) {
		context.beginPath();
		context.rect(xPos, yPos, width, height);
		context.fillStyle = color;
		context.fill();
	},
	
	drawCenterText : function(context, xPos, yPos, text, color) {
		context.font = "40pt Calibri";
		context.textAlign = "center";
		context.fillStyle = color === undefined ? 'white' : color;
		context.fillText(text, xPos, yPos);
	}
};
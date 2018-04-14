function Worker(x, y, team, planet) {
	this.x = x;
	this.y = y;
	this.team = team;
	this.planet = planet;
	this.alreadyColliding = false;
	this.animateTo(x, y, false, true);
}

Worker.prototype.draw = function(context) {
	DrawHelper.drawSolidCircle(context, this.x, this.y, 1);
}

Worker.prototype.animateTo = function(x, y, forcePoint, spawn) {
	if (this.tween !== undefined) {
		this.tween.stop();
	}
	var position = {x: this.x, y: this.y};
	var self = this;
	
	var m,
		isPlanet = false;
	for (m = 0; m < game.planets().length; m++) {
		var planet = game.planets()[m];
		if (planet.containsPoint(x, y)) {
			if (planet.team != this.team || planet.currentSize < planet.maxSize || planet.health < 100) {
				isPlanet = true;
			}
		}
	}
	if (forcePoint === undefined) {
		if (isPlanet) {
			forcePoint = true;
		}
	}
	var toX, toY;
	if (forcePoint !== undefined && forcePoint) {
		toX = x;
		toY = y;
	}
	else {
		var rnum = Math.random() * 360;
		if (spawn !== undefined && spawn == true) {
			var rnum2 = Math.random() + 1;
			toX = rnum2*this.planet.currentSize*10*Math.cos(rnum * Math.PI / 180) + x;
			toY = rnum2*this.planet.currentSize*10*Math.sin(rnum * Math.PI / 180) + y;
		}
		else {
			toX = Math.random()*10*Math.cos(rnum * Math.PI / 180) + x;
			toY = Math.random()*10*Math.sin(rnum * Math.PI / 180) + y;
		}
	}
	
	function update() {
		if (!isNaN(position.x) && !isNaN(position.y)) {
			self.x = position.x;
			self.y = position.y;
		}
		else {
			console.log('was NaN');
		}
	}
	
	function complete() {
		var z,
			worker;
		for (z = 0; z < game.animatedWorkers.length; z++) {
			worker = game.animatedWorkers[z];
			
			if (worker == self) {
				game.animatedWorkers.splice(z, 1);
			}
		}
		var l, j,
			//found = false,
			planet;
		for (l = 0; l < game.planets().length; l++) {
			planet = game.planets()[l];
			if ((planet.team != self.team || planet.health < 100 || planet.currentSize < planet.maxSize) && Math.pow(planet.x - position.x,2) + Math.pow(planet.y - position.y,2) < Math.pow(planet.currentSize*10,2)-1) {
				//found = false;
				/*for (j = 0; j < game.workers.length; j++) {
					if (game.workers[j] == self) {
						game.workers.splice(j,1);
						game.sWorkers[self.team].remove(self);
						found = true;
					}
				}*/
				if (game.workers.indexOf(self) == -1) {
					return;
				}
				else {
					//game.workers().remove(self);
					self.team.workers.remove(self);
					game.workers.remove(self);
					//game.sWorkers[self.team].remove(self);
				}
				/*if (!found)
					return;*/
				if (self.team == planet.team) {
					planet.upgrade();
				}
				else if (planet.team.name == null) {
					planet.takeover(self.team);
				}
				else {
					planet.hit();
				}
			}
		}
	}
	
	game.animatedWorkers.push(this);
	this.tween = new TWEEN.Tween(position).to({x: toX, y: toY},
				 Math.sqrt(Math.pow(position.x - toX, 2) + Math.pow(position.y - toY, 2))*20)
				 .onUpdate(update).onComplete(complete).start();
	this.tweenType = 'animate';
};

Worker.prototype.collideTo = function(x, y) {
	if (this.tweenType !== undefined && this.tweenType == 'collide') {
		return;
	}
	if (this.tween !== undefined) {
		this.tween.stop();
	}
	var position = {x: this.x, y: this.y};
	var self = this;
	game.collisionWorkers.push(this);
	function update() {
		if (!isNaN(position.x) && !isNaN(position.y)) {
			self.x = position.x;
			self.y = position.y;
		}
	}
	
	function complete() {
		game.collisionWorkers.remove(self);
	}
	
	this.tweenType = 'collide';
	this.tween = new TWEEN.Tween(position).to({x: x, y: y}, Math.sqrt(Math.pow(position.x - x, 2)
				 + Math.pow(position.y - y, 2))*20).onUpdate(update).onComplete(complete).start();
};
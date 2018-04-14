function Planet(size, x, y, team) {
	this.maxSize = size;
	this.team = team;
	this.currentSize = 1;
	this.x = x;
	this.y = y;
	this.upgradeMeter = 0;
	this.health = 100;
	this.takeoverTeam = 'none';
}

Planet.prototype.setTeam = function(team) {
	this.team = team;
};

Planet.prototype.draw = function(context) {
	if (this.maxSize > this.currentSize) {
		for (var i = this.maxSize; i >= this.currentSize+1; i--) {
			game.ringsToDraw.push((function(ctx, x, y, radius) {
				return function() {
					DrawHelper.drawEmptyCircle(ctx, x, y, radius, 8);
				};
			})(context, this.x, this.y, 10*i));
		}
	}
	DrawHelper.drawSolidCircle(context, this.x, this.y, this.currentSize*10);
};

Planet.prototype.conquer = function(team) {
	if (this.upgradeMeter == 50) {
		//game.sPlanets['none'].remove(this);
		this.team.planets.remove(this);
		team.planets.push(this);
		//game.sPlanets[team].push(this);
		this.team = team;
		this.upgradeMeter = 0;
		this.health = 100;
		game.updatePlanets = true;
	}
};
Planet.prototype.destroy = function() {
	if (this.health == 0) {
		//game.sPlanets[this.team].remove(this);
		this.team.planets.remove(this);
		this.team = game.getTeam(null);
		this.team.planets.push(this);
		this.health = 100;
		this.currentSize = 1;
		this.upgradeMeter = 0;
		//game.sPlanets['none'].push(this);
		game.updatePlanets = true;
		game.checkWin();
	}
};

Planet.prototype.upgrade = function() {
	if (this.health < 100) {
		this.health = this.health+1;
	}
	else if (this.currentSize < this.maxSize) {
		if (this.upgradeMeter == 50) {
			this.currentSize = this.currentSize+1;
			this.upgradeMeter = 0;
			game.updatePlanets = true;
		}
		else {
			this.upgradeMeter = this.upgradeMeter+1;
		}
	}
};

Planet.prototype.hit = function() {
	this.health = this.health-1;
					
	if (this.health == 0) {
		this.destroy();
	}
};

Planet.prototype.takeover = function(team) {
	if (this.takeoverTeam == null) {
		this.takeoverTeam = team;
		this.upgradeMeter = 1;
	}
	else if (this.takeoverTeam == team) {
		this.upgradeMeter = this.upgradeMeter+1;
		if (this.upgradeMeter == 50) {
			this.conquer(team);
		}
	}
	else {
		if (this.upgradeMeter > 0) {
			this.upgradeMeter = this.upgradeMeter-1;
		}
		if (this.upgradeMeter == 0) {
			this.takeoverTeam = null;
		}
	}
};

Planet.prototype.containsPoint = function(x, y) {
	if (Math.pow(this.x - x,2) + Math.pow(this.y - y,2) <= Math.pow(this.currentSize*10,2)) {
		return true;
	}
	return false;
};
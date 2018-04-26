function Game(context, canvas, planetContext) {
	//this.planets = [],
	this.workers = [],
	this.teams = [],
	/*this.sPlanets = {
		blue : [],
		green : [],
		red : [],
		orange : [],
		none : []
	},
	this.sWorkers = {
		blue : [],
		green : [],
		red : [],
		orange : []
	},*/
	this.cursorRadius = 40,
	this.selectedWorkers = [],
	this.context = context,
	this.canvas = canvas,
	this.planetContext = planetContext,
	this.x = 0,
	this.y = 0;
	this.animatedWorkers = [];
	this.collisionWorkers = [];
	this.gameOver = 0;
	this.paused = false;
	this.updatePlanets = true;
	this.ringsToDraw = [];
	this.startTime = new Date();
}

Game.prototype.planets = function() {
	var planets = [];
	for (var i = 0; i < this.teams.length; i++) {
		planets = planets.concat(this.teams[i].planets);
	}
	return planets;
};

Game.prototype.workers = function() {
	var workers = [];
	for (var i = 0; i < this.teams.length; i++) {
		workers = workers.concat(this.teams[i].workers);
	}
	return workers;
};
Game.prototype.separateInitialPlanets = function() {
	for (var i = 0; i < this.planets.length; i++) {
		this.sPlanets[this.planets[i].team].push(this.planets[i]);
	}
};

Array.prototype.remove = function(object) {
	if ((object instanceof Array) == false) {
		object = [object];
	}
	var i, j,
		initial = object.length;
	for (i = this.length-1; i >= 0; i--) {
		for (j = 0; j < object.length; j++) {
			if (this[i] == object[j]) {
				this.splice(i, 1);
				object.splice(j, 1);
				break;
			}
		}
	}
};
var teamMap = {red:'#FFC1C1', blue: '#37FDFC', green: 'lightgreen', orange: 'yellow'};
Game.prototype.draw = function() {
	if (this.gameOver == 0 && !this.paused) {
		window.requestAnimationFrame(function() { game.draw(); });
	}
	this.ringsToDraw.length = 0;
	this.collisionDetection();
	this.context.clearRect(0, 0, 800, 600);

	// only update the planet canvas if a planet's status changes
	if (this.updatePlanets) {
		this.planetContext.fillStyle = "black";
		this.planetContext.fillRect(0, 0, 800, 600);
		var x, i, planet;
		/*for (x in this.planets()) {
			this.planetContext.fillStyle = (x != 'none' ? x : "rgba(139, 137, 137, .35)");
			for (i = 0; i < this.sPlanets[x].length; i++) {
				this.sPlanets[x][i].draw(this.planetContext);
			}
		}*/
		var teamColor = '';
		for (var i = 0; i < this.planets().length; i++) {
			var planet = this.planets()[i];
			if (teamColor != planet.team.planetColor) {
				this.planetContext.fillStyle = planet.team.planetColor;
				teamColor = planet.team.planetColor;
			}
			planet.draw(this.planetContext);
		}
		
		this.planetContext.strokeStyle = "rgba(139, 137, 137, .35)";
		for (i = 0; i < this.ringsToDraw.length; i++) {
			this.ringsToDraw[i]();
		}
		this.updatePlanets = false;
	}
	
	/*var x, i;
	for (x in this.sWorkers) {
		this.context.fillStyle = teamMap[x];
		for (i = 0; i < this.sWorkers[x].length; i++) {
			this.sWorkers[x][i].draw(this.context);
		}
	}*/
	
	var teamColor = '';
	for (var i = 0; i < this.workers.length; i++) {
		var worker = this.workers[i];
		if (teamColor != worker.team.workerColor) {
			this.context.fillStyle = worker.team.workerColor;
			teamColor = worker.team.workerColor;
		}
		worker.draw(this.context);
	}
	
	for (i = 0; i < this.collisionWorkers.length; i++) {
		this.context.fillStyle = this.collisionWorkers[i].team.workerColor;
		this.collisionWorkers[i].draw(this.context);
	}
	var planet;
	for (i = 0; i < game.planets().length; i++) {
		planet = game.planets()[i];
		if (Math.pow(planet.x - game.x,2) + Math.pow(planet.y - game.y,2) <= Math.pow(planet.currentSize*10,2)) {
			if (planet.currentSize < planet.maxSize || (planet.team.name == null && planet.takeoverTeam != null && planet.takeoverTeam.name != null)) {
				DrawHelper.drawRect(this.context, planet.x-25, planet.y+50, 50, 10, (planet.team.name != null) ? planet.team.workerColor : planet.takeoverTeam.workerColor);
				DrawHelper.drawRect(this.context, planet.x-25, planet.y+50, planet.upgradeMeter, 10, (planet.team.name != null) ? planet.team.planetColor : planet.takeoverTeam.planetColor);
			}
			
			if (planet.team.name != null) {
				DrawHelper.drawRect(this.context, planet.x-25, planet.y+70, 50, 10, planet.team.workerColor);
				DrawHelper.drawRect(this.context, planet.x-25, planet.y+70, planet.health / 100 * 50, 10, planet.team.planetColor);
			}
		}
	}	
	this.context.fillStyle = 'white';
	this.context.strokeStyle = 'white';
	DrawHelper.drawSolidCircle(this.context, this.x, this.y, 2);
	DrawHelper.drawEmptyCircle(this.context, this.x, this.y, this.cursorRadius, 2);
	if (this.gameOver > 0) {
		DrawHelper.drawCenterText(this.context, this.canvas.width / 2, this.canvas.height / 2, (this.gameOver == 1) ? 'Y O U  L O S E' : 'Y O U  W I N');
		var ms = (new Date()-this.startTime);
		var x = ms / 1000;
		var seconds = Math.round(x % 60);
		x /= 60;
		var minutes = Math.floor(x % 60);
		DrawHelper.drawCenterText(this.context, this.canvas.width / 2, this.canvas.height / 2 + 100, minutes + 'm' + seconds + 's');
	}
	else if (this.paused) {
		DrawHelper.drawCenterText(this.context, this.canvas.width / 2, this.canvas.height / 2, 'P A U S E D');
	}
};

Game.prototype.pause = function() {
	if (this.paused) {
		this.updateTimer = setInterval(function(game) { game.update(); }, 1000, this);
		var i;
		for (i = 0; i < this.animatedWorkers.length; i++) {
			this.animatedWorkers[i].tween.play();
		}
		for (i = 0; i < this.collisionWorkers.length; i++) {
			this.collisionWorkers[i].tween.play();
		}
		this.paused = false;
		this.draw();
		this.update();
	}
	else {
		if (this.gameOver == 0) {
			clearInterval(this.updateTimer);
			var i;
			for (i = 0; i < this.animatedWorkers.length; i++) {
				this.animatedWorkers[i].tween.pause();
			}
			for (i = 0; i < this.collisionWorkers.length; i++) {
				this.collisionWorkers[i].tween.pause();
			}
			this.paused = true;
		}
	}
};

Game.prototype.update = function() {
	var i, j,
		planet,
		worker;
	for (i = 0; i < this.planets().length; i++) {
		planet = this.planets()[i];
		if (planet.team.name != null) {
			for (j = 1; j <= planet.currentSize; j++) {
				worker = new Worker(planet.x, planet.y, planet.team, planet);
				planet.team.workers.push(worker);
				this.workers.push(worker);
				//this.workers.push(worker);
				//this.sWorkers[planet.team].push(worker);
			}
		}
	}
	var z, t,
		colors = this.getBotColors(),
		teamPlanets = [],
		amountLeft = 0,
		selectedWorkers = [],
		planet,
		worker,
		team;
	for (i = 0; i < this.teams.length; i++) {
		team = this.teams[i];
		//teamPlanets = this.getPlanetsByTeam(team);
		for (j = 0; j < team.planets.length; j++) {
			planet = team.planets[j];
			if (planet.team.name != 'Blue') {
				selectedWorkers.length = 0;
				for (z = 0; z < this.workers.length; z++) {
					worker = this.workers[z];
					if (worker.team == team && Math.pow(planet.x - worker.x,2) + Math.pow(planet.y - worker.y,2) <= Math.pow(2*planet.currentSize*10,2)) {
						selectedWorkers.push(worker);
					}
				}
				amountLeft = selectedWorkers.length;
				for (t = 0; t < selectedWorkers.length; t++) {
					if (amountLeft >= 10 && t%2 == 0) {
						selectedWorkers[t].animateTo((planet.currentSize < planet.maxSize || planet.health < 100) ? planet.x : this.closest(planet).x,
						(planet.currentSize < planet.maxSize || planet.health < 100) ? planet.y : this.closest(planet).y, true);
						amountLeft--;
					}
				}
			}
		}
	}
};

Game.prototype.collisionDetection = function() {
	var j, v,
	otherWorker,
	worker;
	for (j = this.workers.length-1; j >= 0; j--) {
		otherWorker = this.workers[j];
		for (v = this.animatedWorkers.length-1; v >= 0; v--) {
			if (otherWorker.alreadyColliding) {
				break;
			}
			worker = this.animatedWorkers[v];
			
			if (!worker.alreadyColliding && worker.team != otherWorker.team && Math.pow(otherWorker.x - worker.x,2) + Math.pow(otherWorker.y - worker.y,2) <= Math.pow(40,2)) {
				worker.alreadyColliding = true;
				otherWorker.alreadyColliding = true;
				/*this.workers.remove([otherWorker, worker]);
				this.sWorkers[otherWorker.team].remove(otherWorker);
				this.sWorkers[worker.team].remove(worker);*/
				worker.team.workers.remove(worker);
				this.workers.remove(worker);
				this.workers.remove(otherWorker);
				otherWorker.team.workers.remove(otherWorker);
				this.animatedWorkers.remove([otherWorker, worker]);
				
				worker.collideTo((otherWorker.x + worker.x) / 2, (otherWorker.y + worker.y) / 2);
				otherWorker.collideTo((otherWorker.x + worker.x) / 2, (otherWorker.y + worker.y) / 2);
				j--;
				break;
			}
		}
	}
};

Game.prototype.checkWin = function() {
	var i,
		numPlanets = [],
		planet;
	for (i = 0; i < game.planets().length; i++) {
		planet = game.planets()[i];
		if (numPlanets.indexOf(planet.team.name) == -1 && planet.team.name != null) {
			numPlanets.push(planet.team.name);
		}
	}
	if (numPlanets.indexOf('Blue') == -1) {
		this.gameOver = 1;
	}
	else if (numPlanets.length == 1) {
		this.gameOver = 2;
	}
	if (this.gameOver) {
		clearInterval(game.updateTimer);
	}
};

Game.prototype.getBotColors = function() {
	var colors = [],
		planet;
	for (var i = 0; i < this.planets.length; i++) {
		planet = this.planets[i];
		if (planet.team != 'none' && planet.team != 'blue' && colors.indexOf(planet.team) == -1) {
			colors.push(planet.team);
		}
	}
	return colors;
};

Game.prototype.getTeam = function(teamName) {
	var retVal = null;
	for (var i = 0; i < this.teams.length; i++) {
		if (this.teams[i].name == teamName) {
			retVal = this.teams[i];
		}
	}
	return retVal;
};

Game.prototype.getPlanetsByTeam = function(team) {
	return this.sPlanets[team];
};

Game.prototype.closest = function(currentPlanet) {
	var i,
		currentDistance = 0,
		currentPos = 0,
		planet;
	for (var i = 0; i < this.planets().length; i++) {
		planet = this.planets()[i];
		if (currentPlanet.team != planet.team ||
			planet.team.name == currentPlanet.team.name && (planet.health < 100 || planet.currentSize < planet.maxSize)) {
			if (Math.pow(planet.x - currentPlanet.x, 2) + Math.pow(planet.y - currentPlanet.y, 2) < currentDistance || currentDistance == 0) {
				currentDistance = Math.pow(planet.x - currentPlanet.x, 2) + Math.pow(planet.y - currentPlanet.y, 2);
				currentPos = i;
			}
		}
	}
	return this.planets()[currentPos];
};

function render() {
	game.update();
}
var game;
$(function() {
	if ( !window.requestAnimationFrame ) {

		window.requestAnimationFrame = ( function() {

			return window.webkitRequestAnimationFrame ||
					window.mozRequestAnimationFrame ||
					window.oRequestAnimationFrame ||
					window.msRequestAnimationFrame ||
					function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

						window.setTimeout( callback, 1000 / 60 );

					};

			} )();

	}
	TWEEN.start();
	var canvas = document.getElementById("main");
	var context = canvas.getContext("2d");
	var planetContext = document.getElementById("planets").getContext("2d");
	
	game = new Game(context, canvas, planetContext);
	
	var blueTeam = new Team('Blue', 'blue', '#37FDFC');
	blueTeam.addPlanet(new Planet(3, 400, 100));
	
	var redTeam = new Team('Red', 'red', '#FFC1C1');
	redTeam.addPlanet(new Planet(3, 400, 500));
	
	var yellowTeam = new Team('Yellow', 'yellow', 'orange');
	yellowTeam.addPlanet(new Planet(3, 700, 300));
	
	var greenTeam = new Team('Green', 'green', 'lightgreen');
	greenTeam.addPlanet(new Planet(3, 100, 300));
	
	var noTeam = new Team(null, 'rgba(139, 137, 137, .35)', null);
	noTeam.addPlanet(new Planet(1, 350, 450));
	noTeam.addPlanet(new Planet(1, 450, 450));
	noTeam.addPlanet(new Planet(1, 350, 150));
	noTeam.addPlanet(new Planet(1, 450, 150));
	noTeam.addPlanet(new Planet(2, 400, 300));
	noTeam.addPlanet(new Planet(1, 650, 250));
	noTeam.addPlanet(new Planet(1, 650, 350));
	noTeam.addPlanet(new Planet(1, 150, 250));
	noTeam.addPlanet(new Planet(1, 150, 350));
	
	game.teams = [redTeam, yellowTeam, greenTeam, noTeam, blueTeam];
	//game.setPlanets([new Planet(3, 400, 100, "blue"), new Planet(3, 400, 500, "red"), new Planet(1, 350, 450, "none"), new Planet(1, 450, 450, "none"), new Planet(1, 350, 150, "none"), new Planet(1, 450, 150, "none"), new Planet(2, 400, 300, 'none'), new Planet(3, 700, 300, 'orange'), new Planet(1, 650, 250, 'none'), new Planet(1, 650, 350, 'none'), new Planet(3, 100, 300, 'green'), new Planet(1, 150, 250, 'none'), new Planet(1, 150, 350, 'none')];
	//game.separateInitialPlanets();
	game.draw();
	game.updateTimer = setInterval(render, 1000);

	$(canvas).mousemove(function(e) {
		if (!game.paused) {
			game.x = e.pageX - this.offsetLeft;
			game.y = e.pageY - this.offsetTop;
		}
	}).mousedown(function(e) {
		if (!game.paused) {
			game.selectedWorkers.length = 0;
			/*for (var i = 0; i < game.workers.length; i++) {
				var worker = game.workers[i];
				if (worker.team == 'blue' && Math.pow(game.x - worker.x,2) + Math.pow(game.y - worker.y,2) <= Math.pow(game.cursorRadius,2)) {
					game.selectedWorkers.push(worker);
				}
			}*/
			var team = game.getTeam('Blue');
			for (var i = 0; i < team.workers.length; i++) {
				var worker = team.workers[i];
				if (Math.pow(game.x - worker.x,2) + Math.pow(game.y - worker.y,2) <= Math.pow(game.cursorRadius,2)) {
					game.selectedWorkers.push(worker);
				}
			}
		}
	}).mouseup(function(e) {
		if (!game.paused) {
			for (var i = 0; i < game.selectedWorkers.length; i++) {
				var worker = game.selectedWorkers[i];
				if (game.collisionWorkers.indexOf(worker) == -1) {
					worker.animateTo(game.x, game.y);
				}
			}
		}
		
		game.selectedWorkers.length = 0;
	});
	
	$(document).keydown(function(e) {
		if (e.keyCode == 38 && game.cursorRadius < 100) {
			game.cursorRadius = game.cursorRadius+10;
			e.preventDefault();
		}
		else if (e.keyCode == 40 && game.cursorRadius > 10) {
			game.cursorRadius = game.cursorRadius-10;
			e.preventDefault();
		}
		else if (e.keyCode == 80) {
			game.pause();
		}
	});
});
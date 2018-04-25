function Team(name, planetColor, workerColor) {
	this.name = name;
	this.planetColor = planetColor;
	this.workerColor = workerColor;
	this.planets = [];
	this.workers = [];
};

Team.prototype.addPlanet = function(planet) {
	planet.setTeam(this);
	this.planets.push(planet);
};
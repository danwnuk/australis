# Australis

The current version of the game was written in 2011 while at MSOE as a side project for fun. You can view the current version of the game [here](https://danwnuk.github.io/australis).

![game screenshot](https://danwnuk.github.io/australis/game.png)

## About the Game

Currently this is a very basic, single-player and single-map game where you start out with a planet and you must destroy all other teams planets to win the game. Planets spawn workers that you are able to send into your planets to upgrade or heal them, or send at other planets to destroy or conquer them. You can conquer planets that either do not have a team or the team has been wiped out from the planet.

* You are in control of the blue planets.
* Hold left click over your workers and drag them to the location you want to send them. (used for upgrading own planets or conquering other planets)
* Clicking on a planet will also send all workers around that planet (within the reticle) into the planet to upgrade or heal it (no need to hold).
* You can send your workers to random points in space if you want to prepare a large amount of workers around a planet before you attack.
* Pause the game by pressing 'P'.

## Plans

While this game hasn't been touched since 2011, I am looking to actively start working on it again, with the following goals:

* Rewrite the game in TypeScript, tentatively using the Phaser game framework.
* * Possibly use this repo as a starting point [https://github.com/code0wl/Multiplayer-Phaser-game](https://github.com/code0wl/Multiplayer-Phaser-game)
* Add multiplayer support.
* Add ability to easily create new maps (likely through JSON files).
* Move from basic 2D shapes to actual graphics and animations.
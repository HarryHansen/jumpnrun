export const gameState = {
	refreshIntervalId: null,
	player: {
		x: 0,
		y: 710,
		width: 40,
		height: 40,
		color: "red",
		ySpeed: 0,
		onGround: false,
	},
	gravity: 0.5,
	jumpStrength: -10,
	isFloating: false,
	floatGravity: 0.1,
	floatDuration: 5000,
	currentLevel: parseInt(localStorage.getItem("level")) || 0,
	platforms: [],
	movPlatforms: [],
	coins: [],
	buttons: [],
	powerUps: [],
	spikes: [],
	goal: null,
	platRespawnTime: '',
	MAGNET_RADIUS: 150,
	MAGNET_SPEED: 10,
	magnetActive: false,
	score: 0,
	keys: {},
};

export const canvas = document.getElementById("game");
export const ctx = canvas.getContext("2d");

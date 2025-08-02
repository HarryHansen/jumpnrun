import levels from "./js/levels.js";
import { gameState, canvas } from "./js/variables.js";
import { draw } from "./js/draw.js";
import "./entwicklertools/recordUserInputs.js";
import {
	recordedInputs,
	playRecording,
} from "./entwicklertools/recordUserInputs.js";
import { checkCoinCollisions, checkButtons, checkGoal, checkPortals, checkPowerUps, checkSpikeCollision } from "./js/checkElements.js";

export function loadLevel(index) {
	let level = levels[index];
	gameState.width = level.width || 800; // default is 800, if nott specified
	gameState.height = level.height || 800; // default is 800, if nott specified
	gameState.platforms.length = 0;
	level.platforms.forEach((p) => gameState.platforms.push({ ...p }));
	gameState.movPlatforms.length = 0;
	level.movPlatforms.forEach((p) => gameState.movPlatforms.push({ ...p }));
	gameState.coins.length = 0;
	level.coins.forEach((c) => gameState.coins.push({ ...c }));
	gameState.buttons.length = 0;
	level.buttons.forEach((b) => gameState.buttons.push({ ...b }));
	gameState.powerUps.length = 0;
	level.powerUps.forEach((p) => gameState.powerUps.push({ ...p }));
	gameState.spikes.length = 0;
	level.spikes.forEach((s) => gameState.spikes.push({ ...s }));
	gameState.portals.length = 0;
	level.portals.forEach((s) => gameState.portals.push({ ...s }));
	gameState.goal = level.goal;

	gameState.platRespawnTime = level.platRespawnTime;

	gameState.player.x = 50;
	gameState.player.y = 0;
	gameState.player.ySpeed = 0;
	gameState.player.onGround = false;
	localStorage.setItem("level", index);
	console.log("level" + gameState.currentLevel);
	gameState.jumpStrength = -10; // default jump strength
	clearInterval(gameState.refreshIntervalId);
	gameState.score = 0;
	gameState.magnetActive = false;
}

document.addEventListener("keydown", (e) => (gameState.keys[e.code] = true));
document.addEventListener("keyup", (e) => (gameState.keys[e.code] = false));

function updatePlayerPosition() {
	// Update player position based on keys pressed
	if (gameState.keys["ArrowLeft"] && gameState.player.x >= 5)
		gameState.player.x -= 5;
	if (
		gameState.keys["ArrowRight"] &&
		gameState.player.x + gameState.player.width <= canvas.width - 5
	)
		gameState.player.x += 5;
	if (
		(gameState.keys["Space"] && gameState.player.onGround ) ||
		(gameState.keys["ArrowUp"] && gameState.player.onGround)
	) {
		gameState.player.ySpeed = gameState.jumpStrength;
		gameState.player.onGround = false;
	}
	if (!gameState.player.onGround) {
		gameState.player.ySpeed += gameState.isFloating
			? gameState.floatGravity
			: gameState.gravity;
		gameState.player.y += gameState.player.ySpeed;
	}
}

function checkCollisions() {
	gameState.player.onGround = false;
	// Check for collisions with platforms
	for (let plat of gameState.platforms) {
		const ignore = gameState.keys["ArrowDown"] && !plat.solid;
		if (ignore || plat.isBroken) continue;
		const playerBottom = gameState.player.y + gameState.player.height;
		const nextBottom = playerBottom + gameState.player.ySpeed;
		const onSameLevel = playerBottom <= plat.y && nextBottom >= plat.y;
		const horizontallyAligned =
			gameState.player.x + gameState.player.width > plat.x &&
			gameState.player.x < plat.x + plat.width;

		if (onSameLevel && horizontallyAligned) {
			gameState.player.y = plat.y - gameState.player.height;
			gameState.player.ySpeed = 0;
			gameState.player.onGround = true;
		}
	}
	// Prüfe bewegliche Plattformen
	for (let movPlat of gameState.movPlatforms) {
		if (movPlat.active === true) {
			const ignore = gameState.keys["ArrowDown"] && !movPlat.solid;
			if (ignore || movPlat.isBroken) continue;
			const playerBottom = gameState.player.y + gameState.player.height;
			const nextBottom = playerBottom + gameState.player.ySpeed;
			const onSameLevel = playerBottom <= movPlat.y && nextBottom >= movPlat.y;
			const horizontallyAligned =
				gameState.player.x + gameState.player.width > movPlat.x &&
				gameState.player.x < movPlat.x + movPlat.width;

			// Speichere die vorherige Position
			movPlat.previousY = movPlat.y;
			movPlat.previousX = movPlat.x;

			if (onSameLevel && horizontallyAligned) {
				gameState.player.y = movPlat.y - gameState.player.height;
				gameState.player.ySpeed = 0;
				gameState.player.onGround = true;
			}

			if (movPlat.type === "horizontalMoving") {
				if (movPlat.movingForward) {
					movPlat.x += movPlat.speed;
					if (movPlat.x >= movPlat.originalX + movPlat.range)
						movPlat.movingForward = false;
				} else {
					movPlat.x -= movPlat.speed;
					if (movPlat.x <= movPlat.originalX) movPlat.movingForward = true;
				}
			}
			if (movPlat.type === "verticalMoving") {
				if (movPlat.movingDownwards) {
					movPlat.y += movPlat.speed;
					if (movPlat.y >= movPlat.originalY) movPlat.movingDownwards = false;
				} else {
					movPlat.y -= movPlat.speed;
					if (movPlat.y <= movPlat.originalY - movPlat.range)
						movPlat.movingDownwards = true;
				}
			}

			if (isStandingOnPlatform(gameState.player, movPlat)) {
				const deltaY = movPlat.y - movPlat.previousY;
				gameState.player.y += deltaY;
			}
			if (isStandingOnPlatform(gameState.player, movPlat)) {
				const deltaX = movPlat.x - movPlat.previousX;
				gameState.player.x += deltaX;
			}
		}
	}
}

function isStandingOnPlatform(player, platform) {
	// Check if the player is standing on the platform
	const playerBottom = player.y + player.height;
	const platformTop = platform.y;
	return (
		playerBottom <= platformTop + 5 && 
		playerBottom >= platformTop - 5 &&
		player.x + player.width > platform.x &&
		player.x < platform.x + platform.width
	);
}

function handleBreakablePlatforms() {
	for (let plat of gameState.platforms) {
		if (!plat.breakable || plat.isBroken) continue;

		const playerBottom = gameState.player.y + gameState.player.height;
		const onSameLevel =
			playerBottom <= plat.y &&
			playerBottom + gameState.player.ySpeed >= plat.y;
		const horizontallyAligned =
			gameState.player.x + gameState.player.width > plat.x &&
			gameState.player.x < plat.x + plat.width;

		if (onSameLevel && horizontallyAligned) {
			// Start the break timer if not already set
			if (!plat.breakTimer) {
				plat.breakTimer = setTimeout(() => {
					plat.isBroken = true;
					plat.breakTimer = null;

					// reset the platform after respawn time
					plat.respawnTimer = setTimeout(() => {
						plat.isBroken = false;
						plat.respawnTimer = null;
					}, gameState.platRespawnTime);
				}, plat.timeTillBreakAfterContact);
			}
		}
	}
}

function loop() {
	updatePlayerPosition();
	handleBreakablePlatforms();
	checkPowerUps();
	checkCoinCollisions();
	checkCollisions();
	checkGoal();
	checkPortals();
	checkButtons();
	checkSpikeCollision();
	draw();
	requestAnimationFrame(loop);
}

loadLevel(gameState.currentLevel);
loop();

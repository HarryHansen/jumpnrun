// import all necessary modules and variables
import { gameState } from "./variablen.js";
import levels from "./levels.js";
import {
	loadLevel,
} from "../index2.js";

export function checkCoinCollisions() {
	for (let coin of gameState.coins) {
		if (coin.collected) continue;

		const isColliding =
			gameState.player.x < coin.x + coin.width &&
			gameState.player.x + gameState.player.width > coin.x &&
			gameState.player.y < coin.y + coin.height &&
			gameState.player.y + gameState.player.height > coin.y;

		if (isColliding) {
			coin.collected = true;
			gameState.score++; // increase coin count
			// wanna play a sound here?
		}
	}
}

export function checkSpikeCollision() {
	// This function checks if the player collides with any spikes.
	// If so, it resets the level.
	for (let spike of gameState.spikes) {
		if (
			gameState.player.x < spike.x + spike.width &&
			gameState.player.x + gameState.player.width > spike.x &&
			gameState.player.y < spike.y + spike.height &&
			gameState.player.y + gameState.player.height > spike.y
		) {
			loadLevel(gameState.currentLevel);
		}
	}
}

export function checkButtons() {
	// This function checks if the player is standing on any button.
	// If so, it activates the button and reveals all hidden platforms in the same group.
	for (const button of gameState.buttons) {
		const isHorizontallyOnButton =
			gameState.player.x + gameState.player.width > button.x &&
			gameState.player.x < button.x + button.width;

		const isVerticallyOnButton =
			gameState.player.y + gameState.player.height > button.y &&
			gameState.player.y + gameState.player.height <
				button.y + button.height + 10;

		const playerStandingOnButton =
			isHorizontallyOnButton && isVerticallyOnButton;

		if (playerStandingOnButton && !button.pressed) {
			button.pressed = true;

			// Reveal all hidden platforms of the certain group
			for (const plat of gameState.platforms) {
				if (
					plat.isBroken &&
					plat.respawnTimer === null &&
					plat.group == button.targetGroup
				) {
					plat.isBroken = false;
				}
			}
			for (const movPlat of gameState.movPlatforms) {
				if (
					movPlat.isBroken &&
					movPlat.respawnTimer === null &&
					movPlat.group == button.targetGroup
				) {
					movPlat.isBroken = false;
				}
				if (!movPlat.active) {
					movPlat.active = true;
				}
			}
		}
	}
}

export function checkPowerUps() {
	// This function checks if the player collides with any power-ups.
	// If so, it activates the corresponding power-up effect and marks it as collected.
	for (const powerUp of gameState.powerUps) {
		if (
			!powerUp.collected &&
			gameState.player.x + gameState.player.width > powerUp.x &&
			gameState.player.x < powerUp.x + powerUp.width &&
			gameState.player.y + gameState.player.height > powerUp.y &&
			gameState.player.y < powerUp.y + powerUp.height
		) {
			powerUp.collected = true;

			switch (powerUp.type) {
				case "feather":
					activateFloating();
					break;
				case "magnet":
					gameState.refreshIntervalId = setInterval(updateMagnetEffect, 150);
					setTimeout(function () {
						clearInterval(gameState.refreshIntervalId);
						gameState.magnetActive = false;
					}, 30000);
					break;
				case "highJump":
					gameState.jumpStrength = -15;
					break;
				default:
					console.warn("Unbekannter Power-Up-Typ:", powerUp.type);
					break;
			}
		}
	}
}

export function checkGoal() {
	// This function checks if the player has reached the goal of the level.
	// If so, it loads the next level or - if all levels are completed - resets to the first level.
	if (
		gameState.player.x < gameState.goal.x + gameState.goal.width &&
		gameState.player.x + gameState.player.width > gameState.goal.x &&
		gameState.player.y < gameState.goal.y + gameState.goal.height &&
		gameState.player.y + gameState.player.height > gameState.goal.y &&
		allCoinsCollected()
	) {
		gameState.currentLevel++;
		if (gameState.currentLevel < levels.length) {
			loadLevel(gameState.currentLevel);
			gameState.score = 0;
		} else {
			alert("🎉 Du hast alle Level geschafft!");
			gameState.keys = {};
			gameState.score = 0;
			gameState.currentLevel = 0; // Load the first level again
			loadLevel(gameState.currentLevel);
		}
	}
}

export function checkPortals() {
	// This function iterates through all portals and checks if the player is colliding with a start portal.
	// If so, it teleports the player to the corresponding end portal of the same group
	for (let portal of gameState.portals) {
		if (
			gameState.player.x < portal.x + portal.width &&
			gameState.player.x + gameState.player.width > portal.x &&
			gameState.player.y < portal.y + portal.height &&
			gameState.player.y + gameState.player.height > portal.y &&
			portal.type === "start"
		) {
			for (let targetPortal of gameState.portals) {
				if (
					targetPortal.type === "end" &&
					targetPortal.group === portal.group
				) {
					console.log("Teleporting from: ", portal);
					console.log("Teleporting to: ", targetPortal);
					gameState.player.ySpeed = 0;
					gameState.player.x = targetPortal.x;
					gameState.player.y = targetPortal.y;
					gameState.player.ySpeed = 0; // Reset ySpeed after teleporting
					break;
				}
			}
		}
	}
}

export function activateFloating() {
	gameState.isFloating = true;

	console.log("🪂 Floating activated!");

	setTimeout(() => {
		gameState.isFloating = false;
		console.log("🪂 Stopped floating.");
	}, gameState.floatDuration);
}

export function updateMagnetEffect() {
	// This function applies the magnet effect to coins within a certain radius of the player.
	gameState.magnetActive = true;
	const { player, coins, MAGNET_RADIUS, MAGNET_SPEED } = gameState;
	for (let coin of coins) {
		let dx = player.x - coin.x;
		let dy = player.y - coin.y;
		let distance = Math.sqrt(dx * dx + dy * dy);
		if (distance < MAGNET_RADIUS) {
			let angle = Math.atan2(dy, dx);
			coin.x += Math.cos(angle) * MAGNET_SPEED;
			coin.y += Math.sin(angle) * MAGNET_SPEED;
		}
	}
}

export function allCoinsCollected() {
	return gameState.coins.every((coin) => coin.collected);
}
import { gameState, canvas, ctx } from "./variablen.js"
import levels from "./levels.js";
import { loadLevel, activateFloating, allCoinsCollected, updateMagnetEffect } from "../index2.js";

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
            gameState.score++; // wenn du eine Punktzahl hast
            // evtl. Sound abspielen oder Animation
        }
    }
}

export function checkSpikeCollision() {
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
	for (const button of gameState.buttons) {
		const isHorizontallyOnButton =
			gameState.player.x + gameState.player.width > button.x &&
			gameState.player.x < button.x + button.width;

		const isVerticallyOnButton =
			gameState.player.y + gameState.player.height > button.y &&
			gameState.player.y + gameState.player.height <
				button.y + button.height + 10; // mehr Toleranz

		const playerStandingOnButton =
			isHorizontallyOnButton && isVerticallyOnButton;

		if (playerStandingOnButton && !button.pressed) {
			button.pressed = true;

			// Alle Plattformen aktivieren, die versteckt gestartet sind
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
	for (const p of gameState.powerUps) {
		if (
			!p.collected &&
			gameState.player.x + gameState.player.width > p.x &&
			gameState.player.x < p.x + p.width &&
			gameState.player.y + gameState.player.height > p.y &&
			gameState.player.y < p.y + p.height
		) {
			p.collected = true;

			if (p.type === "highJump") {
				gameState.jumpStrength = -15;
			}
			if (p.type === "feather") {
				activateFloating();
			}
			if (p.type === "magnet") {
				gameState.refreshIntervalId = setInterval(updateMagnetEffect, 150);
				setTimeout(function () {
					clearInterval(gameState.refreshIntervalId);
					gameState.magnetActive = false;
				}, 30000);
			}
		}
	}
}

export function checkGoal() {
	// Hier wird gameState.goal verwendet statt goal
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
			gameState.currentLevel = 0; // Zurück zum ersten Level
			loadLevel(gameState.currentLevel);
		}
	}
}

export function checkPortals() {
	// Hier wird gameState.goal verwendet statt goal
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
					targetPortal.targetGroup === portal.targetGroup
				) {
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
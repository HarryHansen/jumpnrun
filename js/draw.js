import { gameState, ctx, canvas } from "./variablen.js";

export function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// Zeichne statische Plattformen
	for (let plat of gameState.platforms) {
		ctx.fillStyle = plat.isBroken ? "transparent" : plat.color;
		ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
	}
	// Zeichne Spieler
	ctx.fillStyle = gameState.player.color;
	ctx.fillRect(
		gameState.player.x,
		gameState.player.y,
		gameState.player.width,
		gameState.player.height,
	);

	// Zeichne bewegliche Plattformen
	for (let movPlat of gameState.movPlatforms) {
		ctx.fillStyle = movPlat.isBroken ? "transparent" : movPlat.color;
		ctx.fillRect(movPlat.x, movPlat.y, movPlat.width, movPlat.height);
	}
	// Zeichne Spieler nochmal (falls nötig)
	ctx.fillStyle = gameState.player.color;
	ctx.fillRect(
		gameState.player.x,
		gameState.player.y,
		gameState.player.width,
		gameState.player.height,
	);

	drawCoins(ctx);
	drawScore(ctx);
	drawGoal(ctx);
	drawLevelInfo(ctx);
	drawButtons(ctx);
	drawPowerUps(ctx);
	drawFloatingEffect(ctx, gameState.player);
	drawMagnetAura(ctx, gameState.player);
	drawSpikes(ctx);
	drawPortals(ctx);
}

function drawCoins(ctx) {
	for (let coin of gameState.coins) {
		if (!coin.collected) {
			ctx.fillStyle = "gold";
			ctx.beginPath();
			ctx.arc(
				coin.x + coin.width / 2,
				coin.y + coin.height / 2,
				coin.width / 2,
				0,
				Math.PI * 2,
			);
			ctx.fill();
		}
	}
}

function drawScore(ctx) {
	ctx.fillStyle = "black";
	ctx.font = "20px Arial";
	ctx.fillText(
		"Münzen: " + gameState.score + "/" + gameState.coins.length,
		10,
		30,
	);
}

function drawGoal(ctx) {
	if (gameState.goal) {
		ctx.fillStyle = "blue";
		ctx.fillRect(
			gameState.goal.x,
			gameState.goal.y,
			gameState.goal.width,
			gameState.goal.height,
		);
	}
}

function drawPortals(ctx) {
	for (let portal of gameState.portals) {
		ctx.fillStyle = portal.color;
		ctx.fillRect(
			portal.x,
			portal.y,
			portal.width,
			portal.height,
		);
	}
}

function drawLevelInfo(ctx) {
	ctx.fillStyle = "black";
	ctx.font = "20px Arial";
	ctx.fillText("Level: " + (gameState.currentLevel + 1), 700, 30);
}

function drawButtons(ctx) {
	for (const button of gameState.buttons) {
		ctx.fillStyle = button.pressed ? "darkred" : "red";
		ctx.fillRect(button.x, button.y, button.width, button.height);
	}
}

function drawPowerUps(ctx) {
	for (const p of gameState.powerUps) {
		if (!p.collected) {
			switch (p.type) {
				case "highJump":
					ctx.fillStyle = "orange";
					break;
				case "feather":
					ctx.fillStyle = "purple";
					break;
				case "magnet":
					ctx.fillStyle = "pink";
					break;
				default:
					ctx.fillStyle = "yellow";
					break;
			}
			ctx.beginPath();
			ctx.arc(
				p.x + p.width / 2,
				p.y + p.height / 2,
				p.width / 2,
				0,
				Math.PI * 2,
			);
			ctx.fill();
		}
	}
}

function drawSpikes(ctx) {
	ctx.fillStyle = "crimson";
	for (let spike of gameState.spikes) {
		ctx.beginPath();
		ctx.moveTo(spike.x, spike.y + spike.height);
		ctx.lineTo(spike.x + spike.width / 2, spike.y);
		ctx.lineTo(spike.x + spike.width, spike.y + spike.height);
		ctx.closePath();
		ctx.fill();
	}
}

function drawFloatingEffect(ctx, player) {
	if (gameState.isFloating) {
		ctx.save();
		ctx.globalAlpha = 0.5;
		ctx.beginPath();
		ctx.arc(
			player.x + player.width / 2,
			player.y + player.height / 2,
			30,
			0,
			Math.PI * 2,
		);
		ctx.fillStyle = "rgba(0, 117, 157, 0.59)"; // hellblau
		ctx.fill();
		ctx.restore();
	}
}

function drawMagnetAura(ctx, player) {
	if (!gameState.magnetActive) return;
	ctx.save();
	ctx.beginPath();
	ctx.arc(
		player.x + player.width / 2,
		player.y + player.height / 2,
		gameState.MAGNET_RADIUS,
		0,
		Math.PI * 2,
	);
	ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
	ctx.lineWidth = 2;
	ctx.setLineDash([5, 5]);
	ctx.stroke();
	ctx.restore();
}

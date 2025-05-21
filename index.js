import levels from "./levels.js";
import { gameState, canvas, ctx } from "./js/variablen.js";
import { draw } from "./js/draw.js";

function loadLevel(index) {
	let level = levels[index];
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
	gameState.goal = level.goal;

	/* platforms = JSON.parse(JSON.stringify(level.platforms));
	movPlatforms = JSON.parse(JSON.stringify(level.movPlatforms));
	coins = JSON.parse(JSON.stringify(level.coins));
	buttons = JSON.parse(JSON.stringify(level.buttons));
	powerUps = JSON.parse(JSON.stringify(level.powerUps));
	spikes = JSON.parse(JSON.stringify(level.spikes));
	goal = level.goal; */

	gameState.player.x = 50;
	gameState.player.y = 0;
	gameState.player.ySpeed = 0;
	gameState.player.onGround = false;
	localStorage.setItem("level", index);
	console.log("level" + gameState.currentLevel);
	gameState.jumpStrength = -10; // Änderung der Eigenschaft im gameState-Objekt
	clearInterval(gameState.refreshIntervalId);
	gameState.score = 0;
	gameState.magnetActive = false;
}

document.addEventListener("keydown", (e) => (gameState.keys[e.code] = true));
document.addEventListener("keyup", (e) => (gameState.keys[e.code] = false));

function update() {
	// Hier wird gameState.player verwendet statt player
	if (gameState.keys["ArrowLeft"] && gameState.player.x >= 5)
		gameState.player.x -= 5;
	if (
		gameState.keys["ArrowRight"] &&
		gameState.player.x + gameState.player.width <= canvas.width - 5
	)
		gameState.player.x += 5;
	if (
		(gameState.keys["Space"] && gameState.player.onGround) ||
		(gameState.keys["ArrowUp"] && gameState.player.onGround)
	) {
		gameState.player.ySpeed = gameState.jumpStrength;
		gameState.player.onGround = false;
	}
	if (!gameState.player.onGround) {
		// Nutze gameState.gravity und gameState.floatGravity, ggf. auch gameState.isFloating
		gameState.player.ySpeed += gameState.isFloating
			? gameState.floatGravity
			: gameState.gravity;
		gameState.player.y += gameState.player.ySpeed;
	}
}

function checkCollisions() {
	gameState.player.onGround = false;
	// Prüfe statische Plattformen
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
	const playerBottom = player.y + player.height;
	const platformTop = platform.y;
	return (
		playerBottom <= platformTop + 5 && // etwas Spielraum
		playerBottom >= platformTop - 5 &&
		player.x + player.width > platform.x &&
		player.x < platform.x + platform.width
	);
}

function checkCoinCollisions() {
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

function checkSpikeCollision() {
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
			// Timer starten, wenn noch keiner läuft
			if (!plat.breakTimer) {
				plat.breakTimer = setTimeout(() => {
					plat.isBroken = true;
					plat.breakTimer = null;

					// Nach 5 Sekunden respawnen
					plat.respawnTimer = setTimeout(() => {
						plat.isBroken = false;
						plat.respawnTimer = null;
					}, 5000);
				}, 2000);
			}
		}
	}
}

function checkButtons() {
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

function checkPowerUps() {
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

function allCoinsCollected() {
	return gameState.coins.every((coin) => coin.collected);
}

// === Schwebe-Effekt aktivieren ===
function activateFloating() {
	gameState.isFloating = true;

	// Optional: Partikel- oder Soundeffekt starten
	console.log("🪂 Schwebe-Feder aktiviert!");

	setTimeout(() => {
		gameState.isFloating = false;
		console.log("🪂 Schwebe-Effekt vorbei.");
	}, gameState.floatDuration);
}

function updateMagnetEffect() {
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

function checkGoal() {
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
		}
	}
}

function loop() {
	update();
	handleBreakablePlatforms();
	checkPowerUps();
	checkCoinCollisions();
	checkCollisions();
	checkGoal();
	checkButtons();
	checkSpikeCollision();
	draw();
	requestAnimationFrame(loop);
}

loadLevel(gameState.currentLevel);
loop();

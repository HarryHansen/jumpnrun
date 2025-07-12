import { gameState, canvas, ctx } from "../js/variablen.js";
import { loadLevel } from "../index2.js";

export let recordedInputs = [];

if (!localStorage.getItem("recordedInputs")) {
	recordedInputs = [
		{ type: "keyup", code: "KeyR", time: 77 },
		{ type: "keydown", code: "ArrowUp", time: 5385 },
		{ type: "keydown", code: "ArrowLeft", time: 5386 },
		{ type: "keyup", code: "ArrowLeft", time: 5848.000000000002 },
		{ type: "keyup", code: "ArrowUp", time: 5869 },
		{ type: "keydown", code: "ArrowRight", time: 6300.000000000002 },
		{ type: "keydown", code: "ArrowUp", time: 6306 },
		{ type: "keyup", code: "ArrowUp", time: 6645 },
		{ type: "keyup", code: "ArrowRight", time: 6676 },
		{ type: "keydown", code: "ArrowUp", time: 7162.000000000002 },
		{ type: "keydown", code: "ArrowRight", time: 7168 },
		{ type: "keyup", code: "ArrowRight", time: 7421 },
		{ type: "keyup", code: "ArrowUp", time: 7426 },
		{ type: "keydown", code: "ArrowRight", time: 7825 },
		{ type: "keyup", code: "ArrowRight", time: 7962 },
		{ type: "keydown", code: "ArrowRight", time: 8264 },
		{ type: "keydown", code: "ArrowUp", time: 8268.000000000002 },
		{ type: "keyup", code: "ArrowUp", time: 8601.000000000002 },
		{ type: "keyup", code: "ArrowRight", time: 8625 },
		{ type: "keydown", code: "ArrowRight", time: 8864.000000000002 },
		{ type: "keyup", code: "ArrowRight", time: 8995.000000000002 },
		{ type: "keydown", code: "ArrowUp", time: 9913 },
		{ type: "keydown", code: "ArrowRight", time: 9914 },
		{ type: "keyup", code: "ArrowRight", time: 10248 },
		{ type: "keyup", code: "ArrowUp", time: 10278 },
		{ type: "keydown", code: "ArrowRight", time: 10526 },
		{ type: "keyup", code: "ArrowRight", time: 10659 },
		{ type: "keydown", code: "ArrowRight", time: 11143 },
		{ type: "keydown", code: "ArrowUp", time: 11165 },
		{ type: "keyup", code: "ArrowUp", time: 11495 },
		{ type: "keyup", code: "ArrowRight", time: 11499 },
		{ type: "keydown", code: "ArrowRight", time: 12153 },
		{ type: "keydown", code: "ArrowUp", time: 12165 },
		{ type: "keyup", code: "ArrowUp", time: 12465 },
		{ type: "keyup", code: "ArrowRight", time: 12493 },
		{ type: "keydown", code: "KeyS", time: 15065 },
	];
} else {
	recordedInputs = JSON.parse(localStorage.getItem("recordedInputs"));
}
console.log("Aufgezeichnete Eingaben:", recordedInputs);
let isRecording = false;
let startTime = 0;

function startRecording() {
	isRecording = true;
	// recordedInputs = [];
	console.log("Aufzeichnung gestartet...");
	startTime = performance.now();
}

function stopRecording() {
	isRecording = false;
	console.log("Aufzeichnung gestoppt.");
	console.log("Aufgezeichnete Eingaben:", recordedInputs);
	localStorage.setItem("recordedInputs", JSON.stringify(recordedInputs));
}

window.addEventListener("keydown", (e) => {
	if (isRecording) {
		recordedInputs.push({
			type: "keydown",
			code: e.code,
			time: performance.now() - startTime,
		});
	}
});

window.addEventListener("keyup", (e) => {
	if (isRecording) {
		recordedInputs.push({
			type: "keyup",
			code: e.code,
			time: performance.now() - startTime,
		});
		localStorage.setItem("recordedInputs", JSON.stringify(recordedInputs));
	}
});

// Beispiel: Tastenkombinationen zur Steuerung
window.addEventListener("keydown", (e) => {
	if (e.key === "r") startRecording(); // R für "record"
	if (e.key === "s") stopRecording(); // S für "stop"
	if (e.key === "p") playRecording(); // P für "play"
	if (e.key === "l") loadLevel(gameState.currentLevel); // L für "load current level"
	if (e.key === "c") {
		recordedInputs = [];
		localStorage.removeItem("recordedInputs");
		console.log("Aufgezeichnete Eingaben gelöscht.");
	}
	if (e.key === "-") {
		e.preventDefault();
		console.log("Minus-Taste gedrückt");
		let confirmed = confirm("Bist du sicher, dass du das Spiel zurücksetzen möchtest? Alle Fortschritte gehen verloren.");
		console.log(confirmed);
		if(confirmed) {
			localStorage.removeItem("level");
			gameState.currentLevel = 0;
			loadLevel(gameState.currentLevel);
			console.log("Spiel zurückgesetzt.");
			location.reload();
		}
	}
	if (e.key === "g") console.log("Aufgezeichnete Eingaben:", recordedInputs);
});

export function playRecording() {
	console.log("Wiedergabe der aufgezeichneten Eingaben...");
	for (let input of recordedInputs) {
		setTimeout(() => {
			if (input.type === "keydown") {
				gameState.keys[input.code] = true;
			} else if (input.type === "keyup") {
				gameState.keys[input.code] = false;
			}
		}, input.time);
	}
	console.log("Ende der Wiedergabe.");
}

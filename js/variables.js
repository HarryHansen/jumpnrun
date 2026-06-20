import Character from "./Character.js";

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
        characterID: 0,
    },
    character: new Character(),
    gravity: 0.5,
    jumpStrength: -10,
    isFloating: false,
    floatGravity: 0.1,
    floatDuration: 5000,
    currentLevel: parseInt(localStorage.getItem("level")) || 0,
    overallCollectedCoins:
        parseInt(localStorage.getItem("overallCollectedCoins")) || 0,
    platforms: [],
    movPlatforms: [],
    coins: [],
    buttons: [],
    powerUps: [],
    spikes: [],
    portals: [],
    goal: null,
    height: 800,
    width: 800,
    platRespawnTime: "",
    magnetRadius: 150,
    magnetSpeed: 10,
    magnetActive: false,
    score: 0,
    keys: {},
};

export const canvas = document.getElementById("game");
export const ctx = canvas.getContext("2d");

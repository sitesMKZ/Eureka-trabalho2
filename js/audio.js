let audioCtx = null;

function initAudio() { 
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); 
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function audioClick() {
    initAudio(); if (!audioCtx) return;
    let osc = audioCtx.createOscillator(); let gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(500, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    osc.start(); osc.stop(audioCtx.currentTime + 0.08);
}

function audioBuild() {
    initAudio(); if (!audioCtx) return;
    let osc = audioCtx.createOscillator(); let gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(250, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(750, audioCtx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
    osc.start(); osc.stop(audioCtx.currentTime + 0.18);
}

function audioError() {
    initAudio(); if (!audioCtx) return;
    let osc = audioCtx.createOscillator(); let gain = audioCtx.createGain();
    osc.type = 'sawtooth'; osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(110, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    osc.start(); osc.stop(audioCtx.currentTime + 0.25);
}

function audioCrisis() {
    initAudio(); if (!audioCtx) return;
    let osc = audioCtx.createOscillator(); let gain = audioCtx.createGain();
    osc.type = 'triangle'; osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(380, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(120, audioCtx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
    osc.start(); osc.stop(audioCtx.currentTime + 0.35);
}

function audioEndGame(victory) {
    initAudio(); if (!audioCtx) return;
    let osc = audioCtx.createOscillator(); let gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    let now = audioCtx.currentTime;
    if(victory) {
        osc.frequency.setValueAtTime(440, now); osc.frequency.setValueAtTime(554, now + 0.1);
        osc.frequency.setValueAtTime(659, now + 0.2); osc.frequency.setValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    } else {
        osc.frequency.setValueAtTime(220, now); osc.frequency.linearRampToValueAtTime(70, now + 0.5);
        gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    }
    osc.start(); osc.stop(now + 0.5);
}

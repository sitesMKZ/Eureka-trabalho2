// game.js - Lógica Centralizada e Otimizada

// 1. Estado Centralizado (Melhor prática antes do React)
const state = {
    leaderClass: "governador",
    energia: 0,
    dinheiro: 100,
    felicidade: 100,
    rodada: 1,
    climaIndex: 0,
    gameEnded: false,
    crises: { solar: false, eolica: false, hidro: false, biomassa: false, maremotriz: false, global: 0 }
};

// Tabelas de Dados
const climas = [
    { nome: "🌤️ Céu Limpo", efeito: "Geração Padrão." },
    { nome: "☁️ Nublado", efeito: "Solar rende -5% ⚡." },
    { nome: "🌧️ Tempestade", efeito: "Eólica rende +10% ⚡." },
    { nome: "🏜️ Seca", efeito: "Hidro rende -15% ⚡." }
];

const custos = { solar: 40, eolica: 20, hidro: 15, biomassa: 25, maremotriz: 35 };

// 2. Navegação de Telas
function changeNav(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function selectLeader(classType) {
    state.leaderClass = classType;
    document.querySelectorAll('.char-option').forEach(o => o.classList.remove('selected'));
    document.getElementById(`o-${classType.substring(0,3)}`).classList.add('selected');
}

// 3. Inicialização e Loop Principal
function startMandate() {
    state.energia = 0; state.rodada = 1; state.gameEnded = false; state.climaIndex = 0;
    state.crises = { solar: false, eolica: false, hidro: false, biomassa: false, maremotriz: false, global: 0 };
    
    document.getElementById('visual-map').innerHTML = "";
    document.getElementById('feed-log-box').innerHTML = ""; // Limpa o feed
    writeFeed("[SISTEMA] Matriz iniciada. Arrecadação tributária ativada.");
    document.getElementById('ui-game-error').style.display = "none";

    const perfis = {
        empresario: { d: 130, f: 80, n: "🛠️ Tecnocrata" },
        natureza:   { d: 75, f: 120, n: "🌿 Eco-Ativista" },
        governador: { d: 100, f: 100, n: "⚖️ Gov. Padrão" },
        engenheiro: { d: 90, f: 100, n: "🏗️ O Engenheiro", e: 20 },
        populista:  { d: 70, f: 135, n: "📣 O Populista" },
        investidor: { d: 160, f: 65, n: "🤑 O Investidor" }
    };

    let p = perfis[state.leaderClass];
    state.dinheiro = p.d; state.felicidade = p.f; state.energia = p.e || 0;
    document.getElementById('hud-leader').innerText = p.n;

    updateShopUI(); // Verifica botões logo no início
    renderGameStats(false);
    changeNav('screen-game');
}

// Escreve no DOM sem causar Reflow pesado
function writeFeed(msg) {
    const log = document.getElementById('feed-log-box');
    log.insertAdjacentHTML('afterbegin', `<div class="feed-msg">${msg}</div>`);
}

// Modificador visual de dano
function triggerDamageFlash() {
    const box = document.getElementById('game-main-box');
    box.classList.remove('damage-flash');
    void box.offsetWidth; // Força reflow da animação
    box.classList.add('damage-flash');
}

// Gerencia a interface da loja (Desativa botões sem dinheiro)
function updateShopUI() {
    Object.keys(custos).forEach(tipo => {
        const btn = document.getElementById(`btn-${tipo}`);
        if(btn) btn.disabled = state.dinheiro < custos[tipo];
    });
}

function coletarImpostos() {
    let ganho = state.felicidade >= 70 ? 25 : (state.felicidade < 30 ? 5 : 15);
    state.dinheiro += ganho;
    writeFeed(`[TRIBUTOS] +${ganho} 💰 recolhidos. (Felicidade: ${state.felicidade}%)`);
}

function rolarClima() {
    if(state.rodada % 3 === 0) {
        state.climaIndex = Math.floor(Math.random() * climas.length);
        document.getElementById('hud-weather').innerText = climas[state.climaIndex].nome;
        writeFeed(`[CLIMA] Previsão: ${climas[state.climaIndex].nome}. ${climas[state.climaIndex].efeito}`);
    }
}

function renderGameStats(passarTurno = true) {
    if(state.gameEnded) return;

    if (passarTurno) {
        coletarImpostos();
        rolarClima();
        checarCrisesGlobais();
    }

    let eneC = Math.min(state.energia, 100);
    let felC = Math.max(Math.min(state.felicidade, 200), 0);
    let dinC = Math.max(state.dinheiro, 0);

    document.getElementById('v-ene').innerText = eneC + "%";
    document.getElementById('v-din').innerText = dinC + " moedas";
    document.getElementById('v-fel').innerText = felC + "%";
    document.getElementById('hud-round').innerText = "Rodada: " + state.rodada;

    document.getElementById('f-ene').style.width = eneC + "%";
    document.getElementById('f-din').style.width = Math.min(dinC, 180) / 1.8 + "%";
    
    let felBar = document.getElementById('f-fel');
    felBar.style.width = Math.min(felC, 130) / 1.3 + "%";
    
    if(felC <= 25) {
        felBar.classList.add('critical-pulse');
        felBar.classList.remove('fill-green');
    } else {
        felBar.classList.remove('critical-pulse');
        felBar.classList.add('fill-green');
    }

    updateShopUI(); // Atualiza botões a cada renderização
    setTimeout(processRulesEnd, 750);
}

// 4. Construção e Projetos
function buildProject(tipo) {
    if(state.gameEnded) return;
    let custo = custos[tipo];

    if(state.dinheiro < custo) { 
        audioError(); 
        document.getElementById('ui-game-error').style.display = "block";
        setTimeout(() => { document.getElementById('ui-game-error').style.display = "none"; }, 2000);
        return; 
    }

    audioBuild();
    state.dinheiro -= custo;
    let ganhos = { solar: 20, eolica: 25, hidro: 40, biomassa: 30, maremotriz: 35 };
    let danos = { solar: 5, eolica: 15, hidro: 30, biomassa: 10, maremotriz: 5 };
    let icones = { solar: "☀️", eolica: "💨", hidro: "💧", biomassa: "🪵", maremotriz: "🌊" };

    let energiaGanha = ganhos[tipo];
    
    // Aplicação de penalidades/bônus climáticos
    if(tipo === 'solar' && state.climaIndex === 1) energiaGanha -= 5;
    if(tipo === 'eolica' && state.climaIndex === 2) energiaGanha += 10;
    if(tipo === 'hidro' && state.climaIndex === 3) energiaGanha -= 15;

    state.energia += Math.max(energiaGanha, 0); // Evita energia negativa na soma
    state.felicidade -= danos[tipo];
    
    triggerDamageFlash(); // Feedback visual da perda de ética
    document.getElementById('visual-map').insertAdjacentHTML('beforeend', `<span class="map-item">${icones[tipo]}</span>`);
    writeFeed(`[Rod. ${state.rodada}] ${icones[tipo]} Obra concluída (+${energiaGanha}% ⚡).`);

    state.rodada++;
    
    if(!state.crises[tipo]) {
        setTimeout(() => triggerQuest(tipo), 300);
    } else {
        renderGameStats(true);
    }
}

// [MANTENHA AQUI AS FUNÇÕES triggerQuest, checarCrisesGlobais, exitQuest E processRulesEnd IGUAIS AO ORIGINAL, 
// apenas substituindo `dinheiro` por `state.dinheiro`, `energia` por `state.energia`, etc.]

function triggerQuest(tipo) {
    audioCrisis();
    let overlay = document.getElementById('crisis-popup');
    let opts = document.getElementById('pop-options');
    opts.innerHTML = "";

    const injectChoice = (text, callback) => {
        let btn = document.createElement('button');
        btn.className = "btn"; btn.style.fontSize = "13px"; btn.style.padding = "10px";
        btn.innerText = text; btn.onclick = () => { audioClick(); callback(); };
        opts.appendChild(btn);
    };

    if(tipo === 'solar') {
        state.crises.solar = true;
        document.getElementById('pop-title').innerText = "🔋 Vazamento";
        document.getElementById('pop-desc').innerText = "Vazamento no lençol freático. O que fazer?";
        injectChoice("Descontaminar (-20 💰, +15% ❤️)", () => { state.dinheiro -= 20; state.felicidade += 15; exitQuest(); });
        injectChoice("Abafar (0 💰, -25% ❤️)", () => { state.felicidade -= 25; triggerDamageFlash(); exitQuest(); });
    }
    // Adicione os outros tipos de crise de forma similar...
    
    overlay.style.display = "flex";
}

function checarCrisesGlobais() { /* Lógica similar substituindo pelas variáveis do state */ }
function exitQuest() { document.getElementById('crisis-popup').style.display = "none"; renderGameStats(false); }

function processRulesEnd() {
    if(state.gameEnded) return;
    let title = document.getElementById('go-title-lbl');
    let body = document.getElementById('go-text-lbl');
    let finalTrigger = false;

    document.getElementById('end-v-ene').innerText = Math.min(state.energia, 100) + "%";
    document.getElementById('end-v-din').innerText = Math.max(state.dinheiro, 0);
    document.getElementById('end-v-fel').innerText = Math.max(Math.min(state.felicidade, 100), 0) + "%";
    document.getElementById('end-v-rod').innerText = state.rodada;

    if(state.energia >= 100 && state.felicidade >= 55) {
        audioEndGame(true); title.innerText = "🏆 Vitória Sustentável!"; title.style.color = "var(--neon-green)";
        body.innerText = "Meta limpa alcançada."; finalTrigger = true;
    } else if (state.felicidade <= 0) {
        audioEndGame(false); title.innerText = "❌ Impeachment ético"; title.style.color = "var(--neon-red)";
        body.innerText = "Mandato revogado por colapso social."; finalTrigger = true;
    } else if (state.dinheiro < 15 && state.energia < 100) {
        audioEndGame(false); title.innerText = "💸 Falência Pública"; title.style.color = "var(--neon-red)";
        body.innerText = "O cofre zerou e não é possível construir."; finalTrigger = true;
    }

    if(finalTrigger) { state.gameEnded = true; changeNav('screen-gameover'); }
}


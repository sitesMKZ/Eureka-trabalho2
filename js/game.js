// js/game.js - Estado Centralizado e Loop do Jogo

const state = {
    player: { name: "", avatar: "👨‍💼" },
    leaderClass: "governador",
    energia: 0, dinheiro: 100, felicidade: 100,
    rodada: 1, climaAtual: null, gameEnded: false,
    crisesFixas: { solar: false, eolica: false, hidro: false, biomassa: false, maremotriz: false }
};

const custos = { solar: 40, eolica: 20, hidro: 15, biomassa: 25, maremotriz: 35 };

window.onload = () => {
    const savedProfile = localStorage.getItem('ecotopia_profile');
    if (savedProfile) {
        state.player = JSON.parse(savedProfile);
        changeNav('screen-menu');
    } else { changeNav('screen-login'); }
};

function selectAvatar(element, icon) {
    document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    state.player.avatar = icon;
}

function saveProfile() {
    const inputName = document.getElementById('input-player-name').value.trim();
    if (inputName === "") {
        audioError();
        document.getElementById('input-player-name').style.borderColor = "var(--neon-red)";
        setTimeout(() => document.getElementById('input-player-name').style.borderColor = "rgba(255, 255, 255, 0.1)", 1000);
        return;
    }
    state.player.name = inputName;
    localStorage.setItem('ecotopia_profile', JSON.stringify(state.player));
    if(!localStorage.getItem('ecotopia_trophies')) {
        localStorage.setItem('ecotopia_trophies', JSON.stringify({ utopia: false, ironHand: false, survivor: false }));
    }
    changeNav('screen-menu');
}

function resetProfile() {
    localStorage.removeItem('ecotopia_profile');
    localStorage.removeItem('ecotopia_trophies');
    document.getElementById('input-player-name').value = "";
    changeNav('screen-login');
}

function changeNav(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function selectLeader(classType) {
    state.leaderClass = classType;
    document.querySelectorAll('.char-option').forEach(o => o.classList.remove('selected'));
    document.getElementById(`o-${classType.substring(0,3)}`).classList.add('selected');
}

function openTrophies() {
    document.getElementById('display-name').innerText = state.player.name;
    document.getElementById('display-avatar').innerText = state.player.avatar;
    const trophies = JSON.parse(localStorage.getItem('ecotopia_trophies')) || { utopia: false, ironHand: false, survivor: false };
    const list = document.getElementById('trophy-list');
    
    list.innerHTML = `
        <div class="trophy-card ${trophies.utopia ? 'unlocked' : ''}">
            <div class="trophy-icon">🕊️</div><div class="trophy-info"><h4>Utopia Pura</h4><p>Vença com 100% ⚡ mantendo a Felicidade > 90%.</p></div>
        </div>
        <div class="trophy-card ${trophies.ironHand ? 'unlocked' : ''}">
            <div class="trophy-icon">🦾</div><div class="trophy-info"><h4>Mão de Ferro</h4><p>Vença com 1% a 10% de Felicidade.</p></div>
        </div>
        <div class="trophy-card ${trophies.survivor ? 'unlocked' : ''}">
            <div class="trophy-icon">🪙</div><div class="trophy-info"><h4>Gestor Milagreiro</h4><p>Vença terminando com 0 💰 no caixa.</p></div>
        </div>`;
    changeNav('screen-trophies');
}

function startMandate() {
    state.energia = 0; state.rodada = 1; state.gameEnded = false;
    state.crisesFixas = { solar: false, eolica: false, hidro: false, biomassa: false, maremotriz: false };
    
    document.getElementById('visual-map').innerHTML = "";
    document.getElementById('feed-log-box').innerHTML = "";
    document.getElementById('ui-game-error').style.display = "none";
    state.climaAtual = climas[0];

    const perfis = {
        empresario: { d: 130, f: 80 }, natureza: { d: 75, f: 120 }, governador: { d: 100, f: 100 },
        engenheiro: { d: 90, f: 100, e: 20 }, populista: { d: 70, f: 135 }, investidor: { d: 160, f: 65 }
    };
    let p = perfis[state.leaderClass];
    state.dinheiro = p.d; state.felicidade = p.f; state.energia = p.e || 0;
    
    document.getElementById('hud-leader').innerText = `${state.player.avatar} ${state.player.name}`;
    writeFeed("[SISTEMA] Matriz iniciada. Arrecadação ativada.");
    
    updateShopUI();
    renderGameStats(false);
    changeNav('screen-game');
}

function writeFeed(msg) {
    const log = document.getElementById('feed-log-box');
    log.insertAdjacentHTML('afterbegin', `<div class="feed-msg">${msg}</div>`);
}

function triggerDamageFlash() {
    const box = document.getElementById('game-main-box');
    box.classList.remove('damage-flash');
    void box.offsetWidth; 
    box.classList.add('damage-flash');
}

function updateShopUI() {
    Object.keys(custos).forEach(tipo => {
        const btn = document.getElementById(`btn-${tipo}`);
        if(btn) btn.disabled = state.dinheiro < custos[tipo];
    });
}

function coletarImpostos() {
    let ganho = state.felicidade >= 70 ? 25 : (state.felicidade < 30 ? 5 : 15);
    state.dinheiro += ganho;
    writeFeed(`[TRIBUTOS] +${ganho} 💰 recolhidos. (Caixa: ${state.dinheiro})`);
}

function mudarClimaTurno() {
    if(state.rodada % 3 === 0) {
        state.climaAtual = climas[Math.floor(Math.random() * climas.length)];
        document.getElementById('hud-weather').innerText = state.climaAtual.nome;
        writeFeed(`[METEOROLOGIA] ${state.climaAtual.nome}. ${state.climaAtual.efeito}`);
    }
}

function renderGameStats(passarTurno = true) {
    if(state.gameEnded) return;

    if (passarTurno) {
        coletarImpostos();
        mudarClimaTurno();
        rolarFeedCidadãos(); // Vem do events.js
        rolarEventosAleatorios(); // Vem do events.js
    }

    let eneC = Math.min(state.energia, 100);
    let felC = Math.max(Math.min(state.felicidade, 200), 0);
    let dinC = Math.max(state.dinheiro, 0);

    document.getElementById('v-ene').innerText = eneC + "%";
    document.getElementById('v-din').innerText = dinC;
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

    updateShopUI();
    setTimeout(processRulesEnd, 750);
}

function buildProject(tipo) {
    if(state.gameEnded) return;
    let custo = custos[tipo];

    if(state.dinheiro < custo) { 
        audioError(); 
        document.getElementById('ui-game-error').style.display = "block";
        setTimeout(() => document.getElementById('ui-game-error').style.display = "none", 2000);
        return; 
    }

    audioBuild();
    state.dinheiro -= custo;
    
    let baseEne = { solar: 20, eolica: 25, hidro: 40, biomassa: 30, maremotriz: 35 };
    let danos = { solar: 5, eolica: 15, hidro: 30, biomassa: 10, maremotriz: 5 };
    let icones = { solar: "☀️", eolica: "💨", hidro: "💧", biomassa: "🪵", maremotriz: "🌊" };

    // Aplica o Modificador do Clima Atual
    let modificadorClima = state.climaAtual.mod[tipo] || 0;
    let energiaReal = Math.max(baseEne[tipo] + modificadorClima, 0);

    state.energia += energiaReal;
    state.felicidade -= danos[tipo];
    
    if(danos[tipo] > 10) triggerDamageFlash();
    
    document.getElementById('visual-map').insertAdjacentHTML('beforeend', `<span class="map-item">${icones[tipo]}</span>`);
    writeFeed(`[Engenharia] ${icones[tipo]} Obra concluída (+${energiaReal}% ⚡).`);

    state.rodada++;
    
    // Dispara a Quest Fixa da Usina na 1ª vez
    if(!state.crisesFixas[tipo]) {
        setTimeout(() => triggerQuestFixa(tipo), 300);
    } else {
        renderGameStats(true);
    }
}

function triggerQuestFixa(tipo) {
    if (tipo === 'solar') {
        state.crisesFixas.solar = true;
        montarPopup("🔋 Vazamento de Silício", "Metais vazaram na água. Como agir?", [
            { txt: "Descontaminar (-20 💰, +15% ❤️)", acao: () => { state.dinheiro -= 20; state.felicidade += 15; } },
            { txt: "Abafar caso (0 💰, -25% ❤️)", acao: () => { state.felicidade -= 25; triggerDamageFlash(); } }
        ]);
    } else if (tipo === 'eolica') {
        state.crisesFixas.eolica = true;
        montarPopup("🦜 Colisão Aviária", "As hélices afetam aves. Protestos ocorrendo.", [
            { txt: "Instalar radares (-15 💰, +20% ❤️)", acao: () => { state.dinheiro -= 15; state.felicidade += 20; } },
            { txt: "Ignorar (0 💰, -25% ❤️)", acao: () => { state.felicidade -= 25; triggerDamageFlash(); } }
        ]);
    } else if (tipo === 'hidro') {
        state.crisesFixas.hidro = true;
        montarPopup("🏠 Inundação Social", "Terras ribeirinhas alagadas.", [
            { txt: "Financiar vilas (-25 💰, +35% ❤️)", acao: () => { state.dinheiro -= 25; state.felicidade += 35; } },
            { txt: "Desapropriar (0 💰, -45% ❤️)", acao: () => { state.felicidade -= 45; triggerDamageFlash(); } }
        ]);
    } else if (tipo === 'biomassa') {
        state.crisesFixas.biomassa = true;
        montarPopup("😷 Fuligem Tóxica", "Névoa densa causou asma na cidade.", [
            { txt: "Filtros (-15 💰, +20% ❤️)", acao: () => { state.dinheiro -= 15; state.felicidade += 20; } },
            { txt: "Mentir (0 💰, -25% ❤️)", acao: () => { state.felicidade -= 25; triggerDamageFlash(); } }
        ]);
    } else if (tipo === 'maremotriz') {
        state.crisesFixas.maremotriz = true;
        montarPopup("🎣 Cooperativas", "Pescadores boicotando os geradores.", [
            { txt: "Subsidiar frota (-20 💰, +25% ❤️)", acao: () => { state.dinheiro -= 20; state.felicidade += 25; } },
            { txt: "Polícia Naval (0 💰, -30% ❤️)", acao: () => { state.felicidade -= 30; triggerDamageFlash(); } }
        ]);
    }
}

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
        body.innerText = "Você superou catástrofes e entregou energia limpa mantendo o tecido social vivo.";
        finalTrigger = true;
    }
    else if(state.energia >= 100 && state.felicidade > 0 && state.felicidade < 55) {
        audioEndGame(true); title.innerText = "⚠️ Distopia de Neon"; title.style.color = "var(--neon-amber)";
        body.innerText = "100% de energia, mas a cidade é uma distopia industrial. As pessoas vivem presas às máquinas.";
        finalTrigger = true;
    }
    else if(state.felicidade <= 0) {
        audioEndGame(false); title.innerText = "❌ Impeachment ético"; title.style.color = "var(--neon-red)";
        body.innerText = "O povo destruiu a prefeitura. Você foi deposto por falha moral absoluta.";
        finalTrigger = true;
    } 
    else if(state.dinheiro < 15 && state.energia < 100) {
        audioEndGame(false); title.innerText = "💸 Falência Pública"; title.style.color = "var(--neon-red)";
        body.innerText = "Caixa zerado. As empreiteiras fugiram e a cidade apagou no escuro financeiro.";
        finalTrigger = true;
    }

    if(finalTrigger && state.energia >= 100) {
        let trophies = JSON.parse(localStorage.getItem('ecotopia_trophies')) || {};
        let ganhouAlgo = false;
        if (state.felicidade >= 90 && !trophies.utopia) { trophies.utopia = true; ganhouAlgo = true; }
        if (state.felicidade <= 10 && !trophies.ironHand) { trophies.ironHand = true; ganhouAlgo = true; }
        if (state.dinheiro === 0 && !trophies.survivor) { trophies.survivor = true; ganhouAlgo = true; }

        if(ganhouAlgo) {
            localStorage.setItem('ecotopia_trophies', JSON.stringify(trophies));
            body.innerText += "\n\n⭐ NOVO TROFÉU DESBLOQUEADO! Verifique a Galeria.";
        }
    }

    if(finalTrigger) { state.gameEnded = true; changeNav('screen-gameover'); }
}

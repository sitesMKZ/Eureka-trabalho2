// js/game.js - Estado Central, Boot Animation e Lógica de P&D (Zero Lag)

const state = {
    player: { name: "", avatar: "👨‍💼", title: "Gestor" },
    leaderClass: "governador",
    energia: 0, dinheiro: 100, felicidade: 100,
    rodada: 1, climaAtual: null, gameEnded: false,
    techLevel: 1, // NOVO: Nível de Pesquisa
    crisesFixas: { solar: false, eolica: false, hidro: false, biomassa: false, maremotriz: false }
};

const custos = { eolica: 20, biomassa: 25, hidro: 15, solar: 40, maremotriz: 35 };

// --- BOOT E LOGIN ---
window.onload = () => {
    let bootText = "INICIANDO TERMINAL ECOTOPIA...\nCARREGANDO BANCO DE DADOS...\nACESSO CONCEDIDO.";
    let el = document.getElementById('boot-text');
    let idx = 0;
    
    function typeWriter() {
        if (idx < bootText.length) {
            el.innerHTML += bootText.charAt(idx) === '\n' ? '<br/>' : bootText.charAt(idx);
            idx++;
            setTimeout(typeWriter, 40);
        } else {
            setTimeout(() => {
                const savedProfile = localStorage.getItem('ecotopia_profile');
                if (savedProfile) {
                    state.player = JSON.parse(savedProfile);
                    if(!state.player.title) state.player.title = "Gestor"; // fallback
                    changeNav('screen-menu');
                } else { 
                    changeNav('screen-login'); 
                }
            }, 800);
        }
    }
    typeWriter();
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

// --- SISTEMA DE TROFÉUS E TÍTULOS ---
function openTrophies() {
    document.getElementById('display-name').innerText = state.player.name;
    document.getElementById('display-avatar').innerText = state.player.avatar;
    document.getElementById('display-title').innerText = titlesDB[state.player.title] ? titlesDB[state.player.title].text : "[Gestor]";
    
    const trophies = JSON.parse(localStorage.getItem('ecotopia_trophies')) || { utopia: false, ironHand: false, survivor: false };
    const list = document.getElementById('trophy-list');
    
    // Atualiza Select de Títulos
    const select = document.getElementById('title-selector');
    select.innerHTML = `<option value="default">[Gestor] (Padrão)</option>`;
    if(trophies.utopia) select.innerHTML += `<option value="utopia">🕊️ O Guardião</option>`;
    if(trophies.ironHand) select.innerHTML += `<option value="ironHand">🦾 O Tirano</option>`;
    if(trophies.survivor) select.innerHTML += `<option value="survivor">🪙 Sobrevivente</option>`;
    
    // Seta a opção atual
    select.value = state.player.title;

    list.innerHTML = `
        <div class="trophy-card ${trophies.utopia ? 'unlocked' : ''}">
            <div class="trophy-icon">🕊️</div><div class="trophy-info"><h4>Utopia Pura</h4><p>Desbloqueia Título: O Guardião</p></div>
        </div>
        <div class="trophy-card ${trophies.ironHand ? 'unlocked' : ''}">
            <div class="trophy-icon">🦾</div><div class="trophy-info"><h4>Mão de Ferro</h4><p>Desbloqueia Título: O Tirano</p></div>
        </div>
        <div class="trophy-card ${trophies.survivor ? 'unlocked' : ''}">
            <div class="trophy-icon">🪙</div><div class="trophy-info"><h4>Gestor Milagreiro</h4><p>Desbloqueia Título: Sobrevivente</p></div>
        </div>`;
    changeNav('screen-trophies');
}

function equipTitle(titleId) {
    state.player.title = titleId;
    localStorage.setItem('ecotopia_profile', JSON.stringify(state.player));
    document.getElementById('display-title').innerText = titlesDB[titleId].text;
}

// --- GAMEPLAY E TECH TREE ---
function startMandate() {
    state.energia = 0; state.rodada = 1; state.techLevel = 1; state.gameEnded = false;
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
    
    let titleStr = titlesDB[state.player.title] ? titlesDB[state.player.title].text : "[Gestor]";
    document.getElementById('hud-leader').innerText = `${state.player.avatar} ${titleStr}`;
    writeFeed("[SISTEMA] Matriz iniciada. Arrecadação ativada.");
    
    applyTechLevel();
    updateShopUI();
    renderGameStats(false);
    changeNav('screen-game');
}

function researchTech() {
    if(state.dinheiro < 50) { audioError(); showWarning("Verba insuficiente para Pesquisa!"); return; }
    audioBuild();
    state.dinheiro -= 50;
    state.techLevel++;
    applyTechLevel();
    writeFeed(`🔬 Avanço Tecnológico! Nível de Pesquisa subiu para ${state.techLevel}. Novas usinas liberadas.`);
    renderGameStats(false); // não passa o turno
}

function applyTechLevel() {
    let lbl = document.getElementById('lbl-tech');
    let btn = document.getElementById('btn-research');
    let cardS = document.getElementById('card-solar');
    let cardH = document.getElementById('card-hidro');
    let cardM = document.getElementById('card-maremotriz');

    if (state.techLevel === 1) {
        lbl.innerText = "Nível 1"; btn.innerText = "Avançar (-50 💰)"; btn.disabled = false;
        cardS.classList.add('locked'); cardH.classList.add('locked'); cardM.classList.add('locked');
    } else if (state.techLevel === 2) {
        lbl.innerText = "Nível 2"; btn.innerText = "Máximo"; btn.disabled = true;
        cardS.classList.remove('locked'); cardH.classList.remove('locked'); cardM.classList.remove('locked');
        document.getElementById('btn-solar').disabled = false;
        document.getElementById('btn-hidro').disabled = false;
        document.getElementById('btn-maremotriz').disabled = false;
    }
}

function writeFeed(msg) {
    const log = document.getElementById('feed-log-box');
    log.insertAdjacentHTML('afterbegin', `<div class="feed-msg">${msg}</div>`);
}

function showWarning(msg) {
    let bar = document.getElementById('ui-game-error');
    bar.innerText = msg; bar.style.display = "block";
    setTimeout(() => bar.style.display = "none", 2000);
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
        if(btn && !document.getElementById(`card-${tipo}`)?.classList.contains('locked')) {
            btn.disabled = state.dinheiro < custos[tipo];
        }
    });
    if(state.techLevel === 1) document.getElementById('btn-research').disabled = state.dinheiro < 50;
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
    if (passarTurno) { coletarImpostos(); mudarClimaTurno(); rolarFeedCidadãos(); rolarEventosAleatorios(); }

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
    
    if(felC <= 25) { felBar.classList.add('critical-pulse'); felBar.classList.remove('fill-green'); } 
    else { felBar.classList.remove('critical-pulse'); felBar.classList.add('fill-green'); }

    updateShopUI();
    setTimeout(processRulesEnd, 750);
}

function buildProject(tipo) {
    if(state.gameEnded) return;
    let custo = custos[tipo];

    if(state.dinheiro < custo) { audioError(); showWarning("Caixa insuficiente para obra!"); return; }

    audioBuild();
    state.dinheiro -= custo;
    
    let baseEne = { solar: 20, eolica: 25, hidro: 40, biomassa: 30, maremotriz: 35 };
    let danos = { solar: 5, eolica: 15, hidro: 30, biomassa: 10, maremotriz: 5 };
    let icones = { solar: "☀️", eolica: "💨", hidro: "💧", biomassa: "🪵", maremotriz: "🌊" };

    let modificadorClima = state.climaAtual.mod[tipo] || 0;
    let energiaReal = Math.max(baseEne[tipo] + modificadorClima, 0);

    state.energia += energiaReal;
    state.felicidade -= danos[tipo];
    
    if(danos[tipo] > 10) triggerDamageFlash();
    
    document.getElementById('visual-map').insertAdjacentHTML('beforeend', `<span class="map-item">${icones[tipo]}</span>`);
    writeFeed(`[Engenharia] ${icones[tipo]} Obra concluída (+${energiaReal}% ⚡).`);

    state.rodada++;
    
    if(!state.crisesFixas[tipo]) { setTimeout(() => triggerQuestFixa(tipo), 300); } 
    else { renderGameStats(true); }
}

function triggerQuestFixa(tipo) {
    if (tipo === 'solar') {
        state.crisesFixas.solar = true;
        montarPopup("🔋 Vazamento de Silício", "Metais vazaram na água. Como agir?", [
            { txt: "Descontaminar (-20 💰)", acao: () => { state.dinheiro -= 20; } },
            { txt: "Abafar caso (-25% ❤️)", acao: () => { state.felicidade -= 25; triggerDamageFlash(); } }
        ]);
    } else if (tipo === 'eolica') {
        state.crisesFixas.eolica = true;
        montarPopup("🦜 Colisão Aviária", "As hélices afetam aves. Protestos ocorrendo.", [
            { txt: "Instalar radares (-15 💰)", acao: () => { state.dinheiro -= 15; } },
            { txt: "Ignorar (-25% ❤️)", acao: () => { state.felicidade -= 25; triggerDamageFlash(); } }
        ]);
    } else if (tipo === 'hidro') {
        state.crisesFixas.hidro = true;
        montarPopup("🏠 Inundação Social", "Terras ribeirinhas alagadas.", [
            { txt: "Financiar vilas (-25 💰)", acao: () => { state.dinheiro -= 25; } },
            { txt: "Desapropriar (-45% ❤️)", acao: () => { state.felicidade -= 45; triggerDamageFlash(); } }
        ]);
    } else if (tipo === 'biomassa') {
        state.crisesFixas.biomassa = true;
        montarPopup("😷 Fuligem Tóxica", "Névoa densa causou asma na cidade.", [
            { txt: "Filtros (-15 💰)", acao: () => { state.dinheiro -= 15; } },
            { txt: "Mentir (-25% ❤️)", acao: () => { state.felicidade -= 25; triggerDamageFlash(); } }
        ]);
    } else if (tipo === 'maremotriz') {
        state.crisesFixas.maremotriz = true;
        montarPopup("🎣 Cooperativas", "Pescadores boicotando os geradores.", [
            { txt: "Subsidiar frota (-20 💰)", acao: () => { state.dinheiro -= 20; } },
            { txt: "Força Naval (-30% ❤️)", acao: () => { state.felicidade -= 30; triggerDamageFlash(); } }
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
        body.innerText = "100% de energia, mas a cidade é uma distopia industrial. As pessoas vivem infelizes.";
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
            body.innerText += "\n\n⭐ NOVO TROFÉU DESBLOQUEADO! Vá ao Gabinete para equipar um novo título.";
        }
    }

    if(finalTrigger) { state.gameEnded = true; changeNav('screen-gameover'); }
}


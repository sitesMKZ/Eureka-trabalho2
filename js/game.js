// --- ESTADO E DADOS ---
const state = {
    player: { name: "", avatar: "👨‍💼" },
    leaderClass: "governador",
    energia: 0,
    dinheiro: 100,
    felicidade: 100,
    rodada: 1,
    climaIndex: 0,
    gameEnded: false,
    crises: { solar: false, eolica: false, hidro: false, biomassa: false, maremotriz: false, global: 0 }
};

const climas = [
    { nome: "🌤️ Céu Limpo", efeito: "Geração Padrão." },
    { nome: "☁️ Nublado", efeito: "Solar rende -5% ⚡." },
    { nome: "🌧️ Tempestade", efeito: "Eólica rende +10% ⚡." },
    { nome: "🏜️ Seca", efeito: "Hidro rende -15% ⚡." }
];

const custos = { solar: 40, eolica: 20, hidro: 15, biomassa: 25, maremotriz: 35 };

// --- SISTEMA DE LOGIN E PERFIL ---
window.onload = () => {
    const savedProfile = localStorage.getItem('ecotopia_profile');
    if (savedProfile) {
        state.player = JSON.parse(savedProfile);
        changeNav('screen-menu');
    } else {
        changeNav('screen-login');
    }
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
    changeNav('screen-login');
    document.getElementById('input-player-name').value = "";
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

// --- SISTEMA DE TROFÉUS ---
function openTrophies() {
    document.getElementById('display-name').innerText = state.player.name;
    document.getElementById('display-avatar').innerText = state.player.avatar;
    
    const trophies = JSON.parse(localStorage.getItem('ecotopia_trophies')) || { utopia: false, ironHand: false, survivor: false };
    const list = document.getElementById('trophy-list');
    
    list.innerHTML = `
        <div class="trophy-card ${trophies.utopia ? 'unlocked' : ''}">
            <div class="trophy-icon">🕊️</div>
            <div class="trophy-info">
                <h4>Utopia Pura</h4>
                <p>Vença com 100% ⚡ mantendo a Felicidade acima de 90%.</p>
            </div>
        </div>
        <div class="trophy-card ${trophies.ironHand ? 'unlocked' : ''}">
            <div class="trophy-icon">🦾</div>
            <div class="trophy-info">
                <h4>Mão de Ferro</h4>
                <p>Atingiu 100% ⚡ com exatamente 1% a 10% de Felicidade.</p>
            </div>
        </div>
        <div class="trophy-card ${trophies.survivor ? 'unlocked' : ''}">
            <div class="trophy-icon">🪙</div>
            <div class="trophy-info">
                <h4>Gestor Milagreiro</h4>
                <p>Vença a simulação terminando com 0 💰 no caixa.</p>
            </div>
        </div>
    `;
    changeNav('screen-trophies');
}

// --- LÓGICA PRINCIPAL DO JOGO ---
function startMandate() {
    state.energia = 0; state.rodada = 1; state.gameEnded = false; state.climaIndex = 0;
    state.crises = { solar: false, eolica: false, hidro: false, biomassa: false, maremotriz: false, global: 0 };
    
    document.getElementById('visual-map').innerHTML = "";
    document.getElementById('feed-log-box').innerHTML = "";
    writeFeed("[SISTEMA] Matriz iniciada. Arrecadação tributária ativada.");
    document.getElementById('ui-game-error').style.display = "none";

    const perfis = {
        empresario: { d: 130, f: 80 },
        natureza:   { d: 75, f: 120 },
        governador: { d: 100, f: 100 },
        engenheiro: { d: 90, f: 100, e: 20 },
        populista:  { d: 70, f: 135 },
        investidor: { d: 160, f: 65 }
    };

    let p = perfis[state.leaderClass];
    state.dinheiro = p.d; state.felicidade = p.f; state.energia = p.e || 0;
    document.getElementById('hud-leader').innerText = `${state.player.avatar} Gestor ${state.player.name}`;

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

    updateShopUI();
    setTimeout(processRulesEnd, 750);
}

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
    
    if(tipo === 'solar' && state.climaIndex === 1) energiaGanha -= 5;
    if(tipo === 'eolica' && state.climaIndex === 2) energiaGanha += 10;
    if(tipo === 'hidro' && state.climaIndex === 3) energiaGanha -= 15;

    state.energia += Math.max(energiaGanha, 0);
    state.felicidade -= danos[tipo];
    
    triggerDamageFlash();
    document.getElementById('visual-map').insertAdjacentHTML('beforeend', `<span class="map-item">${icones[tipo]}</span>`);
    writeFeed(`[Rod. ${state.rodada}] ${icones[tipo]} Obra concluída (+${energiaGanha}% ⚡).`);

    state.rodada++;
    
    if(!state.crises[tipo]) {
        setTimeout(() => triggerQuest(tipo), 300);
    } else {
        renderGameStats(true);
    }
}

function triggerQuest(tipo) {
    audioCrisis();
    let overlay = document.getElementById('crisis-popup');
    let pTitle = document.getElementById('pop-title');
    let pDesc = document.getElementById('pop-desc');
    let opts = document.getElementById('pop-options');
    opts.innerHTML = "";

    const injectChoice = (text, callback) => {
        let btn = document.createElement('button');
        btn.className = "btn"; btn.style.fontSize = "13px"; btn.style.padding = "10px";
        btn.innerText = text; btn.onclick = () => { audioClick(); callback(); };
        opts.appendChild(btn);
    };

    if(tipo === 'solar') {
        state.crises.solar = true; pTitle.innerText = "🔋 Vazamento de Silício";
        pDesc.innerText = "Metais pesados vazaram. A população exige saneamento. Como agir?";
        injectChoice("Descontaminar (-20 💰, +15% ❤️)", () => { state.dinheiro -= 20; state.felicidade += 15; writeFeed("🛡️ Filtros de contenção ativados."); exitQuest(); });
        injectChoice("Abafar o caso (0 💰, -25% ❤️)", () => { state.felicidade -= 25; triggerDamageFlash(); writeFeed("❌ Água contaminada adoeceu bairros."); exitQuest(); });
    }
    else if(tipo === 'eolica') {
        state.crises.eolica = true; pTitle.innerText = "🦜 Colisão Aviária";
        pDesc.innerText = "As hélices estão triturando aves. Protestos ecológicos tomaram as ruas.";
        injectChoice("Instalar radares (-15 💰, +20% ❤️)", () => { state.dinheiro -= 15; state.felicidade += 20; writeFeed("🛡️ Tecnologia de repulsão sonora ativa."); exitQuest(); });
        injectChoice("Manter rota (0 💰, -25% ❤️)", () => { state.felicidade -= 25; triggerDamageFlash(); writeFeed("❌ Multas ambientais geradas."); exitQuest(); });
    } 
    else if(tipo === 'hidro') {
        state.crises.hidro = true; pTitle.innerText = "🏠 Inundação de Reservas";
        pDesc.innerText = "A barragem vai inundar terras habitadas. Exigem compensação.";
        injectChoice("Financiar vilas (-25 💰, +35% ❤️)", () => { state.dinheiro -= 25; state.felicidade += 35; writeFeed("🏡 Famílias reassentadas."); exitQuest(); });
        injectChoice("Desapropriar (0 💰, -45% ❤️)", () => { state.felicidade -= 45; triggerDamageFlash(); writeFeed("❌ Choque de forças gerou tumulto."); exitQuest(); });
    }
    else if(tipo === 'biomassa') {
        state.crises.biomassa = true; pTitle.innerText = "😷 Fuligem Tóxica";
        pDesc.innerText = "A queima constante gerou névoa densa. Casos de asma dobraram.";
        injectChoice("Instalar filtros (-15 💰, +20% ❤️)", () => { state.dinheiro -= 15; state.felicidade += 20; writeFeed("🛡️ Chaminés devidamente filtradas."); exitQuest(); });
        injectChoice("Declarar natural (0 💰, -25% ❤️)", () => { state.felicidade -= 25; triggerDamageFlash(); writeFeed("❌ População adoece com fuligem."); exitQuest(); });
    }
    else if(tipo === 'maremotriz') {
        state.crises.maremotriz = true; pTitle.innerText = "🎣 Cooperativas Falidas";
        pDesc.innerText = "O ruído espantou cardumes. Pescadores bloquearam o mar.";
        injectChoice("Comprar barcos (-20 💰, +25% ❤️)", () => { state.dinheiro -= 20; state.felicidade += 25; writeFeed("🏡 Pescadores movidos ao alto-mar."); exitQuest(); });
        injectChoice("Força Policial (0 💰, -30% ❤️)", () => { state.felicidade -= 30; triggerDamageFlash(); writeFeed("❌ Cooperativas faliram."); exitQuest(); });
    }
    else if(tipo === 'greve_eletricistas') {
        pTitle.innerText = "⚡ Greve Geral"; pDesc.innerText = "Trabalhadores exaustos ameaçam apagão na rede.";
        injectChoice("Bônus salarial (-25 💰, +25% ❤️)", () => { state.dinheiro -= 25; state.felicidade += 25; writeFeed("🛡️ Sindicato aceitou os termos."); exitQuest(); });
        injectChoice("Cortar salários (0 💰, -20% Ene, -15% ❤️)", () => { state.energia -= 20; state.felicidade -= 15; triggerDamageFlash(); writeFeed("❌ Boicote derrubou transformadores."); exitQuest(); });
    }
    else if(tipo === 'credito_carbono') {
        pTitle.innerText = "🌱 Créditos de Carbono"; pDesc.innerText = "Auditoria internacional oferece verba pelos seus selos verdes.";
        injectChoice("Vender créditos (+45 💰, -10% ❤️)", () => { state.dinheiro += 45; state.felicidade -= 10; triggerDamageFlash(); writeFeed("💰 Moedas injetadas via fundos."); exitQuest(); });
        injectChoice("Guardar selo (0 💰, +20% ❤️)", () => { state.felicidade += 20; writeFeed("🛡️ Orgulho ecológico aumentou suporte."); exitQuest(); });
    }
    overlay.style.display = "flex";
}

function checarCrisesGlobais() {
    if(state.felicidade < 45 && state.crises.global === 0 && state.rodada >= 3) {
        state.crises.global = 1; setTimeout(() => triggerQuest('greve_eletricistas'), 400);
    }
    else if(state.dinheiro < 25 && state.crises.global <= 1 && state.energia > 30) {
        state.crises.global = 2; setTimeout(() => triggerQuest('credito_carbono'), 400);
    }
}

function exitQuest() {
    document.getElementById('crisis-popup').style.display = "none";
    renderGameStats(false);
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
        body.innerText = "Sensacional! Com raciocínio estratégico avançado, você bateu a meta de 100% de energia limpa e manteve as contas estáveis e o povo amparado.";
        finalTrigger = true;
    }
    else if(state.energia >= 100 && state.felicidade > 0 && state.felicidade < 55) {
        audioEndGame(true); title.innerText = "⚠️ Vitória Opressora"; title.style.color = "var(--neon-amber)";
        body.innerText = "A malha atingiu 100% de energia, mas sua aprovação popular despencou. Os robôs funcionam, mas as pessoas vivem infelizes sob escolhas severas.";
        finalTrigger = true;
    }
    else if(state.felicidade <= 0) {
        audioEndGame(false); title.innerText = "❌ Impeachment ético"; title.style.color = "var(--neon-red)";
        body.innerText = "Seu mandato foi revogado. Ao ignorar as crises humanas, a opinião pública derreteu e cassou seus direitos políticos por completo.";
        finalTrigger = true;
    } 
    else if(state.dinheiro < 15 && state.energia < 100) {
        audioEndGame(false); title.innerText = "💸 Falência Pública"; title.style.color = "var(--neon-red)";
        body.innerText = "Falta de planejamento fiscal. Sem verba para rodar o mercado de engenharia, a prefeitura faliu e o projeto foi cancelado.";
        finalTrigger = true;
    }

    if(finalTrigger && state.energia >= 100) {
        let trophies = JSON.parse(localStorage.getItem('ecotopia_trophies')) || {};
        let ganhouAlgo = false;

        if (state.felicidade >= 90 && !trophies.utopia) { trophies.utopia = true; ganhouAlgo = true; }
        if (state.felicidade >= 1 && state.felicidade <= 10 && !trophies.ironHand) { trophies.ironHand = true; ganhouAlgo = true; }
        if (state.dinheiro === 0 && !trophies.survivor) { trophies.survivor = true; ganhouAlgo = true; }

        if(ganhouAlgo) {
            localStorage.setItem('ecotopia_trophies', JSON.stringify(trophies));
            body.innerText += "\n\n⭐ NOVO TROFÉU DESBLOQUEADO! Verifique a Galeria.";
        }
    }

    if(finalTrigger) { state.gameEnded = true; changeNav('screen-gameover'); }
}


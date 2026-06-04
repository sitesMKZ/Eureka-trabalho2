// js/events.js - Gerenciador de UI Aleatória

function rolarFeedCidadãos() {
    let mensagem = "";
    let roll = Math.random();
    let categoria = "neutros";

    if (state.felicidade < 35 && roll < 0.6) categoria = "baixa_felicidade";
    else if (state.felicidade >= 80 && roll < 0.5) categoria = "alta_felicidade";
    else if (state.dinheiro < 25 && roll < 0.5) categoria = "falencia";
    else if (state.energia >= 80 && roll < 0.4) categoria = "alta_energia";

    let cidadao = dbNomes[Math.floor(Math.random() * dbNomes.length)];
    let texto = dbFeeds[categoria][Math.floor(Math.random() * dbFeeds[categoria].length)];
    
    mensagem = `<span style="color:var(--neon-purple); font-weight:bold;">${cidadao}</span>: ${texto}`;
    writeFeed(mensagem);
}

function montarPopup(titulo, descricao, opcoesArr) {
    let overlay = document.getElementById('crisis-popup');
    document.getElementById('pop-title').innerText = titulo;
    document.getElementById('pop-desc').innerText = descricao;
    
    let optsDiv = document.getElementById('pop-options');
    optsDiv.innerHTML = "";

    opcoesArr.forEach(opt => {
        let btn = document.createElement('button');
        btn.className = "btn";
        btn.style.padding = "12px"; btn.style.fontSize = "13px";
        btn.innerText = opt.txt;
        btn.onclick = () => {
            audioClick();
            opt.acao();
            overlay.style.display = "none";
            renderGameStats(false);
        };
        optsDiv.appendChild(btn);
    });

    overlay.style.display = "flex";
    audioCrisis();
}

function rolarEventosAleatorios() {
    for(let i = 0; i < catastrofes.length; i++) {
        let evento = catastrofes[i];
        if (state.rodada >= evento.minRodada && Math.random() < evento.chance) {
            writeFeed(`[URGENTE] Plantão da Cidade ativado.`);
            montarPopup(evento.titulo, evento.desc, evento.opts);
            return; 
        }
    }
}

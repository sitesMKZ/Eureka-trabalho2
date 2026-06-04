// js/data.js - Banco de Dados de Textos, Climas e Eventos Turbinados

const dbNomes = [
    "@lucas_verde", "@mari_revoltada", "@joao_da_obra", "@ana_sustentavel", 
    "@carlos_tech", "@bia_eco", "@pedro_b", "@micael_eng", "@zeca_bombeiro", 
    "@rita_prof", "@cyber_k", "@marcos_pescador", "@julia_med", "@tiago_gamer",
    "@sara_vegan", "@vitor_skate", "@clara_luz", "@osvaldo_apos", "@cidadao_anon",
    "@eco_guerreiro", "@capitalista_raiz", "@tecnocrata_x", "@maria_do_bairro",
    "@investidor_lobo", "@hacker_do_bem", "@prof_clima", "@sindicato_forte"
];

const dbFeeds = {
    alta_felicidade: [
        "Finalmente consigo ver as estrelas à noite de novo! 🌌",
        "A feira orgânica do centro bateu recorde de vendas hoje! 🍎",
        "Orgulho da gestão atual. A cidade respira. 🌍",
        "As praças estão cheias de crianças. Que clima bom! 🚴",
        "Os novos parques ao redor das eólicas ficaram irados. 🌳"
    ],
    baixa_felicidade: [
        "Ninguém aguenta mais esse descaso! Meus filhos tão doentes com essa fumaça! 😷",
        "Prefeito fantoche da indústria! Impeachment já! 📉",
        "Mais um protesto bloqueando a Avenida Central. Caos total. 🚧",
        "Cheiro de enxofre bizarro perto do polo industrial... 🤢",
        "Impostos absurdos pra viver nessa poluição sonora? 🤡"
    ],
    falencia: [
        "O comércio tá bombando, mas ouvi dizer que a prefeitura tá no vermelho. 💸",
        "Fui na UPA e não tem esparadrapo. Pra onde vai nosso dinheiro? 🏥",
        "Prefeitura cancelando licitação de asfalto por falta de caixa... 📉"
    ],
    alta_energia: [
        "Minha conta de luz veio quase zerada esse mês! ⚡",
        "Essa nova matriz energética atraiu 3 multinacionais pra cidade. Empregos! 🚀",
        "A cidade não dorme mais. Painéis neon por todo lado! 🌆",
        "Sobra tanta energia que a prefeitura tá vendendo pras cidades vizinhas. 🔌"
    ],
    neutros: [
        "Trânsito desviado na ponte 4 para manutenção. 🚗",
        "O time local venceu o campeonato regional hoje! ⚽",
        "Alguém viu um Yorkshire perdido perto da praça? 🐶",
        "Promoção de placas de vídeo na loja do centro. 🖥️",
        "Hoje tem teatro municipal gratuito galera! 🎭"
    ]
};

const climas = [
    { nome: "🌤️ Céu Limpo", efeito: "Geração Padrão.", mod: { solar: 0, eolica: 0, hidro: 0 } },
    { nome: "☁️ Nublado", efeito: "Solar rende -10% ⚡.", mod: { solar: -10, eolica: 0, hidro: 0 } },
    { nome: "🌧️ Tempestade", efeito: "Eólica +15% ⚡ / Solar -15% ⚡.", mod: { solar: -15, eolica: 15, hidro: 0 } },
    { nome: "🏜️ Seca Severa", efeito: "Hidro rende -20% ⚡.", mod: { solar: 5, eolica: 0, hidro: -20 } },
    { nome: "🌪️ Ventania Estrema", efeito: "Eólica rende +25% ⚡.", mod: { solar: -5, eolica: 25, hidro: 0 } },
    { nome: "🔥 Onda de Calor", efeito: "Consumo sobe. Todas rendem -10% ⚡.", mod: { solar: -10, eolica: -10, hidro: -10, biomassa: -10, maremotriz: -10 } }
];

// O "Cisne Negro" - Eventos Aleatórios Devastadores
const catastrofes = [
    {
        id: "hacker", chance: 0.05, minRodada: 4,
        titulo: "🧑‍💻 Ciberataque na Rede",
        desc: "Hackers invadiram os sistemas de distribuição. Eles exigem um resgate em moedas ou vão apagar o grid elétrico da zona leste.",
        opts: [
            { txt: "Pagar resgate (-40 💰)", acao: () => { state.dinheiro -= 40; } },
            { txt: "Reiniciar sistema à força (-30% ⚡, -15% ❤️)", acao: () => { state.energia -= 30; state.felicidade -= 15; triggerDamageFlash(); } }
        ]
    },
    {
        id: "lobby", chance: 0.08, minRodada: 3,
        titulo: "💼 O Lobby do Carvão",
        desc: "Executivos de uma velha mineradora te oferecem uma injeção absurda de dinheiro público se você afrouxar as leis ambientais hoje.",
        opts: [
            { txt: "Aceitar propina secreta (+70 💰, -40% ❤️)", acao: () => { state.dinheiro += 70; state.felicidade -= 40; triggerDamageFlash(); writeFeed("💼 Conta bancária encheu de repente..."); } },
            { txt: "Expulsá-los do Gabinete (0 💰, +20% ❤️)", acao: () => { state.felicidade += 20; writeFeed("🛡️ Povo celebrou sua integridade no jornal."); } }
        ]
    },
    {
        id: "crash", chance: 0.06, minRodada: 6,
        titulo: "📉 Crash da Bolsa Global",
        desc: "O mercado financeiro internacional despencou. O valor da sua moeda municipal derreteu da noite para o dia.",
        opts: [
            { txt: "Usar reservas pra salvar bancos (-50 💰, +10% ❤️)", acao: () => { state.dinheiro -= 50; state.felicidade += 10; } },
            { txt: "Deixar quebrar (Cortar dinheiro pela metade, -30% ❤️)", acao: () => { state.dinheiro = Math.floor(state.dinheiro / 2); state.felicidade -= 30; triggerDamageFlash(); } }
        ]
    },
    {
        id: "terremoto", chance: 0.04, minRodada: 8,
        titulo: "⚠️ Abalo Sísmico Nível 6",
        desc: "Um terremoto raro rachou as estruturas das usinas mais pesadas. A Defesa Civil exige evacuação e reparos caríssimos.",
        opts: [
            { txt: "Financiar reparo de emergência (-60 💰)", acao: () => { state.dinheiro -= 60; } },
            { txt: "Isolar a área afetada (-40% ⚡, -25% ❤️)", acao: () => { state.energia -= 40; state.felicidade -= 25; triggerDamageFlash(); } }
        ]
    }
];

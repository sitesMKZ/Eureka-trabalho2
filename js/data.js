// js/data.js - Banco de Dados de Textos e Eventos Turbinados

const dbNomes = [
    "@lucas_verde", "@mari_revoltada", "@joao_da_obra", "@ana_sustentavel", 
    "@carlos_tech", "@bia_eco", "@pedro_b", "@micael_eng", "@zeca_bombeiro", 
    "@rita_prof", "@cyber_k", "@marcos_pescador", "@julia_med", "@tiago_gamer",
    "@sara_vegan", "@vitor_skate", "@clara_luz", "@osvaldo_apos", "@cidadao_anon"
];

const dbFeeds = {
    alta_felicidade: [
        "Finalmente consigo ver as estrelas à noite de novo! 🌌",
        "A feira orgânica do centro bateu recorde de vendas hoje! 🍎",
        "Orgulho da gestão atual. A cidade respira. 🌍",
        "As praças estão cheias de crianças. Que clima bom! 🚴"
    ],
    baixa_felicidade: [
        "Ninguém aguenta mais esse descaso! Meus filhos tão doentes com essa fumaça! 😷",
        "Prefeito fantoche da indústria! Impeachment já! 📉",
        "Mais um protesto bloqueando a Avenida Central. Caos total. 🚧"
    ],
    falencia: [
        "O comércio tá bombando, mas ouvi dizer que a prefeitura tá no vermelho. 💸",
        "Fui na UPA e não tem esparadrapo. Pra onde vai nosso dinheiro? 🏥"
    ],
    alta_energia: [
        "Minha conta de luz veio quase zerada esse mês! ⚡",
        "A cidade não dorme mais. Painéis neon por todo lado! 🌆"
    ],
    neutros: [
        "Trânsito desviado na ponte 4 para manutenção. 🚗",
        "O time local venceu o campeonato regional hoje! ⚽",
        "Promoção de placas de vídeo na loja do centro. 🖥️"
    ]
};

const climas = [
    { nome: "🌤️ Céu Limpo", efeito: "Geração Padrão.", mod: { solar: 0, eolica: 0, hidro: 0 } },
    { nome: "☁️ Nublado", efeito: "Solar rende -10% ⚡.", mod: { solar: -10, eolica: 0, hidro: 0 } },
    { nome: "🌧️ Tempestade", efeito: "Eólica +15% ⚡ / Solar -15% ⚡.", mod: { solar: -15, eolica: 15, hidro: 0 } },
    { nome: "🏜️ Seca Severa", efeito: "Hidro rende -20% ⚡.", mod: { solar: 5, eolica: 0, hidro: -20 } },
    { nome: "🔥 Onda de Calor", efeito: "Consumo sobe. Todas -10% ⚡.", mod: { solar: -10, eolica: -10, hidro: -10, biomassa: -10, maremotriz: -10 } }
];

const catastrofes = [
    {
        id: "hacker", chance: 0.05, minRodada: 4,
        titulo: "🧑‍💻 Ciberataque na Rede",
        desc: "Hackers invadiram os sistemas de distribuição exigindo resgate.",
        opts: [
            { txt: "Pagar resgate (-40 💰)", acao: () => { state.dinheiro -= 40; } },
            { txt: "Reiniciar à força (-30% ⚡, -15% ❤️)", acao: () => { state.energia -= 30; state.felicidade -= 15; } }
        ]
    },
    {
        id: "lobby", chance: 0.08, minRodada: 3,
        titulo: "💼 O Lobby do Carvão",
        desc: "A velha indústria oferece uma injeção absurda de dinheiro para afrouxar leis.",
        opts: [
            { txt: "Aceitar (+70 💰, -40% ❤️)", acao: () => { state.dinheiro += 70; state.felicidade -= 40; } },
            { txt: "Expulsá-los (0 💰, +20% ❤️)", acao: () => { state.felicidade += 20; } }
        ]
    }
];

// Chave base alinhada para "Gestor"
const titlesDB = {
    "Gestor": { id: "Gestor", text: "[Gestor]" },
    "utopia": { id: "O Guardião", text: "🕊️ O Guardião" },
    "ironHand": { id: "O Tirano", text: "🦾 O Tirano" },
    "survivor": { id: "Sobrevivente", text: "🪙 Sobrevivente" }
};

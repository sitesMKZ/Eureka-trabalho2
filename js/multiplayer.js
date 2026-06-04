// multiplayer.js (Estrutura V9 Modular para Coop Local)
// IMPORTANTE: Este é o esqueleto para conectar no seu Firestore existente.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "SUA_API_AQUI",
    projectId: "seu-projeto"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função 1: Criar Sala (O Governador)
export async function createRoom(roomCode, initialState) {
    await setDoc(doc(db, "ecotopia_rooms", roomCode), initialState);
    
    // Escuta mudanças feitas pelo outro jogador
    onSnapshot(doc(db, "ecotopia_rooms", roomCode), (doc) => {
        syncUI(doc.data());
    });
}

// Função 2: Entrar na Sala (O Engenheiro)
export function joinRoom(roomCode) {
    onSnapshot(doc(db, "ecotopia_rooms", roomCode), (doc) => {
        syncUI(doc.data());
    });
}

// Função 3: Atualizar Estado (Qualquer ação no jogo)
export async function pushState(roomCode, newStateFragment) {
    const roomRef = doc(db, "ecotopia_rooms", roomCode);
    await updateDoc(roomRef, newStateFragment);
}

// Função 4: Sincronizar o Front-End
function syncUI(serverState) {
    state.energia = serverState.energia;
    state.dinheiro = serverState.dinheiro;
    // ... Chama a renderGameStats(false) para espelhar a tela
}


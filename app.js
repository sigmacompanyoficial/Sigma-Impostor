import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getDatabase, ref, set, push, onValue, get, update, child, remove } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";
import { categories } from "./words.js";
import { getCurrentUser, getUserProfile, logoutUser } from "./auth.js";
import { getTiendaItems, buyTiendaItem } from "./tienda.js";

console.log('🎮 Iniciando El Sigma Impostor - Versión Profesional');

// ==================== CONFIGURACIÓN GLOBAL ====================
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app); // Inicializar Firestore
const analytics = getAnalytics(app);

const GAME_CONFIG = {
    MAX_PLAYERS: 20,
    MIN_PLAYERS: 3,
    TURN_TIME: 30000, // Aumentado a 30 segundos para mejor jugabilidad
    ROUNDS: 2, // Cambiado a 2 rondas
    INACTIVE_TIME: 5 * 60 * 1000,
    BOT_THINK_TIME: 2000,
    BOT_MAX_THINK: 5000,
    // GARTIC_TURN_TIME: 60000, // 1 minuto para dibujar/escribir en Teléfono Roto
};

// ==================== ESTADO GLOBAL ====================
const gameState = {
    currentRoom: null,
    currentPlayerId: null,
    currentRoomData: null,
    turnInterval: null, // Para el setInterval del contador visual
    turnTimeout: null,
    wordRevealTimeout: null, // Timer for the 10-second word reveal phase
    wordRevealInterval: null, // Interval for updating the word reveal timer display
    tutorialInterval: null,
    currentTutorialStep: 1,
    soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
    isHost: false,
    gameStarted: false,
    musicVolume: parseFloat(localStorage.getItem('musicVolume')) || 0.5,
    playerCustomColor: localStorage.getItem('playerCustomColor') || null, // Color personalizado del jugador
    sfxVolume: parseFloat(localStorage.getItem('sfxVolume')) || 0.5,
    chatMuted: false,
    selectedGameMode: 'impostor', // Modo de juego por defecto
};

// ==================== ELEMENTOS DEL DOM ====================
const DOM = {
    // Lobby
    lobby: document.getElementById('lobby'),
    createRoomBtn: document.getElementById('create-room'),
    joinRoomBtn: document.getElementById('join-room'),
    playerNameInput: document.getElementById('player-name-input'),
    roomCodeInput: document.getElementById('room-code-input'),
    onlineUsersCounter: document.getElementById('online-users-counter'), // Comentado porque no se usa en esta versión
    gameModeRadios: document.querySelectorAll('input[name="game-mode"]'),
    
    // Tutorial y Configuración
    tutorialModal: document.getElementById('tutorial-modal'),
    tutorialSteps: document.querySelectorAll('.tutorial-step-btn'),
    closeTutorialBtn: document.getElementById('close-tutorial-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    closeSettingsBtn: document.getElementById('close-settings-btn'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    soundBtn: document.getElementById('sound-btn'),
    rulesBtn: document.getElementById('rules-btn'),
    
    // Sala de Espera
    waitRoom: document.getElementById('wait-room'),
    roomCodeSpan: document.getElementById('room-code-display'),
    playersContainer: document.getElementById('players-container'),
    addBotBtn: document.getElementById('add-bot-btn'),
    startGameBtn: document.getElementById('start-game'),
    copyCodeBtn: document.getElementById('copy-code-btn'),
    
    // Pantalla de Animación
    animationRoom: document.getElementById('animation-room'),
    animationText: document.getElementById('animation-text'),
    animationSubText: document.getElementById('animation-subtext'),
    
    // Sala de Juego
    gameRoom: document.getElementById('game-room'),
    gameTitle: document.getElementById('game-title'),
    gameInfo: document.getElementById('game-info'),
    chatMessagesContainer: document.getElementById('chat-messages'),
    chatInput: document.getElementById('chat-input'),
    sendMessageBtn: document.getElementById('send-message'),
    turnTimerDisplay: document.getElementById('turn-timer-display'),
    wordRevealContainer: document.getElementById('word-reveal-container'),
    wordRevealButton: document.getElementById('word-reveal-button'),
    wordRevealTimerDisplay: document.getElementById('word-reveal-timer-display'),
    clearChatBtn: document.getElementById('clear-chat-btn'),
    muteChatBtn: document.getElementById('mute-chat-btn'),
    onlinePlayersPreview: document.getElementById('online-players-preview'),
    typingIndicator: document.getElementById('typing-indicator'),
    emojiButtons: document.querySelectorAll('.emoji-btn'),
    
    // Votación
    votingSection: document.getElementById('voting-section'),
    votingList: document.getElementById('voting-list'),
    startVotingBtn: null, // Se creará dinámicamente
    
    // Resultados
    resultsRoom: document.getElementById('results-room'),
    resultMessage: document.getElementById('result-message'),
    playAgainBtn: document.getElementById('play-again'),
    backBtn: document.getElementById('back-btn'),

};

// ==================== SONIDOS ====================
class SoundManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.backgroundOscillator = null;
        this.backgroundMusicInterval = null; // Para el arpegio
        this.isBackgroundPlaying = false; // Para controlar el estado
    }

    play(type = 'notification', duration = 0.1) {
        if (!gameState.soundEnabled) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            const soundMap = {
                notification: { freq: 800, duration: 0.1, volume: 0.2 },
                success: { freq: 1200, duration: 0.2, volume: 0.25 },
                error: { freq: 400, duration: 0.3, volume: 0.2 },
                turn: { freq: 600, duration: 0.15, volume: 0.2 },
                vote: { freq: 900, duration: 0.12, volume: 0.2 },
                message: { freq: 500, duration: 0.08, volume: 0.15 },
            };

            const sound = soundMap[type] || soundMap.notification;
            oscillator.frequency.value = sound.freq;
            gainNode.gain.setValueAtTime(sound.volume * gameState.sfxVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + sound.duration);
        } catch (error) {
            console.warn('Error reproduciendo sonido:', error);
        }
    }

    startBackground() {
        if (this.isBackgroundPlaying) return;
        this.isBackgroundPlaying = true;
        this.updateBackgroundVolume(); // Inicia o ajusta la música
    }

    stopBackground() {
        if (this.backgroundMusicInterval) {
            clearInterval(this.backgroundMusicInterval);
            this.backgroundMusicInterval = null;
        }
        this.isBackgroundPlaying = false;
    }

    updateBackgroundVolume() {
        // Detener música actual para ajustar volumen
        if (this.backgroundMusicInterval) {
            clearInterval(this.backgroundMusicInterval);
            this.backgroundMusicInterval = null;
        }

        // Si la música debe sonar y el volumen no es cero
        if (this.isBackgroundPlaying && gameState.soundEnabled && gameState.musicVolume > 0) {
            // Nueva melodía: Un arpegio más misterioso y oscuro (Cm7 -> G)
            const notes = [130.81, 155.56, 196.00, 233.08, 196.00, 155.56]; // C3, D#3, G3, A#3
            let noteIndex = 0;

            this.backgroundMusicInterval = setInterval(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(800, this.audioContext.currentTime);

                oscillator.connect(gainNode);
                gainNode.connect(filter);
                filter.connect(this.audioContext.destination);

                oscillator.type = 'triangle'; // Un tono más suave que 'sine'
                oscillator.frequency.setValueAtTime(notes[noteIndex % notes.length], this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.09 * gameState.musicVolume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.8);
                noteIndex++;
            }, 600); // Cambia de nota cada 600ms para un ritmo más lento
        }
    }
}

const soundManager = new SoundManager();

// ==================== UTILIDADES ====================
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ==================== SISTEMA DE URL COMPARTIBLE ====================
function actualizarURLSala(roomCode) {
    const url = `${window.location.origin}${window.location.pathname}?sala=${roomCode}`;
    window.history.replaceState({}, '', url);
}

function obtenerCodigoDeURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('sala');
}

// Al cargar, verificar si hay código en URL
function verificarCodigoEnURL() {
    const codigoEnURL = obtenerCodigoDeURL();
    if (codigoEnURL && DOM.roomCodeInput) {
        DOM.roomCodeInput.value = codigoEnURL.toUpperCase();
        // Auto-llenar el nombre si no está ingresado
        if (!DOM.playerNameInput.value) {
            DOM.playerNameInput.value = `Jugador ${Math.floor(Math.random() * 1000)}`;
        }
        console.log(`🎯 Código de sala detectado en URL: ${codigoEnURL}`);
        showNotification(`📍 Código de sala: ${codigoEnURL}`, 'notification');
    }
}

function animateIn(element, delay = 0) {
    if (!element) return;
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = `all 0.5s ease ${delay}ms`;
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, 10);
}

function formatTime(milliseconds) {
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const minutes = Math.floor(milliseconds / 60000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function createProgressBar(duration) {
    const progressBar = document.createElement('div');
    progressBar.className = 'timer-bar';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 4px;
        background: linear-gradient(90deg, #00FFFF, #0066FF);
        animation: progressAnim ${duration}ms linear forwards;
        z-index: 9999;
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
    `;

    if (!document.querySelector('style[data-progress]')) {
        const style = document.createElement('style');
        style.setAttribute('data-progress', 'true');
        style.textContent = `
            @keyframes progressAnim {
                from { width: 100%; }
                to { width: 0%; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(progressBar);
    setTimeout(() => progressBar.remove(), duration);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00FF00' : type === 'error' ? '#FF0000' : '#0066FF'};
        color: #fff;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Establece un color personalizado para el jugador actual, visible localmente.
 * @param {string} color - El código de color HEX (ej: "#FF00FF").
 */
function setPlayerColor(color) {
    if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(color)) {
        showNotification('Color inválido. Usa formato HEX (#RRGGBB).', 'error');
        return;
    }
    gameState.playerCustomColor = color;
    localStorage.setItem('playerCustomColor', color);
    showNotification(`🎨 Tu color personalizado es ${color}`, 'success');
    // Nota: Este color se aplica localmente. Para que otros jugadores lo vean,
    // necesitaría ser guardado en Firebase en el perfil del jugador.
}

async function cleanupInactiveRooms() {
    try {
        const roomsRef = ref(database, 'salas/');
        const snapshot = await get(roomsRef);
        if (!snapshot.exists()) return;

        const rooms = snapshot.val();
        const now = Date.now();

        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            const lastActivity = room.lastActivity || room.createdAt || now;
            if (now - lastActivity > GAME_CONFIG.INACTIVE_TIME) {
                await remove(ref(database, `salas/${roomCode}`));
                console.log(`♻️ Sala ${roomCode} eliminada`);
            }
        }
    } catch (error) {
        console.error('Error limpiando salas:', error);
    }
}

// ==================== CONTADOR DE USUARIOS ONLINE ====================
async function updateOnlineUsersCounter() {
    try {
        const roomsRef = ref(database, 'salas');
        const snapshot = await get(roomsRef);
        if (!snapshot.exists()) {
            if (DOM.onlineUsersCounter) DOM.onlineUsersCounter.textContent = '0';
            return;
        }

        const rooms = snapshot.val();
        let totalUsers = 0;
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            if (room.jugadores) {
                totalUsers += Object.keys(room.jugadores).length;
            }
        }
        if (DOM.onlineUsersCounter) DOM.onlineUsersCounter.textContent = totalUsers;
    } catch (error) {
        console.error("Error actualizando contador de usuarios:", error);
    }
}
// ==================== NAVEGACIÓN ====================
function showScreen(screenName) {
    const screens = [
        DOM.lobby, DOM.waitRoom, DOM.animationRoom,
        DOM.gameRoom, DOM.votingSection, DOM.resultsRoom
    ];

    screens.forEach(screen => {
        if (screen) screen.classList.add('hidden');
    });
    
    const screenMap = {
        'lobby': DOM.lobby,
        'wait': DOM.waitRoom,
        'animation': DOM.animationRoom,
        'game': DOM.gameRoom,
        'voting': DOM.votingSection,
        'results': DOM.resultsRoom,
    };
    
    const target = screenMap[screenName];
    if (target) {
        target.classList.remove('hidden');
        animateIn(target);
    }
}

function goToLobby() {
    showScreen('lobby');
    gameState.currentRoom = null;
    gameState.currentPlayerId = null;
    gameState.gameStarted = false;
    clearTimeout(gameState.turnTimeout);
    soundManager.stopBackground(); // Detener música al volver al lobby
    soundManager.play('notification');
}

// ==================== CREACIÓN Y UNIÓN A SALAS ====================
DOM.createRoomBtn?.addEventListener('click', async () => {
    const playerName = DOM.playerNameInput?.value?.trim() || `Jugador ${Math.floor(Math.random() * 1000)}`;

    if (!playerName) {
        showNotification('Por favor ingresa tu nombre', 'error');
        return;
    }

    try {        
        const roomCode = generateRoomCode();
        const roomRef = ref(database, `salas/${roomCode}`);

        const player = {
            nombre: playerName,
            haVotado: false,
            isBot: false,
            rol: null,
            palabra: null,
            votoPor: null,
        };

        await set(roomRef, {
            host: playerName,
            estado: 'espera',
            gameMode: gameState.selectedGameMode, // Guardar el modo de juego
            createdAt: Date.now(),
            lastActivity: Date.now(),
            rondaActual: 0,
            turnoDe: null,
            categoria: null,
            palabra: null,
        });

        const playerRef = push(child(roomRef, 'jugadores'));
        await set(playerRef, player);

        gameState.currentPlayerId = playerRef.key;
        gameState.currentRoom = roomCode;
        gameState.isHost = true;

        // Actualizar URL con código de sala
        actualizarURLSala(roomCode);

        onValue(roomRef, handleRoomStateChange);

        soundManager.play('success');
        showScreen('wait');
        showNotification(`✅ Sala creada: ${roomCode}`, 'success');
    } catch (error) {
        console.error('Error creando sala:', error);
        showNotification('Error al crear la sala', 'error');
    }
});

DOM.joinRoomBtn?.addEventListener('click', async () => {
    const roomCode = DOM.roomCodeInput?.value?.toUpperCase()?.trim();
    const playerName = DOM.playerNameInput?.value?.trim() || `Jugador ${Math.floor(Math.random() * 1000)}`;

    if (!roomCode) {
        showNotification('Por favor ingresa el código de la sala', 'error');
        return;
    }

    try {        
        const roomRef = ref(database, `salas/${roomCode}`);
        const snapshot = await get(roomRef);

        if (!snapshot.exists()) {
            showNotification('Sala no encontrada', 'error');
            return;
        }

        const room = snapshot.val();

        if (room.estado !== 'espera') {
            showNotification('La partida ya ha comenzado', 'error');
            return;
        }

        const playerCount = room.jugadores ? Object.keys(room.jugadores).length : 0;
        if (playerCount >= GAME_CONFIG.MAX_PLAYERS) {
            showNotification('La sala está llena', 'error');
            return;
        }

        const player = {
            nombre: playerName,
            haVotado: false,
            isBot: false,
            rol: null,
            palabra: null,
        };

        const playerRef = push(child(roomRef, 'jugadores'));
        await set(playerRef, player);

        gameState.currentPlayerId = playerRef.key;
        gameState.currentRoom = roomCode;
        gameState.isHost = false;

        await update(roomRef, { lastActivity: Date.now() });

        onValue(roomRef, handleRoomStateChange);

        soundManager.play('success');
        showScreen('wait');
        showNotification(`✅ Unido a la sala ${roomCode}`, 'success');
    } catch (error) {
        console.error('Error uniéndose a sala:', error);
        showNotification('Error al unirse a la sala', 'error');
    }
});

// ==================== SALA DE ESPERA ====================
function updatePlayersList(roomCode) {
    if (!DOM.playersContainer) return;

    const playersRef = ref(database, `salas/${roomCode}/jugadores`);

    onValue(playersRef, (snapshot) => {
        DOM.playersContainer.innerHTML = '';

        if (!snapshot.exists()) {
            DOM.playersContainer.innerHTML = '<p style="color: #0066FF;">No hay jugadores</p>';
            return;
        }

        const players = snapshot.val();
        const playerCount = Object.keys(players).length;

        const header = document.createElement('h3');
        header.textContent = `🎮 Jugadores (${playerCount}/${GAME_CONFIG.MAX_PLAYERS})`;
        header.style.cssText = 'color: #00FFFF; margin-bottom: 20px; text-shadow: 0 0 10px rgba(0,255,255,0.5);';
        DOM.playersContainer.appendChild(header);

        const gridContainer = document.createElement('div');
        gridContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
        `;

        snapshot.forEach((childSnapshot) => {
            const playerId = childSnapshot.key;
            const playerData = childSnapshot.val();

            const playerCard = document.createElement('div');
            playerCard.style.cssText = `
                background: linear-gradient(135deg, rgba(0, 102, 255, 0.1), rgba(102, 0, 255, 0.1));
                border: 2px solid #0066FF;
                padding: 15px;
                border-radius: 12px;
                text-align: center;
                transition: all 0.3s ease;
                cursor: pointer;
            `;

            if (playerId === gameState.currentPlayerId) {
                playerCard.style.borderColor = '#00FFFF';
                playerCard.style.background = 'linear-gradient(135deg, rgba(0, 255, 255, 0.15), rgba(0, 102, 255, 0.15))';
                playerCard.style.boxShadow = '0 0 20px rgba(0,255,255,0.3)';
            }

            const playerInfo = document.createElement('div');
            playerInfo.innerHTML = `
                <div style="color: #00FFFF; font-weight: 700; margin-bottom: 8px;">
                    ${playerData.isBot ? '🤖' : '👤'} ${playerData.nombre}
                </div>
                ${playerData.isBot ? '<div style="color: #0066FF; font-size: 0.85em;">IA</div>' : ''}
            `;

            playerCard.appendChild(playerInfo);

            if (gameState.isHost && playerId !== gameState.currentPlayerId && !playerData.isBot) {
                const kickBtn = document.createElement('button');
                kickBtn.textContent = '❌ Expulsar';
                kickBtn.style.cssText = `
                    margin-top: 10px;
                    padding: 6px 10px;
                    font-size: 0.75em;
                    background: #FF4444;
                    cursor: pointer;
                    border: none;
                    border-radius: 6px;
                    color: #fff;
                    transition: all 0.2s;
                `;
                kickBtn.addEventListener('click', () => {
                    kickPlayer(gameState.currentRoom, playerId);
                });
                playerCard.appendChild(kickBtn);
            }

            gridContainer.appendChild(playerCard);
        });

        DOM.playersContainer.appendChild(gridContainer);
    });
}

function showWaitRoom(roomCode, isHost, room) {
    showScreen('wait');

    if (DOM.roomCodeSpan) {
        DOM.roomCodeSpan.textContent = roomCode;
    }

    if (DOM.startGameBtn) {
        DOM.startGameBtn.classList.toggle('hidden', !isHost);
    }

    /*if (DOM.addBotBtn) {
        DOM.addBotBtn.classList.toggle('hidden', !isHost);        
    }*/

    updatePlayersList(roomCode);
}

async function kickPlayer(roomCode, playerId) {
    try {
        await remove(ref(database, `salas/${roomCode}/jugadores/${playerId}`));
        soundManager.play('success');
        showNotification('Jugador expulsado', 'success');
    } catch (error) {
        console.error('Error expulsando jugador:', error);
        showNotification('Error al expulsar', 'error');
    }
}

/*DOM.addBotBtn?.addEventListener('click', async () => {
    if (!gameState.currentRoom || !gameState.isHost) return;

    try {
        const roomRef = ref(database, `salas/${gameState.currentRoom}`);
        const snapshot = await get(roomRef);

        if (!snapshot.exists()) return;

        const room = snapshot.val();
        const playerCount = room.jugadores ? Object.keys(room.jugadores).length : 0;

        if (playerCount >= GAME_CONFIG.MAX_PLAYERS) {
            showNotification('La sala está llena', 'error');
            return;
        }

        const botNames = ['Androide', 'Cerebrito', 'Sparky', 'Unit-734', 'Nexus', 'Bolt', 'Chip', 'Gadget', 'Nova', 'Pixel', 'Byte', 'Nexo'];
        const existingNames = Object.values(room.jugadores || {}).map(p => p.nombre);

        let botName = botNames[Math.floor(Math.random() * botNames.length)];
        let counter = 1;
        while (existingNames.includes(botName)) {
            botName = `${botNames[Math.floor(Math.random() * botNames.length)]}_${counter}`;
            counter++;
        }

        const botPlayer = {
            nombre: botName,
            haVotado: false,
            isBot: true,
            rol: null,
            palabra: null,
            votoPor: null,
        };

        const playerRef = push(child(roomRef, 'jugadores'));
        await set(playerRef, botPlayer);

        soundManager.play('success');
        showNotification(`🤖 Bot "${botName}" añadido`, 'success');
    } catch (error) {
        console.error('Error añadiendo bot:', error);
        showNotification('Error al añadir bot', 'error');
    }
});*/

DOM.copyCodeBtn?.addEventListener('click', () => {
    const roomCode = DOM.roomCodeSpan?.textContent;
    if (!roomCode) return;

    navigator.clipboard.writeText(roomCode).then(() => {
        const originalText = DOM.copyCodeBtn.textContent;
        DOM.copyCodeBtn.textContent = '✓ ¡Copiado!';
        soundManager.play('success');

        setTimeout(() => {
            DOM.copyCodeBtn.textContent = originalText;
        }, 2000);
    });
});

// ==================== CONTROL DE SONIDO ====================
DOM.soundBtn?.addEventListener('click', () => {
    gameState.soundEnabled = !gameState.soundEnabled;
    DOM.soundBtn.textContent = gameState.soundEnabled ? '🔊' : '🔇';
    localStorage.setItem('soundEnabled', gameState.soundEnabled);
    soundManager.play('success');
});

// ==================== CONFIGURACIÓN ====================
DOM.settingsBtn?.addEventListener('click', () => {
    DOM.settingsModal?.classList.remove('hidden');
});

DOM.closeSettingsBtn?.addEventListener('click', () => {
    DOM.settingsModal?.classList.add('hidden');
});

DOM.saveSettingsBtn?.addEventListener('click', () => {
    const musicVolume = document.getElementById('music-volume')?.value || 0.5;
    const sfxVolume = document.getElementById('sfx-volume')?.value || 0.5;

    gameState.musicVolume = parseFloat(musicVolume);
    gameState.sfxVolume = parseFloat(sfxVolume);

    localStorage.setItem('musicVolume', gameState.musicVolume);
    localStorage.setItem('sfxVolume', gameState.sfxVolume);

    // Actualizar música de fondo si está en juego
    soundManager.updateBackgroundVolume();
    

    DOM.settingsModal?.classList.add('hidden');
    soundManager.play('success');
    showNotification('⚙️ Ajustes guardados', 'success');
});

// ==================== TUTORIAL ====================
const tutorialContent = {
    1: { title: '👥 Roles', text: 'Al inicio, recibís un rol en secreto. La mayoría sois Jugadores con una palabra. Uno es el Impostor sin palabra.' },
    2: { title: '💬 Pistas', text: 'Por turnos, decís una palabra como pista. El Impostor debe disimular basándose en las pistas de los demás.' },
    3: { title: '🎯 Objetivo', text: 'Jugadores: Descubran al Impostor. Impostor: Sobrevivir sin ser descubierto.' },
    4: { title: '✋ Votación', text: 'Después de las rondas, todos votan para expulsar a quien crean que es el Impostor.' },
    5: { title: '⚡ Especiales', text: 'Podés reaccionar con emojis y mencionar otros jugadores con @nombre.' },
    6: { title: '📋 Normas', text: 'No usar palabras ofensivas, no hacer trampas, respetar a otros jugadores.' },
};

function updateTutorialContent(step) {
    const explanationEl = document.getElementById('tutorial-explanation');
    if (!explanationEl) return;

    DOM.tutorialSteps.forEach(b => b.classList.remove('active'));
    document.querySelector(`.tutorial-step-btn[data-step="${step}"]`)?.classList.add('active');

    const content = tutorialContent[step];
    explanationEl.innerHTML = `
        <h3 style="color: #00FFFF; margin-bottom: 15px;">${content.title}</h3>
        <p style="color: #E0E0E0; line-height: 1.6;">${content.text}</p>
    `;
}

DOM.tutorialSteps.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const step = parseInt(e.target.dataset.step);
        gameState.currentTutorialStep = step;
        updateTutorialContent(step);
        clearInterval(gameState.tutorialInterval);
    });
});

DOM.closeTutorialBtn?.addEventListener('click', () => {
    DOM.tutorialModal?.classList.add('hidden');
    clearInterval(gameState.tutorialInterval);
});

DOM.rulesBtn?.addEventListener('click', () => {
    gameState.currentTutorialStep = 6;
    updateTutorialContent(gameState.currentTutorialStep);
    DOM.tutorialModal?.classList.remove('hidden');
    clearInterval(gameState.tutorialInterval);
});

// ==================== INICIAR JUEGO ====================
DOM.startGameBtn?.addEventListener('click', async () => {
    if (!gameState.currentRoom || !gameState.isHost) return;

    try {
        const roomRef = ref(database, `salas/${gameState.currentRoom}`);
        const snapshot = await get(child(roomRef, 'jugadores'));

        if (!snapshot.exists()) {
            showNotification('No hay jugadores en la sala', 'error');
            return;
        }

        const players = snapshot.val();
        const playerIds = Object.keys(players);

        if (playerIds.length < GAME_CONFIG.MIN_PLAYERS) {
            showNotification(`Se necesitan al menos ${GAME_CONFIG.MIN_PLAYERS} jugadores`, 'error');
            return;
        }

        const impostorId = playerIds[Math.floor(Math.random() * playerIds.length)];
        const categoryKeys = Object.keys(categories);
        const categoria = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
        const palabras = categories[categoria];
        const palabra = palabras[Math.floor(Math.random() * palabras.length)];

        // Asignar roles
        for (const playerId of playerIds) {
            const playerRef = ref(database, `salas/${gameState.currentRoom}/jugadores/${playerId}`);
            if (playerId === impostorId) {
                await update(playerRef, { rol: 'impostor' });
            } else {
                await update(playerRef, { rol: 'jugador', palabra });
            }
        }

        // Actualizar sala
        await update(roomRef, {
            estado: 'animacion',
            categoria,
            palabra,
            rondaActual: 1,
            turnoDe: playerIds[0],
            lastActivity: Date.now(),
        });
    } catch (error) {
        console.error('Error al iniciar el juego:', error);
        showNotification('Error al iniciar el juego', 'error');
    }
});

// ==================== MANEJO DEL ESTADO DE LA SALA ====================
function handleRoomStateChange(snapshot) {
    if (!snapshot.exists()) {
        console.warn('La sala ha sido eliminada');
        goToLobby();
        return;
    }

    const room = snapshot.val();
    gameState.currentRoomData = room;

    const localPlayer = room.jugadores?.[gameState.currentPlayerId];
    if (!localPlayer) {
        console.warn('El jugador ha sido expulsado');
        goToLobby();
        return;
    }

    const isHost = localPlayer.nombre === room.host;
    gameState.isHost = isHost;

    switch (room.estado) {
        case 'espera':
            showWaitRoom(gameState.currentRoom, isHost, room);
            break;
        case 'animacion':
            showAnimationScreen(room);
            break;
        case 'en_juego':
            showGameRoom(room);
            break;
        case 'votacion':
            showVotingScreen(room);
            break;
        case 'fin':
            showResultsScreen(room);
            break;
    }
}

// ==================== PANTALLA DE ANIMACIÓN ====================
function showAnimationScreen(room) {
    showScreen('animation');

    const player = room.jugadores?.[gameState.currentPlayerId];
    if (!player) return;

    if (DOM.animationText) {
        DOM.animationText.textContent = `📂 Categoría: ${room.categoria}`;
        DOM.animationText.style.animation = 'pulse 0.5s ease-in-out';
    }

    if (DOM.animationSubText) {
        if (player.rol === 'impostor') {
            DOM.animationSubText.innerHTML = '<span style="color: #FF4444; font-size: 1.5em; animation: pulse 0.6s ease-in-out;">⚠️ ¡ERES EL IMPOSTOR!</span>';
            soundManager.play('error');
        } else {
            DOM.animationSubText.innerHTML = `<span style="color: #00FF00; font-size: 1.5em; animation: pulse 0.6s ease-in-out;">✓ Palabra: ${player.palabra}</span>`;
            soundManager.play('success');
        }
    }

    createProgressBar(5000);

    setTimeout(() => { //Tiempo para que salga la palabra
        if (gameState.isHost) {
            update(ref(database, `salas/${gameState.currentRoom}`), {
                estado: 'en_juego',
                lastActivity: Date.now(),
            });
        }
    }, 5000);
}//Tiempo para que salga la palabra

// ==================== PANTALLA DE JUEGO Y REVELACIÓN DE PALABRA ====================
let currentTurnTimer = null;

async function showGameRoom(room) {
    showScreen('game');
    gameState.gameStarted = true;

    // Iniciar música de fondo
    soundManager.startBackground();

    const player = room.jugadores?.[gameState.currentPlayerId];
    if (!player) {
        console.error('Jugador no encontrado');
        goToLobby();
        return;
    }

    if (isSpectator(room, gameState.currentPlayerId)) {
        DOM.gameRoom.innerHTML = '<h2 style="color: #00FFFF; text-align: center;">Eres espectador de esta partida.</h2>';
        return;
    }

    // Mostrar la información del juego directamente
    if (DOM.gameInfo) {
        if (player.rol === 'impostor') {
            DOM.gameInfo.textContent = `📂 Categoría: ${room.categoria}`;
        } else {
            DOM.gameInfo.textContent = `💭 Palabra: ${player.palabra}`;
        }
        DOM.gameInfo.classList.remove('hidden');
    }

    // Ocultar el contenedor de revelación de palabra, ya que no se usará
    if (DOM.wordRevealContainer) {
        DOM.wordRevealContainer.classList.add('hidden');
    }

    // Limpiar cualquier temporizador de revelación que pudiera haber quedado
    if (gameState.wordRevealInterval) clearInterval(gameState.wordRevealInterval);
    if (gameState.wordRevealTimeout) clearTimeout(gameState.wordRevealTimeout);

    // Iniciar la fase de turnos directamente
    startGameTurnPhase(room);
}

function startGameTurnPhase(room) {
    // Re-enable chat
    DOM.chatInput.disabled = false;
    DOM.sendMessageBtn.disabled = false;

    // Update game title (already done in showGameRoom, but ensure it's visible)
    if (DOM.gameTitle) {
        DOM.gameTitle.textContent = `🎮 Ronda ${room.rondaActual}/${GAME_CONFIG.ROUNDS}`;
    }

   updateTurn(room);
    updateChat(room);
}

function updateTurn(room) {
    const playerInTurn = room.jugadores?.[room.turnoDe];
    if (!playerInTurn) return;

    // Limpiar cualquier temporizador de intervalo existente
    if (gameState.turnInterval) {
       clearInterval(gameState.turnInterval);
    }
    clearTimeout(gameState.turnTimeout); // Clear the main game turn timeout

    let timeLeft = GAME_CONFIG.TURN_TIME;

    const updateTimer = () => {
        const seconds = Math.ceil(timeLeft / 1000);
        if (DOM.turnTimerDisplay) {
            const colorClass = seconds <= 10 ? 'rgba(255, 100, 100, 1)' : seconds <= 20 ? 'rgba(255, 200, 100, 1)' : 'rgba(0, 255, 200, 1)';
            DOM.turnTimerDisplay.innerHTML = `
                <div style="color: ${colorClass}; font-size: 1.1em; font-weight: 700;">
                    🎤 ${playerInTurn.nombre}${playerInTurn.isBot ? ' 🤖' : ''}
                </div>
                <div style="color: #0066FF; font-size: 0.95em; margin-top: 8px;">
                    ⏱️ ${seconds}s
                </div>
            `;
        }
        timeLeft -= 100; // Reducir en 100ms
        if (timeLeft < 0) { // Asegurarse de que el temporizador se detenga en 0 o ligeramente por debajo
            clearInterval(gameState.turnInterval);
        }
    };

    updateTimer();
    gameState.turnInterval = setInterval(updateTimer, 100); // Iniciar el intervalo

    if (room.turnoDe === gameState.currentPlayerId) {
        DOM.chatInput.disabled = false;
        DOM.sendMessageBtn.disabled = false;
        DOM.chatInput.focus();
        soundManager.play('turn');
    } else {
        DOM.chatInput.disabled = true;
        DOM.sendMessageBtn.disabled = true;

        // Solo el host maneja el turno del bot para evitar múltiples ejecuciones
        if (playerInTurn.isBot && gameState.isHost) {
            handleBotTurn(room);
        }
    }

    // Establecer el timeout principal para pasar el turno
    gameState.turnTimeout = setTimeout(() => {
        clearInterval(gameState.turnInterval); // Limpiar el intervalo cuando el timeout se dispara
        gameState.turnInterval = null; // Resetear el ID del intervalo
        passTurn(room);
    }, GAME_CONFIG.TURN_TIME + 500); // Usa GAME_CONFIG.TURN_TIME
}

async function handleBotTurn(room) {
    const botPlayer = room.jugadores?.[room.turnoDe];
    if (!botPlayer || !botPlayer.isBot) return;

    const waitTime = GAME_CONFIG.BOT_THINK_TIME + Math.random() * (GAME_CONFIG.BOT_MAX_THINK - GAME_CONFIG.BOT_THINK_TIME);

    await new Promise(resolve => setTimeout(resolve, waitTime));

    let botMessage = '';

    if (botPlayer.rol === 'impostor') {
        const palabrasCategoria = categories[room.categoria];
        if (palabrasCategoria && palabrasCategoria.length > 0) {
            botMessage = palabrasCategoria[Math.floor(Math.random() * palabrasCategoria.length)];
        } else {
            botMessage = 'Hmm... no sé qué decir';
        }
    } else {
        botMessage = botPlayer.palabra || 'Palabra';
    }

    try {
        const roomRef = ref(database, `salas/${gameState.currentRoom}`);
        await push(child(roomRef, 'chat'), {
            autor: botPlayer.nombre,
            autorId: room.turnoDe,
            mensaje: botMessage,
            timestamp: Date.now(),
        });

        // Pasar turno después de un pequeño delay
        setTimeout(() => {
            if (gameState.isHost) { // Solo el host pasa el turno
                passTurn(room);
            }
        }, 500);
    } catch (error) {
        console.error('Error en turno del bot:', error);
    }
}

async function passTurn(room) {
    // Limpiar cualquier temporizador de intervalo y timeout existente al pasar el turno
    if (gameState.turnInterval) {
        clearInterval(gameState.turnInterval);
    }
    clearTimeout(gameState.turnTimeout);

    try {
        const roomRef = ref(database, `salas/${gameState.currentRoom}`);
        const playerIds = Object.keys(room.jugadores || {});
        const currentPlayerIndex = playerIds.indexOf(room.turnoDe);
        const nextPlayerIndex = (currentPlayerIndex + 1) % playerIds.length;
        const nextPlayerId = playerIds[nextPlayerIndex];

        let nextRound = room.rondaActual;
        if (nextPlayerIndex === 0) {
            nextRound++;
        }

        if (nextRound > GAME_CONFIG.ROUNDS) {
            await update(roomRef, {
                estado: 'votacion',
                lastActivity: Date.now(),
            });
        } else {
            await update(roomRef, {
                turnoDe: nextPlayerId,
                rondaActual: nextRound,
                lastActivity: Date.now(),
            });
        }

        soundManager.play('notification');
    } catch (error) {
        console.error('Error pasando turno:', error);
    }
}

// ==================== CHAT ====================
function updateChat(room) {
    if (!DOM.chatMessagesContainer) return;

    const roomRef = ref(database, `salas/${gameState.currentRoom}`);

    onValue(child(roomRef, 'chat'), (snapshot) => {
        if (gameState.chatMuted) return; // Si el chat está silenciado, no actualizar
        
        DOM.chatMessagesContainer.innerHTML = '';

        if (!snapshot.exists()) {
            return;
        }

        snapshot.forEach((childSnapshot) => {
            const msg = childSnapshot.val();
            const isOwnMessage = msg.autorId === gameState.currentPlayerId;

            if (isSpectator(room, gameState.currentPlayerId)) {
                return;
            }

            const messageEl = document.createElement('div');
            messageEl.className = isOwnMessage ? 'chat-message own-message' : 'chat-message other-message';

            messageEl.innerHTML = `
                <div class="message-sender">${msg.autor}</div>
                <div style="font-size: 0.95em; line-height: 1.4;">${msg.mensaje}</div>
            `;

            DOM.chatMessagesContainer.appendChild(messageEl);
        });

        // Auto-scroll al último mensaje
        setTimeout(() => {
            DOM.chatMessagesContainer.scrollTop = DOM.chatMessagesContainer.scrollHeight;
        }, 0);
    });
}

DOM.sendMessageBtn?.addEventListener('click', async () => {
    const message = DOM.chatInput?.value?.trim();
    if (!message || !gameState.currentRoom) return;

    // Limitar a 100 caracteres
    if (message.length > 100) {
        showNotification('El mensaje es muy largo (máx 100 caracteres)', 'error');
        return;
    }

    try {
        const room = gameState.currentRoomData;

        if (room.turnoDe !== gameState.currentPlayerId) {
            showNotification('No es tu turno', 'error');
            return;
        }

        const roomRef = ref(database, `salas/${gameState.currentRoom}`);
        const player = room.jugadores?.[gameState.currentPlayerId];

        await push(child(roomRef, 'chat'), {
            autor: player.nombre,
            autorId: gameState.currentPlayerId,
            mensaje: message,
            timestamp: Date.now(),
        });

        DOM.chatInput.value = '';
        soundManager.play('message');

        await passTurn(room); // El turno pasa después de enviar un mensaje
    } catch (error) {
        console.error('Error enviando mensaje:', error);
        showNotification('Error al enviar mensaje', 'error');
    }
});

DOM.chatInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        DOM.sendMessageBtn?.click();
    }
});

// Botones de emoji rápido
DOM.emojiButtons?.forEach(btn => {
    btn.addEventListener('click', () => {
        const emoji = btn.getAttribute('data-emoji');
        if (emoji && DOM.chatInput) {
            DOM.chatInput.value += emoji;
            DOM.chatInput.focus();
        }
    });
});

// Limpiar chat
DOM.clearChatBtn?.addEventListener('click', () => {
    if (confirm('¿Limpiar el chat? Esta acción no se puede deshacer.')) {
        if (DOM.chatMessagesContainer) {
            DOM.chatMessagesContainer.innerHTML = '';
            showNotification('Chat limpiado', 'success');
            soundManager.play('success');
        }
    }
});

// Silenciar chat
DOM.muteChatBtn?.addEventListener('click', () => {
    gameState.chatMuted = !gameState.chatMuted;
    if (DOM.muteChatBtn) {
        DOM.muteChatBtn.textContent = gameState.chatMuted ? '🔕' : '🔇';
        DOM.muteChatBtn.style.opacity = gameState.chatMuted ? '0.5' : '1';
    }
    showNotification(gameState.chatMuted ? '🔕 Chat silenciado' : '🔊 Chat activo', 'notification');
});

// Actualizar preview de jugadores online
window.addEventListener('updateOnlinePlayers', () => {
    if (!DOM.onlinePlayersPreview || !gameState.currentRoomData) return;
    
    const players = Object.values(gameState.currentRoomData.jugadores || {});
    const onlinePlayers = players.filter(p => p && !p.desconectado);
    
    DOM.onlinePlayersPreview.innerHTML = `
        <span>👥 Online: ${onlinePlayers.length}/${players.length}</span>
    `;
});

// ==================== TIENDA (COMENTADA PORQUE NO SE USA EN ESTA VERSIÓN) ====================
function displayShopItems() {
    const shopItems = document.getElementById('shopItems');
    if (!shopItems) return;
    
    // Obtener items reales de la tienda
    const items = getTiendaItems();
    
    shopItems.innerHTML = '';
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = `shop-item rarity-${item.rarity}`;
        div.innerHTML = `
            <div class="shop-item-icon">${item.icono}</div>
            <div class="shop-item-name">${item.nombre}</div>
            <div class="shop-item-price">Σ${item.precio}</div>
            <button class="shop-item-btn" onclick="comprarItem('${item.id}')">
                Comprar
            </button>
        `;
        shopItems.appendChild(div);
    });
}

window.comprarItem = async function(itemId) {
    try {
        const user = getCurrentUser();
        if (!user) {
            showNotification('⚠️ Debes estar autenticado', 'error');
            return;
        }
        
        const profile = await getUserProfile(user.uid);
        const result = await buyTiendaItem(user.uid, itemId, profile, database);
        
        if (result.success) {
            showNotification(`✅ ${result.item.nombre} comprado por Σ${result.item.precio}`, 'success');
            soundManager.play('success');
            updateProfileDisplay();
        } else {
            showNotification(`❌ ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Error buying item:', error);
        showNotification('❌ Error al comprar el artículo', 'error');
    }
}

window.updateProfileDisplay = async function() {
    try {
        const user = getCurrentUser();
        if (!user) {
            console.log('No user logged in');
            return;
        }
        
        const profile = await getUserProfile(user.uid);
        
        // Actualizar datos del perfil
        const nivel = Math.floor((profile?.partidas || 0) / 10) + 1;
        document.getElementById('profileLevel').textContent = nivel;
        document.getElementById('profileCoins').textContent = `Σ${profile?.sigmaCoins || 0}`;
        document.getElementById('profileGames').textContent = profile?.partidas || 0;
        document.getElementById('profileWins').textContent = profile?.victorias || 0;
        document.getElementById('shopBalance').textContent = `Σ${profile?.sigmaCoins || 0}`;
        
        // Mostrar cosméticos equipados
        const cosmeticsContainer = document.getElementById('profileCosmetics');
        if (cosmeticsContainer) {
            cosmeticsContainer.innerHTML = '';
            const cosmeticos = profile?.cosmeticos || {};
            const cosmeticsArray = Object.entries(cosmeticos).filter(([_, equipped]) => equipped);
            
            if (cosmeticsArray.length === 0) {
                cosmeticsContainer.innerHTML = '<p style="color: #999; grid-column: 1/-1; text-align: center;">Sin cosméticos equipados</p>';
            } else {
                cosmeticsArray.forEach(([cosmeticId, _]) => {
                    const cosmeticDiv = document.createElement('div');
                    cosmeticDiv.className = 'cosmetic-item';
                    cosmeticDiv.innerHTML = `<div class="cosmetic-item-icon">🎨</div><div class="cosmetic-item-name">${cosmeticId}</div>`;
                    cosmeticsContainer.appendChild(cosmeticDiv);
                });
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// ==================== EVENT LISTENERS - TIENDA Y PERFIL ====================
document.getElementById('shop-btn')?.addEventListener('click', () => {
    const user = getCurrentUser();
    
    if (!user) {
        // No autenticado - mostrar modal de Google login
        showNotification('⚠️ Debes autenticarte para acceder a la tienda', 'error');
        DOM.googleLoginModal?.classList.remove('hidden');
        return;
    }
    
    const shopModal = document.getElementById('shop-modal');
    if (shopModal) {
        shopModal.classList.remove('hidden');
        displayShopItems();
    }
});

document.getElementById('close-shop-btn')?.addEventListener('click', () => {
    const shopModal = document.getElementById('shop-modal');
    if (shopModal) {
        shopModal.classList.add('hidden');
    }
});

document.getElementById('profile-btn')?.addEventListener('click', () => {
    const user = getCurrentUser();
    
    if (!user) {
        // No autenticado - mostrar modal de Google login
        DOM.googleLoginModal?.classList.remove('hidden');
    } else {
        // Autenticado - mostrar perfil
        const profileModal = document.getElementById('profile-modal');
        if (profileModal) {
            profileModal.classList.remove('hidden');
            updateProfileDisplay();
        }
    }
});

document.getElementById('close-profile-btn')?.addEventListener('click', () => {
    const profileModal = document.getElementById('profile-modal');
    if (profileModal) {
        profileModal.classList.add('hidden');
    }
});

document.getElementById('admin-btn')?.addEventListener('click', () => {
    window.location.href = 'admin.html';
});

document.getElementById('logout-btn')?.addEventListener('click', async () => {
    try {
        await logoutUser();
        showNotification('👋 Sesión cerrada correctamente', 'success');
        document.getElementById('profile-modal')?.classList.add('hidden');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        showNotification('❌ Error al cerrar sesión', 'error');
    }
});

// Cerrar modal si haces click afuera
document.getElementById('shop-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'shop-modal') {
        e.target.classList.add('hidden');
    }
});

document.getElementById('profile-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'profile-modal') {
        e.target.classList.add('hidden');
    }
});

// ==================== VOTACIÓN ====================
function showVotingScreen(room) {
    showScreen('voting');

    const player = room.jugadores?.[gameState.currentPlayerId];

    // Indicador de quién está escribiendo
    const typingPlayers = Object.values(room.jugadores).filter(p => p.isTyping && p.nombre !== player.nombre);
    if (DOM.typingIndicator) {
        if (typingPlayers.length > 0) {
            const names = typingPlayers.map(p => p.nombre).join(', ');
            DOM.typingIndicator.textContent = `✏️ ${names} está(n) escribiendo...`;
            DOM.typingIndicator.classList.add('active');
        } else {
            DOM.typingIndicator.textContent = '';
            DOM.typingIndicator.classList.remove('active');
        }
    }


    if (DOM.votingList) {
        DOM.votingList.innerHTML = '';
    }

    const h3 = document.createElement('h3');
    h3.textContent = '❓ ¿Quién es el Impostor?';
    h3.style.color = '#00FFFF';
    DOM.votingList?.appendChild(h3);

    // Contenedor para la lista de estado de voto
    const votingStatusContainer = document.createElement('div');
    votingStatusContainer.id = 'voting-status-container';
    DOM.votingList?.appendChild(votingStatusContainer);
    updateVotingStatus(room.jugadores);

    if (player?.haVotado) {
        if (DOM.votingList) {
            DOM.votingList.innerHTML = '<p style="color: #00FFFF; text-align: center; margin-top: 20px;">✓ Has votado. Esperando a los demás...</p>';
        }
        return;
    }

    // Contenedor para los botones de votación
    for (const playerId in room.jugadores) {
        const playerInList = room.jugadores[playerId];

        if (playerId !== gameState.currentPlayerId && playerInList) {
            const votedPlayer = room.jugadores[playerId];

            const li = document.createElement('li');
            li.style.listStyle = 'none';
            li.style.marginBottom = '12px';

            const button = document.createElement('button');
            button.textContent = `Votar por ${votedPlayer.nombre}${votedPlayer.isBot ? ' 🤖' : ''}`;
            button.style.cssText = `
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #FF4444, #DD0000);
                color: #fff;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'scale(1.05)';
                button.style.boxShadow = '0 0 30px rgba(255, 68, 68, 0.8)';
            });
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'scale(1)';
                button.style.boxShadow = '0 0 15px rgba(255, 68, 68, 0.4)';
            });
            button.addEventListener('click', () => {
                voteFor(gameState.currentPlayerId, playerId);
            });

            li.appendChild(button);
            DOM.votingList?.appendChild(li);
        }
    }

    // Handle bot voting
    if (gameState.isHost) { // Only host should trigger bot votes to avoid duplicates
        for (const playerId in room.jugadores) {
            const p = room.jugadores[playerId];
            if (p.isBot && !p.haVotado) {
                // handleBotVote(room, playerId); // Descomentar si se implementa la lógica de voto de bots
            }
        }
    }
    

    soundManager.play('turn');
}

function updateVotingStatus(players) {
    const container = document.getElementById('voting-status-container');
    if (!container) return;

    container.innerHTML = '<h4 style="color: #00FFFF; margin-bottom: 10px;">Estado de la Votación:</h4>';
    const statusGrid = document.createElement('div');
    statusGrid.className = 'voting-status-grid';

    for (const playerId in players) {
        const player = players[playerId];
        const statusEl = document.createElement('div');
        statusEl.className = 'voting-status-item';
        if (player.haVotado) {
            statusEl.classList.add('voted');
        }
        statusEl.innerHTML = `
            <span class="player-name">${player.nombre}</span>
            <span class="vote-status">${player.haVotado ? '✓ Votó' : '🤔 Pensando...'}</span>
        `;
        statusGrid.appendChild(statusEl);
    }
    container.appendChild(statusGrid);
}

async function handleBotVote(room, botPlayerId) {
    const botPlayer = room.jugadores[botPlayerId];
    if (!botPlayer || botPlayer.haVotado) return;

    const eligibleTargets = Object.keys(room.jugadores).filter(
        (id) => id !== botPlayerId && !room.jugadores[id].haVotado // Bot won't vote for itself, and won't vote for someone who already voted (though this shouldn't happen)
    );

    if (eligibleTargets.length === 0) {
        console.warn(`Bot ${botPlayer.nombre} has no eligible targets to vote for.`);
        return;
    }

    let votedPlayerId;
    if (botPlayer.rol === 'impostor') {
        // Impostor bot tries to vote for a non-impostor player, preferably a human player
        const nonImpostorPlayers = eligibleTargets.filter(
            (id) => room.jugadores[id].rol !== 'impostor' && !room.jugadores[id].isBot
        );
        if (nonImpostorPlayers.length > 0) {
            votedPlayerId = nonImpostorPlayers[Math.floor(Math.random() * nonImpostorPlayers.length)];
        } else {
            // Fallback: vote for any non-impostor
            const anyNonImpostor = eligibleTargets.filter(id => room.jugadores[id].rol !== 'impostor');
            if (anyNonImpostor.length > 0) {
                votedPlayerId = anyNonImpostor[Math.floor(Math.random() * anyNonImpostor.length)];
            } else {
                // If all remaining are impostors or bots, vote randomly
                votedPlayerId = eligibleTargets[Math.floor(Math.random() * eligibleTargets.length)];
            }
        }
    } else {
        // Player bot votes for a random player, trying to find the impostor
        // For simplicity, let's make them vote randomly for now.
        // More advanced AI could analyze chat messages.
        votedPlayerId = eligibleTargets[Math.floor(Math.random() * eligibleTargets.length)];
    }

    const botThinkTime = GAME_CONFIG.BOT_THINK_TIME + Math.random() * (GAME_CONFIG.BOT_MAX_THINK - GAME_CONFIG.BOT_THINK_TIME);

    await new Promise(resolve => setTimeout(resolve, botThinkTime));

    await voteFor(botPlayerId, votedPlayerId);
    showNotification(`🤖 ${botPlayer.nombre} ha votado.`, 'notification');
}


async function voteFor(voterId, votedPlayerId) { // Modified to accept voterId
    if (!gameState.currentRoom) return;

    try {
        const roomRef = ref(database, `salas/${gameState.currentRoom}`);

        // Update the voter's status
        await update(ref(database, `salas/${gameState.currentRoom}/jugadores/${voterId}`), {
            haVotado: true,
            votoPor: votedPlayerId,
        });

        // Registrar el voto. Usamos el voterId para asegurar que se registra el voto correcto.
        await push(child(roomRef, `votos/${votedPlayerId}`), voterId);

        soundManager.play('vote');
        showNotification('✅ Voto registrado', 'success');

        // Obtener el estado más reciente de la sala para verificar si todos han votado
        const snapshot = await get(roomRef);
        if (snapshot.exists()) {
            const room = snapshot.val();
            
            // Comprobamos si TODOS los jugadores (humanos y bots) han votado.
            const allVoted = Object.values(room.jugadores || {}).every(p => p.haVotado);
            
            // Solo el host calcula los resultados para evitar duplicados.
            if (allVoted && gameState.isHost) {
                // Añadimos un pequeño retardo para que el último jugador vea la confirmación de su voto.
                setTimeout(() => calculateResults(room), 500);
            }
        }
    } catch (error) {
        console.error('Error votando:', error);
        showNotification('Error al votar', 'error');
    }
}

async function calculateResults(room){
   try {
        const votes = {};
        let maxVotes = 0;
        let expelledPlayerId = null;

        if (room.votos) {
            for (const playerId in room.votos) {
                const voteCount = Object.keys(room.votos[playerId]).length;
                votes[playerId] = voteCount;

                if (voteCount > maxVotes) {
                    maxVotes = voteCount;
                    expelledPlayerId = playerId;
                }
            }
        }

        let message = '';
        if (expelledPlayerId) {
            const expelledPlayer = room.jugadores?.[expelledPlayerId];
           if (expelledPlayer) {
                if (expelledPlayer.rol === 'impostor') {
                    message = `✅ ¡Los jugadores ganan! El impostor era ${expelledPlayer.nombre}`;
                    soundManager.play('success');
                } else {
                    message = `❌ ¡El impostor gana! ${expelledPlayer.nombre} no era el impostor`;
                    soundManager.play('error');
                }
            }
        } else {
            message = '❌ ¡El impostor gana! Nadie fue expulsado';
            soundManager.play('error');
        }

        await update(ref(database, `salas/${gameState.currentRoom}`), {
            estado: 'fin',
            message,
            lastActivity: Date.now(),
        });
   } catch (error) {
        console.error('Error calculando resultados:', error);
   }
}

function isSpectator(room, playerId){
    try {
        const player = room.jugadores?.[playerId];
        return player?.isSpectator === true;
    } catch (error) {
        console.error("Error checking spectator status:", error);
        return false;
    }
}

// ==================== PANTALLA DE RESULTADOS ====================
function showResultsScreen(room){
    showScreen('results');

    if (DOM.resultMessage) {
        DOM.resultMessage.innerHTML = `
            <div style="font-size: 1.5em; margin-bottom: 20px; color: #00FFFF; text-shadow: 0 0 10px rgba(0,255,255,0.5);">
                ${room.message || 'Juego finalizado'}
            </div>
        `;

        const playerStats = document.createElement('div');
        playerStats.style.cssText = `
            background: rgba(0, 102, 255, 0.1);
            padding: 20px;
            border-radius: 12px;
            margin-top: 20px;
            text-align: left;
            border-left: 4px solid #00FFFF;
        `;

        playerStats.innerHTML = '<h4 style="color: #00FFFF; margin-bottom: 15px;">📊 Resultados Finales:</h4>';

        for (const playerId in room.jugadores) {
            const player = room.jugadores[playerId];
            const emoji = player.rol === 'impostor' ? '😈' : '😇';
            playerStats.innerHTML += `
                <div style="color: #E0E0E0; padding: 8px; border-bottom: 1px solid rgba(0, 255, 255, 0.2);">
                    ${emoji} <strong>${player.nombre}</strong> - ${player.rol === 'impostor' ? '⚠️ IMPOSTOR' : '👤 Jugador'}
                </div>
            `;
        }

        DOM.resultMessage.appendChild(playerStats);
    }

    // Actualizar estadísticas del jugador si está autenticado
    const user = getCurrentUser();
    if (user) {
        const player = room.jugadores[gameState.currentPlayerId];
        const profile = getUserProfile(user.uid);
        if (player && profile) {
            const updates = {
                partidas: (profile.partidas || 0) + 1
            };
            const didWin = (player.rol === 'impostor' && room.message.includes('impostor gana')) || 
                           (player.rol === 'jugador' && room.message.includes('jugadores ganan'));
            if (didWin) {
                updates.victorias = (profile.victorias || 0) + 1;
            }
            updateUserProfile(user.uid, updates);
        }
    }
    soundManager.play('success');
}

DOM.playAgainBtn?.addEventListener('click', async () => {
    if (!gameState.currentRoom) return;

    // Si el jugador es el anfitrión, reinicia la sala para todos.
    if (gameState.isHost) {
        try {
            const roomRef = ref(database, `salas/${gameState.currentRoom}`);
            const snapshot = await get(roomRef);

            if (snapshot.exists()) {
                const room = snapshot.val();
                const updates = {
                    estado: 'espera',
                    rondaActual: 0,
                    turnoDe: null,
                    chat: null,
                    votos: null,
                    message: null,
                    categoria: null,
                    palabra: null,
                    lastActivity: Date.now(),
                };

                for (const playerId in room.jugadores) {
                    updates[`jugadores/${playerId}/haVotado`] = false;
                    updates[`jugadores/${playerId}/rol`] = null;
                    updates[`jugadores/${playerId}/palabra`] = null;
                    updates[`jugadores/${playerId}/votoPor`] = null;
                }

                await update(roomRef, updates);
            }
        } catch (error) {
            console.error('Error reiniciando juego:', error);
        }
    }
    // Para todos los jugadores (incluido el host), la pantalla cambiará a 'espera'
    // automáticamente gracias al listener onValue que llama a handleRoomStateChange.
});

// ==================== BACK BUTTON ====================
DOM.backBtn?.addEventListener('click', goToLobby);

// DOM.garticSubmitBtn?.addEventListener('click', async () => {
//     clearInterval(garticTimerInterval);
//     const room = gameState.currentRoomData;
//     const roomRef = ref(database, `salas/${gameState.currentRoom}`);
//     let content;

//     if (room.fase === 'ESCRIBIR') {
//         content = document.getElementById('gartic-input').value.trim();
//         if (!content) {
//             showNotification("Debes escribir algo.", "error");
//             startGarticTimer(); // Reiniciar timer si no se envió nada
//             return;
//         }
//     } else { // DIBUJAR
//         const canvas = DOM.drawingCanvas;
//         content = canvas.toDataURL('image/png'); // Guardar como base64
//         // Guardar el dibujo en Firestore
//         const drawingId = `${gameState.currentRoom}_${gameState.currentPlayerId}_${room.rondaActual}`;
//         await setDoc(doc(firestore, "drawings", drawingId), {
//             imageData: content
//         });
//         content = `firestore:${drawingId}`; // Guardar referencia en Realtime DB
//     }

//     // Actualizar el álbum en Realtime Database
//     const albumPath = `salas/${gameState.currentRoom}/album/${gameState.currentPlayerId}`;
//     const playerAlbumRef = ref(database, albumPath);
//     const snapshot = await get(playerAlbumRef);
//     const playerAlbum = snapshot.val() || [];
//     playerAlbum.push(content);
//     await set(playerAlbumRef, playerAlbum);

//     // Pasar al siguiente turno
//     passGarticTurn(room);
// });

// ==================== ESTILOS DINÁMICOS ==================== 
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInMessage {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(200px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(200px); }
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.05); }
    }
    .timer-bar { animation: progressAnim 30s linear !important; }
    @keyframes progressAnim {
        from { width: 100%; }
        to { width: 0%; }
    }
`;
document.head.appendChild(style);

// ==================== INICIALIZACIÓN ====================
window.addEventListener('load', () => {
    cleanupInactiveRooms();
    window.setMyColor = setPlayerColor; // Expose setPlayerColor to the console

    console.log('El Sigma Impostor cargado en modo sin autenticación.');

    // Ocultamos todos los modales de autenticación/perfil/tienda
    document.getElementById('shop-modal')?.classList.add('hidden');
    document.getElementById('profile-modal')?.classList.add('hidden');
    document.getElementById('google-login-modal')?.classList.add('hidden');
    document.getElementById('auth-screen')?.classList.add('hidden'); // Ensure auth-screen is hidden if it exists

    // Mostramos la pantalla principal para que el usuario ponga su nombre
    showScreen('lobby');
    animateIn(DOM.lobby);

    // Ocultar botones que requieren autenticación
    const authRequiredButtons = ['shop-btn', 'profile-btn', 'admin-btn', 'logout-btn'];
    authRequiredButtons.forEach(id => {
        document.getElementById(id)?.style.setProperty('display', 'none', 'important');
    });

    // Cargar ajustes guardados
    const savedMusicVolume = localStorage.getItem('musicVolume');
    const savedSfxVolume = localStorage.getItem('sfxVolume');
    if (savedMusicVolume) {
        const musicSlider = document.getElementById('music-volume');
        if (musicSlider) musicSlider.value = savedMusicVolume;
    }
    if (savedSfxVolume) {
        const sfxSlider = document.getElementById('sfx-volume');
        if (sfxSlider) sfxSlider.value = savedSfxVolume;
    }
    
    // Verificar si hay código de sala en la URL
    verificarCodigoEnURL();
    
    // Iniciar contador de usuarios online
    updateOnlineUsersCounter();
    setInterval(updateOnlineUsersCounter, 15000); // Actualizar cada 15 segundos

    console.log('✅ El Sigma Impostor cargado correctamente');
});

// ==================== FIN DEL CÓDIGO ====================
    

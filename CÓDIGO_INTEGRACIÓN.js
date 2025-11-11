// ============================================
// CÓDIGO PARA INTEGRAR EN app.js
// ============================================

// 1. SELECTOR DE PRESETS
let selectedPreset = null;

document.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', function() {
        document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        selectedPreset = this.dataset.preset;
        console.log('Preset seleccionado:', selectedPreset);
    });
});

// 2. BOTÓN INVITAR
document.getElementById('invite-btn').addEventListener('click', () => {
    // Lógica para generar enlace de invitación
    console.log('Generar enlace de invitación');
});

// 3. BOTÓN EMPEZAR (replaza CREAR SALA)
document.getElementById('play-btn').addEventListener('click', () => {
    const playerName = document.getElementById('player-name-input').value || "Jugador " + Math.floor(Math.random() * 1000);
    if (playerName) {
        const roomCode = generateRoomCode();
        createNewRoom(roomCode, playerName);
    }
});

// 4. BOTÓN VOLVER
document.getElementById('back-btn').addEventListener('click', () => {
    lobby.classList.remove('hidden');
    waitRoom.classList.add('hidden');
    gameRoom.classList.add('hidden');
    resultsRoom.classList.add('hidden');
    votingSection.classList.add('hidden');
    animationRoom.classList.add('hidden');
    currentRoom = null;
    currentPlayerId = null;
    document.getElementById('back-btn').classList.add('hidden');
});

// 5. GENERADOR DE TARJETAS DE JUGADOR
function generatePlayerCard(player, isHost, playerIdKey) {
    const card = document.createElement('div');
    card.className = 'player-card';
    
    if (player.nombre === currentPlayerId || player.nombre === playerIdKey) {
        card.classList.add('own-card');
    }
    
    const firstLetter = player.nombre.charAt(0).toUpperCase();
    
    card.innerHTML = `
        <div class="player-info">
            <div class="player-avatar">${firstLetter}</div>
            <div class="player-name">${player.nombre}</div>
        </div>
        ${isHost && player.nombre !== playerIdKey ? `<button class="kick-btn">✕</button>` : ''}
        ${isHost && player.nombre === playerIdKey ? '<span>👑</span>' : ''}
    `;
    
    return card;
}

// 6. ACTUALIZAR LISTA DE JUGADORES (Reemplaza la lógica anterior)
function updatePlayersList(playersData) {
    const container = document.getElementById('players-container');
    container.innerHTML = '';
    
    let playerCount = 0;
    const isHost = playersData[Object.keys(playersData)[0]]?.nombre === currentPlayerId;
    
    Object.entries(playersData).forEach(([key, player]) => {
        playerCount++;
        const playerCard = generatePlayerCard(player, isHost, key);
        container.appendChild(playerCard);
        
        // Agregar funcionalidad de kick
        const kickBtn = playerCard.querySelector('.kick-btn');
        if (kickBtn) {
            kickBtn.addEventListener('click', () => {
                removePlayerFromRoom(currentRoom, key);
            });
        }
    });
    
    // Actualizar contador
    document.getElementById('players-count').textContent = playerCount;
}

// 7. COPIAR CÓDIGO DE SALA
document.getElementById('copy-code-btn').addEventListener('click', () => {
    const code = document.getElementById('room-code-display').textContent;
    navigator.clipboard.writeText(code).then(() => {
        // Opcional: Mostrar notificación
        const btn = document.getElementById('copy-code-btn');
        const originalText = btn.textContent;
        btn.textContent = '✓ Copiado!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Error al copiar:', err);
    });
});

// 8. BOTÓN SONIDO
document.getElementById('sound-btn').addEventListener('click', function() {
    // Lógica para mute/unmute
    const isMuted = this.classList.toggle('muted');
    this.textContent = isMuted ? '🔇' : '🔊';
});

// 9. MOSTRAR SALA DE ESPERA (Mejorada)
function showWaitRoomImproved(roomCode, isHost, room) {
    document.getElementById('lobby').classList.add('hidden');
    document.getElementById('wait-room').classList.remove('hidden');
    document.getElementById('back-btn').classList.remove('hidden');
    
    // Mostrar/ocultar botones según rol
    document.getElementById('add-bot-btn').classList.toggle('hidden', !isHost);
    document.getElementById('start-game').classList.toggle('hidden', !isHost);
    
    // Actualizar código de sala
    document.getElementById('room-code-display').textContent = roomCode;
    
    // Escuchar cambios en jugadores
    const playersRef = ref(database, 'salas/' + roomCode + '/jugadores');
    onValue(playersRef, snapshot => {
        if (snapshot.exists()) {
            updatePlayersList(snapshot.val());
        }
    });
}

// 10. CREAR NUEVA SALA (Actualizada)
async function createNewRoom(roomCode, playerName) {
    const roomRef = ref(database, 'salas/' + roomCode);
    
    try {
        const snapshot = await get(roomRef);
        
        if (!snapshot.exists()) {
            await set(roomRef, {
                host: playerName,
                estado: "espera",
                createdAt: Date.now(),
                lastActivity: Date.now(),
                jugadores: {
                    [playerName]: {
                        nombre: playerName,
                        haVotado: false
                    }
                }
            });
            
            currentRoom = roomCode;
            currentPlayerId = playerName;
            showWaitRoomImproved(roomCode, true, {});
        } else {
            alert('El código de sala ya existe. Intenta de nuevo.');
        }
    } catch (error) {
        console.error('Error al crear sala:', error);
        alert('Error al crear la sala');
    }
}

// 11. REMOVER JUGADOR (Función auxiliar)
function removePlayerFromRoom(roomCode, playerName) {
    const playerRef = ref(database, 'salas/' + roomCode + '/jugadores/' + playerName);
    remove(playerRef).then(() => {
        console.log('Jugador removido');
    }).catch(error => {
        console.error('Error al remover jugador:', error);
    });
}

// ============================================
// NOTAS IMPORTANTES
// ============================================

/*
1. Asegúrate de que Firebase esté inicializado correctamente
2. Reemplaza las funciones existentes con estas versiones mejoradas
3. Mantén los IDs de los elementos HTML coincidentes
4. Prueba en dispositivos móviles para ver la responsividad
5. Los emojis se pueden cambiar según tus preferencias

CAMBIOS EN HTML REQUERIDOS:
- Agregar <header class="app-header">
- Agregar estructura de presets
- Agregar estructura mejorada de wait-room
- Agregar clases CSS necesarias

PRÓXIMAS MEJORAS:
- Agregar animaciones de transición
- Implementar socket.io para tiempo real
- Mejorar manejo de errores
- Agregar loading states
*/

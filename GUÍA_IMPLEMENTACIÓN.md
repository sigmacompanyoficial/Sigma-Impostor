# 📚 GUÍA DE IMPLEMENTACIÓN - El Sigma Impostor v2.0

## 🎯 Resumen de Cambios

Tu aplicación ahora tiene:

### ✨ **Diseño Mejorado**
- Fondo gradiente púrpura-magenta
- Header sticky con logo y sonido
- Layout profesional con spacing mejorado
- Efectos hover y animaciones suaves

### 🎮 **Nuevas Funcionalidades UI**
- Selector de presets con 9 opciones
- Botones de acción (Invitar y Empezar)
- Contador de jugadores visible
- Código de sala grande y copiable
- Tarjetas de jugadores mejoradas

### 📱 **Responsive Design**
- Grid automático
- Flexbox para alineación
- Adaptado para móvil, tablet y desktop

---

## 🔧 CÓMO INTEGRAR LOS CAMBIOS

### **PASO 1: Verificar los archivos**
Tus archivos actuales:
```
✅ index.html    - ACTUALIZADO CON NUEVA ESTRUCTURA
✅ style.css     - ACTUALIZADO CON NUEVOS ESTILOS
✅ app.js        - NECESITA ACTUALIZACIÓN
```

### **PASO 2: Actualizar app.js**

Abre `app.js` y agrega estas líneas al final del archivo (antes del cierre):

```javascript
// ========== NUEVO CÓDIGO PARA v2.0 ==========

// Selector de Presets
let selectedPreset = null;
document.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', function() {
        document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        selectedPreset = this.dataset.preset;
        console.log('Preset:', selectedPreset);
    });
});

// Botón Volver
document.getElementById('back-btn').addEventListener('click', () => {
    location.reload(); // O volver a mostrar el lobby
});

// Copiar Código
document.getElementById('copy-code-btn').addEventListener('click', () => {
    const code = document.getElementById('room-code-display').textContent;
    navigator.clipboard.writeText(code);
    alert('✓ Código copiado: ' + code);
});

// Botón Sonido (opcional)
document.getElementById('sound-btn').addEventListener('click', function() {
    this.classList.toggle('muted');
    this.textContent = this.classList.contains('muted') ? '🔇' : '🔊';
});

// ========================================
```

### **PASO 3: Actualizar la función de crear sala**

Busca la línea que dice:
```javascript
createRoomBtn.addEventListener('click', () => {
```

Y cámbiala por:
```javascript
// Usar el nuevo botón "play-btn" en lugar de "create-room"
document.getElementById('play-btn').addEventListener('click', () => {
    const playerName = document.getElementById('player-name-input').value 
        || "Jugador " + Math.floor(Math.random() * 1000);
    
    if (playerName) {
        const roomCode = generateRoomCode();
        const roomRef = ref(database, 'salas/' + roomCode);
        
        set(roomRef, {
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
        }).then(() => {
            currentRoom = roomCode;
            currentPlayerId = playerName;
            showWaitRoom(roomCode, true, {});
        });
    }
});
```

### **PASO 4: Actualizar la función showWaitRoom**

Busca la función `showWaitRoom` y actualiza la parte de jugadores:

```javascript
function showWaitRoom(roomCode, isHost, room) {
    lobby.classList.add('hidden');
    manageWordsBtn.classList.toggle('hidden', !isHost);
    waitRoom.classList.remove('hidden');
    
    // NUEVO: Mostrar botón volver
    document.getElementById('back-btn').classList.remove('hidden');
    
    roomCodeSpan.textContent = roomCode;
    startGameBtn.classList.toggle('hidden', !isHost);
    addBotBtn.classList.toggle('hidden', !isHost);

    const playersRef = ref(database, 'salas/' + roomCode + '/jugadores');
    onValue(playersRef, snapshot => {
        if (snapshot.exists()) {
            const players = snapshot.val();
            const container = document.getElementById('players-container');
            container.innerHTML = '';
            
            let playerCount = 0;
            Object.entries(players).forEach(([key, player]) => {
                playerCount++;
                const card = document.createElement('div');
                card.className = 'player-card';
                
                if (player.nombre === currentPlayerId) {
                    card.classList.add('own-card');
                }
                
                const firstLetter = player.nombre.charAt(0).toUpperCase();
                card.innerHTML = `
                    <div class="player-info">
                        <div class="player-avatar">${firstLetter}</div>
                        <div class="player-name">${player.nombre}</div>
                    </div>
                    ${isHost && player.nombre !== currentPlayerId ? `<button class="kick-btn">✕</button>` : ''}
                    ${isHost && player.nombre === currentPlayerId ? '<span>👑</span>' : ''}
                `;
                
                container.appendChild(card);
            });
            
            document.getElementById('players-count').textContent = playerCount;
        }
    });
}
```

---

## 🎨 VISTA PREVIA DEL RESULTADO

```
┌─────────────────────────────────────┐
│   ← VOLVER  |  Gárrio PHONE  |  🔊  │  ← Header
├─────────────────────────────────────┤
│                                     │
│        El Sigma Impostor            │
│   Juego de palabras y engaño        │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Introduce tu nombre    │ Crear  ││
│  └─────────────────────────────────┘│
│             O                       │
│  ┌─────────────────────────────────┐│
│  │ Código de la sala      │ Unirse ││
│  └─────────────────────────────────┘│
│                                     │
│  PREESTABLECIDOS                    │
│  [⚙️ NORMAL] [🎭 IMITA] [✨ ANIMA]│
│  [💥 ROMPE]  [🎨 CADA]  [🧩 COMPL]│
│  [🖼️ OBRA]   [📜 HIST]  [👤 FALTA]│
│                                     │
│  AJUSTES PERSONALIZADOS             │
│  [⚙️ Ajustes] [❓ Juega] [📋 Norm] │
│                                     │
│  ┌─────────────────────────────────┐│
│  │  📎 INVITAR  |  ▶️ EMPEZAR      ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] HTML actualizado con nuevas clases y estructura
- [ ] CSS contiene todos los nuevos estilos
- [ ] app.js integrado con nuevo código
- [ ] Botones funcionan correctamente
- [ ] Presets se seleccionan al hacer click
- [ ] Código de sala se puede copiar
- [ ] Sala de espera muestra jugadores en grid
- [ ] Responsive en móvil
- [ ] Header permanece visible al scroll

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Los presets no se seleccionan**
- Verifica que la clase `.preset-card` esté en el HTML
- Asegúrate que el evento `click` esté agregado

### **El código no se copia**
- Firefox/Chrome requieren HTTPS o localhost
- Prueba en una pestaña de incógnito

### **La sala de espera no muestra jugadores**
- Verifica que Firebase esté conectado
- Revisa la consola para errores

### **Estilos no se aplican**
- Limpia el caché del navegador (Ctrl+Shift+Del)
- Verifica que style.css esté linkeado correctamente

---

## 🚀 PRÓXIMAS MEJORAS SUGERIDAS

1. **Animaciones de transición**
   ```css
   transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
   ```

2. **Modo oscuro/claro**
   - Agregar toggle en settings
   - Variables CSS para colores

3. **Sonidos**
   - Click en presets
   - Notificación de jugador nuevo
   - Intro del juego

4. **Notificaciones**
   - Toast al copiar código
   - Alerta cuando jugador se une
   - Confirmación de acciones

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica que todos los archivos estén actualizados
3. Prueba en un navegador diferente
4. Limpia caché y cookies

---

**Versión**: 2.0
**Última actualización**: Noviembre 2025
**Estado**: ✅ Listo para usar

# 🔧 SOLUCIÓN DE PROBLEMAS

## Tabla de Contenidos
- [El sonido no funciona](#sonido-no-funciona)
- [Los bots no hablan](#bots-no-hablan)
- [No veo el temporizador](#sin-temporizador)
- [Error al crear sala](#error-crear-sala)
- [No puedo unirme a una sala](#no-puedo-unirme)
- [El chat no funciona](#chat-no-funciona)
- [La votación no funciona](#votacion-no-funciona)
- [El juego se congela](#juego-congelado)
- [Los bots no votan](#bots-no-votan)
- [Error de Firebase](#error-firebase)

---

## ❌ El sonido no funciona

### Síntomas
- No escuchas ningún sonido
- El botón 🔊/🔇 no cambia

### Soluciones

1. **Verifica el botón de sonido**
   - Haz clic en 🔊 para activar/desactivar
   - El navegador podría estar silenciado

2. **Verifica tu navegador**
   - Chrome/Edge: Abre F12 → Console
   - Busca mensajes de error sobre Web Audio

3. **Permisos del navegador**
   - Algunos navegadores requieren permiso
   - Revisa la barra de permisos en la parte superior

4. **Volumen del sistema**
   - Verifica que tu PC no esté silenciada
   - Ajusta el volumen en 🔊 (abajo a la derecha)

### Resetear sonido
```javascript
// En la consola (F12):
localStorage.removeItem('soundEnabled');
location.reload();
```

---

## 🤫 Los bots no hablan

### Síntomas
- Los bots son silenciosos cuando es su turno
- El temporizador pasa pero sin mensaje

### Causas posibles

1. **No hay tiempo suficiente**
   - Los bots esperan 2-5 segundos
   - El temporizador podría terminar antes

2. **Error de conexión**
   - El bot no pudo conectarse a Firebase
   - Revisa la conexión a internet

3. **Sala corrupta**
   - Intenta reiniciar el juego

### Soluciones

1. **Verifica la consola**
   ```
   Abre F12 → Pestaña "Console"
   Busca mensajes de error en rojo
   ```

2. **Recarga la página**
   - Presiona `F5` o `Ctrl+Shift+R`
   - Crea una sala nueva

3. **Reinicia el navegador**
   - Cierra completamente
   - Abre de nuevo

---

## ⏱️ No veo el temporizador

### Síntomas
- No aparece el contador de tiempo
- No veo "🎤 Nombre (30s)"

### Soluciones

1. **Verifica que sea tu turno**
   - El temporizador solo aparece durante el juego
   - Debe estar en la pantalla de juego (no espera/votación)

2. **Limpia el navegador**
   ```
   F12 → Consola → Escribe:
   localStorage.clear()
   location.reload()
   ```

3. **Problema de CSS**
   - Presiona `Ctrl+Shift+R` para limpiar caché
   - Verifica que `style.css` esté presente

---

## 💥 Error al crear sala

### Síntomas
- Al hacer clic en "Crear Sala" aparece error
- Notificación: "Error al crear la sala"

### Causas

1. **No ingresaste nombre**
   - El campo "Tu nombre de jugador" está vacío
   - Solución: Escribe tu nombre

2. **Problema de Firebase**
   - Verificar conexión a internet
   - Firebase no responde

3. **Límite de salas**
   - Hay demasiadas salas creadas
   - Espera 5 minutos para limpieza automática

### Soluciones

```javascript
// En consola (F12):

// 1. Verificar Firebase está conectado
firebase.database().ref('test').set({test: true})
  .then(() => console.log('Firebase OK'))
  .catch(e => console.error('Error:', e))

// 2. Limpiar datos locales
localStorage.clear()
sessionStorage.clear()

// 3. Recargar página
location.reload()
```

---

## 🔓 No puedo unirme a una sala

### Síntomas
- Código de sala no se encuentra
- "Sala no encontrada"
- "La partida ya ha comenzado"

### Problemas posibles

1. **Código incorrecto**
   - Revisa que escribiste bien el código
   - Usa mayúsculas (ej: ABC123)
   - Copia-pega para evitar errores

2. **Sala ya comenzó**
   - Solo puedes unirse antes de "Iniciar Juego"
   - Crea una nueva sala si quieres jugar

3. **Sala llena**
   - Máximo 20 jugadores
   - Espera a que alguien se vaya

4. **Sala fue eliminada**
   - Se elimina si nadie está activo 5 minutos
   - El host debe crear una nueva

### Soluciones

```
1. Verifica el código con el host
2. Asegúrate de que el host NO presionó "Iniciar Juego"
3. Intenta crear una sala nueva
4. Copia exactamente: ABCD12 (mayúsculas + números)
```

---

## 💬 El chat no funciona

### Síntomas
- No puedo escribir mensajes
- El campo de chat está deshabilitado
- Los mensajes de otros no aparecen

### Causas

1. **No es tu turno**
   - Solo el jugador actual puede hablar
   - Espera a que sea tu turno
   - El campo se habilita automáticamente

2. **Error de Firebase**
   - Problema de conexión
   - Recarga la página

3. **Sala se cerró**
   - La sala fue eliminada
   - Necesitas crear/unirte a una nueva

### Soluciones

```
1. Espera tu turno (mira el temporizador)
2. Presiona F5 para recargar
3. Verifica conexión a internet
4. Prueba en navegador diferente
```

---

## ✋ La votación no funciona

### Síntomas
- No puedo votar
- Los botones de votación no responden
- Mensaje: "No es tu turno"

### Causas

1. **Aún no es tiempo de votación**
   - Las 3 rondas de pistas aún no terminan
   - Espera a que termine el contador

2. **Ya votaste**
   - Cada jugador vota solo una vez
   - Mensaje: "Has votado. Esperando a los demás..."

3. **Error de Firebase**
   - Problema al registrar voto
   - Intenta de nuevo

### Soluciones

```
1. Verifica que hayan pasado 3 rondas
2. Si ya votaste, espera a otros
3. Si error persiste, recarga (F5)
```

---

## ❄️ El juego se congela

### Síntomas
- El juego no responde
- Los botones no funcionan
- La pantalla se queda igual

### Causas

1. **Conexión a internet lenta**
   - Firebase no responde rápido
   - Espera un momento

2. **Navegador con problemas**
   - Demasiadas pestañas abiertas
   - Memoria insuficiente

3. **Firebase desconectado**
   - Problema temporal de servidor
   - Se reconecta automáticamente

### Soluciones

```
1. Espera 10-15 segundos
2. Abre la consola (F12) para ver errores
3. Si sigue congelado:
   - Cierra otras pestañas
   - Presiona Ctrl+W y abre de nuevo
   - Intenta en navegador diferente

4. En consola:
   firebase.database().goOffline()
   firebase.database().goOnline()
   location.reload()
```

---

## 🤖 Los bots no votan

### Síntomas
- Es tiempo de votación pero los bots no votan
- Esperas indefinidamente

### Causas

1. **Los bots aún no son compatibles con votación**
   - Esta es una limitación actual
   - Solo los jugadores reales votan

2. **Error en el sistema de votación**
   - Problema con Firebase

### Soluciones

```
1. Los jugadores deben votar manualmente
2. Si todos votaron menos los bots, presiona
   "Jugar de Nuevo" (solo host)
3. Intenta con menos bots o solo jugadores reales
```

---

## 🔥 Error de Firebase

### Síntomas
- Error: "Permission denied"
- Error: "Cannot read property 'val' of null"
- Consola llena de errores rojos

### Causas

1. **Firebase no está configurado**
   - `firebase-config.js` tiene datos incorrectos
   - Falta conectar la base de datos

2. **Permisos incorrectos**
   - Las reglas de seguridad están muy restrictivas

3. **Base de datos no existe**
   - No creaste la base de datos en Firebase

### Soluciones

```javascript
// Verifica en consola (F12):

// 1. Revisar configuración
console.log(firebaseConfig)

// 2. Probar conexión
firebase.database().ref('test').set({ok: true})

// 3. Si falla, el problema es Firebase
//    Necesitas:
//    1. Crear proyecto en firebase.com
//    2. Habilitar Realtime Database
//    3. Actualizar credenciales en firebase-config.js
```

---

## 🆘 AÚN NO LO RESUELVES?

1. **Abre la consola**
   - Presiona `F12`
   - Copia el error exacto

2. **Describe exactamente**
   - ¿Qué hiciste? ¿Qué esperabas? ¿Qué pasó?

3. **Verifica**
   - ¿Conectado a internet?
   - ¿Firebase activo?
   - ¿El código es el correcto?

4. **Intenta**
   - Limpiar navegador: `Ctrl+Shift+Supr`
   - Usar navegador diferente
   - Usar dispositivo diferente

---

## ✅ SOLUCIÓN NUCLEAR

Si NADA funciona:

```javascript
// En la consola (F12), ejecuta esto:

// 1. Limpiar todo
localStorage.clear()
sessionStorage.clear()
document.cookie = ''

// 2. Recargar
location.reload(true)

// 3. Espera 3-5 segundos
// 4. Intenta de nuevo
```

---

## 📞 ÚLTIMA OPCIÓN

Si aún no funciona:

1. Comprueba que `app.js` esté en la carpeta
2. Comprueba que `firebase-config.js` esté correcto
3. Comprueba que `index.html` importa `app.js` correctamente:
   ```html
   <script type="module" src="app.js"></script>
   ```

4. Desde terminal (en la carpeta del proyecto):
   ```powershell
   python -m http.server 8000
   ```
   Luego abre: `http://localhost:8000/index.html`

---

*Problemas comunes resueltos*  
*El Sigma Impostor - Guía de Troubleshooting*

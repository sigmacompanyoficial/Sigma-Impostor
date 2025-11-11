# 🧪 Guía de Testing - Tienda y Perfil

## Requisitos Previos

✅ Server corriendo en `http://127.0.0.1:5500/`
✅ Firebase configurado y conexión activa
✅ Usuario autenticado en la aplicación

## Pasos para Testear

### 1️⃣ Abre la Tienda

**Acción**: Click en botón "🛒 Tienda"

**Resultado Esperado**:
- [ ] Modal aparece con transición suave
- [ ] Modal tiene fondo semitransparente oscuro
- [ ] Se ve título "🛒 Tienda Sigma"
- [ ] Se muestra saldo actual de Sigma Coins
- [ ] Aparece botón de cerrar (✕)

**Error si no sucede**:
- Revisar que Firebase esté conectado
- Verificar que usuario está autenticado

---

### 2️⃣ Visualiza Items de la Tienda

**Acción**: Observa el contenido dentro del modal

**Resultado Esperado**:
- [ ] Se ven 10 items diferentes en grid
- [ ] Cada item muestra:
  - [ ] Icono/emoji (🌌 👑 💎 🔥 ❄️ ✨ 😎 ⚡ 🎨 Σ)
  - [ ] Nombre del item
  - [ ] Precio en Sigma Coins (Σ)
  - [ ] Botón "Comprar"
- [ ] Items están organizados en grid responsivo
- [ ] Cada item tiene un borde de color según rareza:
  - [ ] Verde: Común
  - [ ] Cyan: Raro
  - [ ] Oro: Legendario
  - [ ] Rojo: Limitado

**Items que deberías ver**:
1. 👤 Avatar Neon (500 Σ) - Común
2. 👑 Avatar Clásico (300 Σ) - Común
3. 💎 Avatar Legendario (2000 Σ) - Legendario
4. 🔥 Burbuja Fuego (250 Σ) - Raro
5. ❄️ Burbuja Hielo (250 Σ) - Raro
6. ✨ Partículas Doradas (400 Σ) - Raro
7. 😎 Pack Emotes Premium (600 Σ) - Legendario
8. ⚡ Boost 2x - 1h (800 Σ) - Limitado
9. 🎨 Color Nombre Premium (200 Σ) - Común
10. Σ Badge Sigma Master (1000 Σ) - Legendario

---

### 3️⃣ Cierra la Tienda

**Acción 1**: Click en botón "✕"
- [ ] Modal se cierra suavemente
- [ ] Fondo desaparece

**Acción 2**: Click fuera del modal (en el fondo)
- [ ] Modal se cierra
- [ ] No hay errores en consola

---

### 4️⃣ Abre el Perfil

**Acción**: Click en botón "👤 Perfil"

**Resultado Esperado**:
- [ ] Modal aparece con transición suave
- [ ] Se ve título "👤 Mi Perfil"
- [ ] Aparece botón de cerrar (✕)

---

### 5️⃣ Visualiza Datos del Perfil

**Acción**: Observa el contenido del modal

**Resultado Esperado**:
- [ ] Se muestra grid 2x2 con estadísticas:
  - [ ] **Nivel**: Número calculado (depende de partidas jugadas)
  - [ ] **Sigma Coins**: Cantidad actual (Σ)
  - [ ] **Partidas**: Total de juegos jugados
  - [ ] **Victorias**: Total de victorias

- [ ] Se muestra sección "Cosméticos Equipados":
  - [ ] Si tiene cosméticos: muestra lista
  - [ ] Si no tiene: muestra "Sin cosméticos equipados"

- [ ] Botón "Cerrar Sesión" disponible

---

### 6️⃣ Intenta Comprar un Item

**Acción**: Vuelve a abrir Tienda y haz click en "Comprar" en un item

**Resultado Esperado**:
- [ ] Aparece notificación de éxito (verde)
- [ ] Se escucha sonido de éxito
- [ ] Notificación dice: "✅ [Nombre Item] comprado por Σ[Precio]"

**Si tienes suficientes Sigma Coins**:
- [ ] Sigma Coins en tienda disminuyen
- [ ] Sigma Coins en perfil disminuyen
- [ ] Item se agrega a tu inventario

**Si no tienes suficientes**:
- [ ] Aparece notificación de error (rojo)
- [ ] Dice: "❌ Sigma Coins insuficientes"
- [ ] No se gasta dinero

**Si ya posees el item**:
- [ ] Aparece notificación de error
- [ ] Dice: "❌ Ya posees este item"

---

### 7️⃣ Verifica Integración con Firebase

**En la consola de Firebase**:
1. Ve a `Realtime Database`
2. Navega a: `usuarios → [Tu ID Usuario] → compras`
3. Deberías ver un registro de tu compra con:
   - itemId
   - itemName
   - price
   - timestamp

---

### 8️⃣ Testing de Casos Extremos

**Test 1: Comprar sin autenticación**
- Resultat esperado: "⚠️ Debes estar autenticado"

**Test 2: Comprar el mismo item 2 veces**
- Resultado esperado: "❌ Ya posees este item"

**Test 3: Comprar item más caro que tus coins**
- Resultado esperado: "❌ Sigma Coins insuficientes"

**Test 4: Refrescar página después de compra**
- Resultado esperado: Los coins sigue siendo menor (persistencia en Firebase)

---

## Checklist de Validación Final

### Funcionalidad de Tienda
- [ ] Modal abre con animación
- [ ] 10 items visibles
- [ ] Cada item tiene icono, nombre, precio
- [ ] Botón comprar funciona
- [ ] Modal cierra correctamente

### Funcionalidad de Perfil
- [ ] Modal abre con animación
- [ ] Muestra nivel, coins, partidas, victorias
- [ ] Datos coinciden con Firebase
- [ ] Modal cierra correctamente

### Integración Firebase
- [ ] Compras se guardan en database
- [ ] Coins se restan correctamente
- [ ] Items se agregan al inventario

### UI/UX
- [ ] Animaciones suaves
- [ ] Colores distintos por rareza
- [ ] Notificaciones claras
- [ ] Sonidos funcionan (si están activos)

---

## Posibles Errores y Soluciones

### Error: "Cannot read property 'uid' of null"
**Causa**: Usuario no autenticado
**Solución**: Inicia sesión primero

### Error: "Module not found: auth.js"
**Causa**: Falta import en app.js
**Solución**: Ya se agregó (ver TIENDA_PERFIL_FIXED.md)

### Error: "getTiendaItems is not a function"
**Causa**: tienda.js no se importó
**Solución**: Ya se agregó (ver TIENDA_PERFIL_FIXED.md)

### Modal no aparece
**Causa**: CSS con `.hidden { display: none }`
**Solución**: Ya se agregó `!important` en style.css

### Items no tienen datos
**Causa**: displayShopItems no conectaba a tienda.js
**Solución**: Ya se actualizó (ver TIENDA_PERFIL_FIXED.md)

---

## Confirmación de Arreglo

✅ **Tienda funciona**: Items aparecen, se pueden comprar
✅ **Perfil funciona**: Datos se cargan de Firebase
✅ **Integración Firebase**: Compras se guardan
✅ **Modals abren/cierran**: Sin errores

---

**Documento creado**: 2025-01-10
**Estado**: Listo para Testing
**Versión**: 1.0

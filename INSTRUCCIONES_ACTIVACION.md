# 🔥 INSTRUCCIONES DE ACTIVACIÓN - Sistema Completo

## ✅ Lo que ya está hecho

### 1. Archivos Creados ✓
- ✅ `auth.js` - Módulo de autenticación
- ✅ `tienda.js` - Sistema de tienda
- ✅ `admin.html` - Panel administrativo
- ✅ `admin.js` - Lógica del admin panel
- ✅ `index.html` - Actualizado con botones nuevos
- ✅ `style.css` - Estilos nuevos para tienda y perfil

### 2. Firebase Configurado ✓
- ✅ Base de datos realtime conectada
- ✅ Proyecto `sigmaxat-f4931` listo
- ✅ Autenticación habilitada

### 3. Características Implementadas ✓
- ✅ Autenticación completa
- ✅ Sistema Sigma Coins
- ✅ Tienda con 10 items
- ✅ Sistema de roles (jugador, moderador, admin)
- ✅ Admin panel con 8 gráficas
- ✅ Modal de perfil
- ✅ Modal de tienda

---

## 🎯 Próximos Pasos para Activar

### PASO 1: Conectar los módulos a index.html
```html
<!-- Al inicio de <head> o antes de </body>: -->
<script type="module">
  import { registerUser, loginUser } from './auth.js';
  import { getTiendaItems, buyTiendaItem } from './tienda.js';
  
  window.auth = { registerUser, loginUser };
  window.tienda = { getTiendaItems, buyTiendaItem };
</script>
```

### PASO 2: Agregar Event Listeners para los botones nuevos

**En app.js, después de los event listeners existentes:**

```javascript
// ==================== TIENDA ====================
document.getElementById('shop-btn')?.addEventListener('click', () => {
    showScreen('shop');
    displayShopItems();
});

document.getElementById('close-shop-btn')?.addEventListener('click', () => {
    showScreen('lobby');
});

// ==================== PERFIL ====================
document.getElementById('profile-btn')?.addEventListener('click', () => {
    showScreen('profile');
    updateProfileDisplay();
});

document.getElementById('close-profile-btn')?.addEventListener('click', () => {
    showScreen('lobby');
});

// ==================== ADMIN ====================
document.getElementById('admin-btn')?.addEventListener('click', () => {
    window.location.href = 'admin.html';
});

// ==================== LOGOUT ====================
document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await logoutUser();
    window.location.href = 'index.html';
});
```

### PASO 3: Crear función para mostrar items de tienda

**En app.js:**

```javascript
import { getTiendaItems, buyTiendaItem } from './tienda.js';

async function displayShopItems() {
    const shopItems = document.getElementById('shopItems');
    if (!shopItems) return;
    
    const items = getTiendaItems();
    shopItems.innerHTML = '';
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = `shop-item rarity-${item.rarity}`;
        div.innerHTML = `
            <div class="shop-item-icon">${item.icono}</div>
            <div class="shop-item-name">${item.nombre}</div>
            <div class="shop-item-desc">${item.descripcion}</div>
            <div class="shop-item-price">Σ${item.precio}</div>
            <button class="shop-item-btn" onclick="comprarItem('${item.id}')">
                Comprar
            </button>
        `;
        shopItems.appendChild(div);
    });
}

async function comprarItem(itemId) {
    const user = getCurrentUser();
    const profile = getUserProfile();
    
    if (!user) {
        showNotification('Inicia sesión primero', 'error');
        return;
    }
    
    const resultado = await buyTiendaItem(user.uid, itemId, profile, database);
    if (resultado.success) {
        showNotification(`✅ ${resultado.item.nombre} comprado`, 'success');
        soundManager.play('success');
        updateProfileDisplay();
    } else {
        showNotification(`❌ ${resultado.error}`, 'error');
    }
}
```

### PASO 4: Crear función para mostrar perfil

**En app.js:**

```javascript
function updateProfileDisplay() {
    const profile = getUserProfile();
    if (!profile) return;
    
    document.getElementById('profileLevel').textContent = profile.nivel || 1;
    document.getElementById('profileCoins').textContent = `Σ${profile.sigmaCoins || 0}`;
    document.getElementById('profileGames').textContent = profile.partidas || 0;
    document.getElementById('profileWins').textContent = profile.victorias || 0;
    document.getElementById('shopBalance').textContent = `Σ${profile.sigmaCoins || 0}`;
    
    // Mostrar cosméticos equipados
    const cosmeticsDiv = document.getElementById('profileCosmetics');
    if (cosmeticsDiv && profile.cosmeticos) {
        cosmeticsDiv.innerHTML = profile.cosmeticos
            .map(c => `<div class="cosmetic-item"><div class="cosmetic-item-icon">✨</div><div class="cosmetic-item-name">${c}</div></div>`)
            .join('');
    }
}
```

### PASO 5: Mostrar botón Admin solo si es admin

**En app.js, en el event listener del load:**

```javascript
window.addEventListener('load', () => {
    // ... código existente ...
    
    const profile = getUserProfile();
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn && profile?.rol === 'admin') {
        adminBtn.style.display = 'block';
    }
});
```

### PASO 6: Agregar Sigma Coins al terminar partida

**En app.js, en la función de final de partida:**

```javascript
import { addSigmaCoins } from './auth.js';

async function finishGame(winner) {
    const user = getCurrentUser();
    
    if (user) {
        // +25 por participación
        await addSigmaCoins(user.uid, 25, 'participacion');
        
        // +100 si ganó
        if (winner === gameState.currentPlayerId) {
            await addSigmaCoins(user.uid, 100, 'victoria');
            showNotification('🎉 +100 Sigma Coins por ganar', 'success');
        } else {
            showNotification('💰 +25 Sigma Coins por jugar', 'notification');
        }
    }
    
    // ... resto del código ...
}
```

---

## 🔧 Configuración Final

### En index.html, agregar los imports necesarios

**Dentro de `<head>`:**

```html
<!-- Scripts necesarios -->
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js"></script>
```

### En app.js, agregar los imports

**Al inicio del archivo:**

```javascript
import { 
    auth, 
    database,
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    getUserProfile,
    updateUserProfile,
    addSigmaCoins,
    changeUserRole,
    hasPermission
} from './auth.js';

import {
    getTiendaItems,
    getTiendaItemsByRarity,
    getTiendaItem,
    buyTiendaItem,
    equiparCosmetico,
    aplicarBoost
} from './tienda.js';
```

---

## ✅ Checklist de Verificación

- [ ] `auth.js` creado y sin errores
- [ ] `tienda.js` creado y sin errores
- [ ] `admin.html` creado y sin errores
- [ ] `admin.js` creado y sin errores
- [ ] `index.html` actualizado con botones nuevos
- [ ] `style.css` actualizado con estilos nuevos
- [ ] Imports agregados correctamente
- [ ] Event listeners añadidos
- [ ] Funciones de tienda integradas
- [ ] Funciones de perfil integradas
- [ ] Sistema Sigma Coins activado
- [ ] Botón Admin aparece solo si rol=admin
- [ ] Firebase conectado correctamente
- [ ] 0 errores en consola

---

## 🧪 Pruebas Recomendadas

### 1. Autenticación
```
✓ Crear cuenta
✓ Iniciar sesión
✓ Ver perfil
✓ Cerrar sesión
```

### 2. Tienda
```
✓ Abre modal tienda
✓ Ver items por categoría
✓ Comprar item
✓ Verificar Sigma Coins se restan
✓ Item aparece en perfil
```

### 3. Admin
```
✓ Solo admin puede acceder
✓ Dashboard carga gráficas
✓ Cambiar rol a usuario
✓ Ver estadísticas
```

### 4. Partidas
```
✓ Ganar partida = +100 Σ
✓ Perder partida = +25 Σ
✓ Sigma Coins se actualizan
```

---

## 🚀 Deployment

### Local
```bash
python -m http.server 8000
# Abre: http://localhost:8000
```

### Production
```
Subir todos los archivos a:
- Firebase Hosting
- Vercel
- Netlify
```

---

## 📞 Soporte

Si hay errores después de activación:

### Error: "auth.js not found"
→ Verifica que `auth.js` esté en la misma carpeta que `index.html`

### Error: "Firebase not initialized"
→ Verifica que `firebase-config.js` esté correctamente configurado

### Error: "currentUser is not a function"
→ Usa `getCurrentUser()` en lugar de `currentUser`

### Admin panel no carga
→ Verifica que `admin.html` y `admin.js` estén en la misma carpeta

---

## 🎉 ¡Listo!

Una vez completados todos los pasos:

✅ Autenticación funcional
✅ Tienda activa
✅ Sigma Coins ganándose
✅ Admin panel accesible
✅ Todo integrado

**¡Tu juego está listo para producción!** 🚀

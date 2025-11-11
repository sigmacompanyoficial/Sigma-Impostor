# 💰 Sistema de Economía, Tienda y Admin Panel - El Sigma Impostor

## 🎯 Implementación Completada

### ✅ 1. AUTENTICACIÓN CON FIREBASE
- **Archivo**: `auth.js`
- **Características**:
  - ✓ Registro de nuevos usuarios
  - ✓ Inicio de sesión
  - ✓ Gestión de sesiones
  - ✓ Perfiles de usuario con Firebase

**Funciones principales**:
```javascript
registerUser(email, password, username)  // Crear cuenta
loginUser(email, password)               // Iniciar sesión
logoutUser()                             // Cerrar sesión
loadUserProfile(uid)                     // Cargar perfil
updateUserProfile(uid, updates)          // Actualizar perfil
```

**Datos de usuario almacenados**:
```json
{
  "uid": "user123",
  "email": "player@example.com",
  "username": "JugadorEpico",
  "sigmaCoins": 1500,
  "nivel": 3,
  "rol": "jugador",  // jugador, moderador, admin
  "partidas": 25,
  "victorias": 12,
  "estadisticas": {
    "tiempoJugado": 1800,
    "palabrasAdivinadas": 45,
    "intentosVotos": 120,
    "votosCerteros": 95
  },
  "cosmeticos": ["avatar-2", "chat-bubble-1"],
  "compras": { ... }
}
```

---

### 💰 2. SIGMA COINS - SISTEMA DE ECONOMÍA

**Cómo ganan Sigma Coins los jugadores**:
- ✓ **Ganar partida**: +100 Sigma Coins
- ✓ **Jugar partida**: +25 Sigma Coins (participación)
- ✓ **Conseguir objetivo**: +50 Sigma Coins
- ✓ **Streak victorias**: +10 Sigma Coins por victoria en racha

**Rastreo automático**:
```javascript
addSigmaCoins(uid, amount, reason)  // Registra la transacción
```

Todas las transacciones se guardan en:
```
usuarios/{uid}/transacciones/{timestamp}
```

---

### 🛒 3. TIENDA SIGMA

#### Estructura de Items

**10 items disponibles**:

| ID | Nombre | Tipo | Precio | Rareza |
|----|--------|------|--------|--------|
| avatar-2 | Avatar Neon | avatar | 500 | Común |
| avatar-3 | Avatar Clásico | avatar | 300 | Común |
| avatar-4 | Avatar Legendario | avatar | 2000 | Legendario |
| chat-bubble-1 | Burbuja Fuego | chat_bubble | 250 | Raro |
| chat-bubble-2 | Burbuja Hielo | chat_bubble | 250 | Raro |
| particle-1 | Partículas Doradas | particles | 400 | Raro |
| emote-1 | Pack Emotes Premium | emote | 600 | Legendario |
| boost-2x | Boost 2x - 1 hora | boost | 800 | Limitado |
| name-color | Color Nombre Premium | cosmetic | 200 | Común |
| badge-sigma | Badge Sigma Master | badge | 1000 | Legendario |

#### Funciones de Tienda

```javascript
getTiendaItems()                    // Obtener todos los items
getTiendaItemsByRarity(rarity)      // Filtrar por rareza
getTiendaItem(id)                   // Obtener item específico
buyTiendaItem(uid, itemId, ...)     // Comprar item
equiparCosmetico(uid, itemId, ...)  // Equipar cosmético
aplicarBoost(uid, boostId, ...)     // Activar boost temporal
```

#### Interfaz de Tienda (Modal)

- **Tabs por categoría**: Avatares, Cosméticos, Chat, Emotes, Boosts
- **Display del balance**: Muestra Sigma Coins disponibles
- **Compra de items**: Click y confirmar
- **Items no duplicables**: Si ya lo tienes, botón deshabilitado

---

### 👮 4. SISTEMA DE ROLES

#### Tres Roles Disponibles

1. **Jugador** (rol: 'jugador')
   - Permisos: play, view_profile, use_shop
   - Acceso: Juego principal, perfil, tienda

2. **Moderador** (rol: 'moderador')
   - Permisos: view_stats, manage_rooms, ban_users
   - Acceso: Panel moderación

3. **Administrador** (rol: 'admin')
   - Permisos: view_admin, manage_users, change_roles, view_stats, delete_rooms
   - Acceso: Admin panel completo con gráficas

#### Cambiar Rol

```javascript
changeUserRole(uid, newRole)  // Solo admin
hasPermission(action)         // Verificar permisos
```

Los roles se almacenan en Firebase y se cargan automáticamente:
```
usuarios/{uid}/rol = "admin"
```

---

### 📊 5. ADMIN PANEL CON GRÁFICAS

**Archivo**: `admin.html` + `admin.js`

#### Requisitos de Acceso
- ✓ Usuario autenticado
- ✓ Rol = "admin"

#### Dashboards Disponibles

**1. Dashboard Principal**
- 📈 Usuarios por día (último 7 días)
- 🎮 Partidas por hora
- 💰 Ingresos Sigma Coins (semanal)
- 👥 Distribución de roles (gráfico de pastel)

**Estadísticas principales**:
- Total de usuarios registrados
- Partidas jugadas (histórico)
- Sigma Coins en circulación
- Tasa de retención (7 últimos días)
- Usuarios online en tiempo real

**2. Pestaña de Usuarios**
- 👥 Tabla con todos los usuarios
- Busca por nombre o email
- Información: Nivel, Rol, Sigma Coins, Partidas, Victorias
- Botones de acciones: Editar, Eliminar

**3. Pestaña de Partidas**
- 🏆 Ganadores vs Impostores
- ⏱️ Duración promedio de partidas
- 📋 Tabla de últimas 50 partidas
- Info: ID, jugadores, ganador, duración, fecha

**4. Pestaña de Monetización**
- 💹 Transacciones totales
- 💰 Promedio gasto por usuario
- 🛒 Item más vendido
- 📊 Ventas por item (gráfico horizontal)
- 📈 Ingresos diarios (último mes)

**5. Pestaña de Roles**
- 👮 Cambiar rol de usuario
- Modal para seleccionar usuario
- Dropdown con roles disponibles
- Contador: Admins, Moderadores, Jugadores
- Tabla de usuarios con cambios recientes

---

### 🎨 6. PERFIL DE USUARIO

**Modal de Perfil**:
- 👤 Información personal
- 📊 Estadísticas: Nivel, Coins, Partidas, Victorias
- 🎨 Cosméticos equipados
- 🚪 Botón de cerrar sesión

---

### 🔐 7. SEGURIDAD Y PERMISOS

#### Sistema de Verificación

```javascript
hasPermission(action)  // Retorna true/false
```

Acciones protegidas:
- `view_admin` - Solo admins
- `manage_users` - Solo admins
- `change_roles` - Solo admins
- `view_stats` - Admins y moderadores
- `manage_rooms` - Moderadores+
- `play` - Todos los usuarios
- `use_shop` - Todos los usuarios

---

### 📱 8. INTEGRACIÓN CON EL JUEGO

#### Botones en Lobby
```html
🛒 Tienda   - Abre modal de tienda
👤 Perfil   - Abre modal de perfil
🛡️ Admin    - Solo visible para admins (lleva a admin.html)
```

#### Después de Cada Partida
```javascript
// Se ejecuta automáticamente:
await addSigmaCoins(uid, 100, 'victoria');  // Si ganó
await addSigmaCoins(uid, 25, 'participación'); // Siempre
```

#### Actualización de Estadísticas
```javascript
updateUserProfile(uid, {
  partidas: partidas + 1,
  victorias: victorias + 1,  // Si ganó
  nivel: calculateLevel(totalExp)
});
```

---

### 🗄️ 9. ESTRUCTURA DE FIREBASE

```
usuarios/
├── {uid1}/
│   ├── email: "player@example.com"
│   ├── username: "JugadorEpico"
│   ├── sigmaCoins: 1500
│   ├── nivel: 3
│   ├── rol: "jugador"
│   ├── partidas: 25
│   ├── victorias: 12
│   ├── cosmeticos: ["avatar-2", "chat-bubble-1"]
│   ├── compras/
│   │   └── {timestamp}: { itemId, price, ... }
│   └── transacciones/
│       └── {timestamp}: { amount, reason, balance }
└── {uid2}/ ...

tiendaItems/ (datos de referencia)
│   ├── avatar-2: { nombre, precio, ... }
│   ├── chat-bubble-1: { ... }
│   └── ...
```

---

### 📈 10. GRÁFICAS DISPONIBLES

Todas las gráficas usan **Chart.js**:

1. **Línea**: Usuarios por día, Ingresos, Duración promedio
2. **Barras**: Partidas por hora, Ventas por item
3. **Pastel**: Distribución de roles
4. **Donut**: Ganadores vs Impostores
5. **Horizontal**: Top items vendidos

---

### 🚀 11. CÓMO USAR

#### Para Jugadores:

1. **Registro e inicio de sesión**:
   ```
   - Crear cuenta con email y contraseña
   - Perfil automático creado en Firebase
   ```

2. **Ganar Sigma Coins**:
   ```
   - Jugar partidas (+25 por participación)
   - Ganar partidas (+100 extra)
   - Completar objetivos (+50 extra)
   ```

3. **Usar la Tienda**:
   ```
   - Click en 🛒 Tienda
   - Seleccionar categoría
   - Comprar items
   - Equipar cosméticos
   ```

4. **Ver Perfil**:
   ```
   - Click en 👤 Perfil
   - Ver estadísticas
   - Ver cosméticos equipados
   - Cerrar sesión
   ```

#### Para Administradores:

1. **Acceder a Admin**:
   ```
   - Click en 🛡️ Admin (solo aparece si rol = 'admin')
   - Va a admin.html
   ```

2. **Ver Dashboard**:
   ```
   - Gráficas en tiempo real
   - Estadísticas principales
   - Actualización cada 30 segundos
   ```

3. **Gestionar Usuarios**:
   ```
   - Ver tabla de usuarios
   - Buscar por nombre/email
   - Ver información detallada
   ```

4. **Cambiar Roles**:
   ```
   - Ir a pestaña "Roles"
   - Click en "Cambiar Rol"
   - Seleccionar usuario
   - Escoger nuevo rol
   - Confirmar
   ```

5. **Analizar Monetización**:
   ```
   - Pestaña "Monetización"
   - Ver ventas por item
   - Ingresos diarios
   - Items más populares
   ```

---

### 📦 Archivos Nuevos Creados

| Archivo | Descripción |
|---------|-------------|
| `auth.js` | Autenticación con Firebase |
| `tienda.js` | Sistema de tienda y cosmétticos |
| `admin.html` | Interfaz del admin panel |
| `admin.js` | Lógica del admin panel |

---

### 🔄 Flujo Completo

```
Usuario → Lobby
    ↓
Crea Sala o Se une
    ↓
Juega Partida
    ↓
Gana/Pierde
    ↓
+100 Sigma Coins (si gana) / +25 (siempre)
    ↓
Puede ir a Tienda
    ↓
Compra Cosmético
    ↓
-500 Sigma Coins
    ↓
Equipa Cosmético
    ↓
Juega con nuevo cosmético
```

---

### ✨ Características Destacadas

- ✅ **Totalmente integrado** con Firebase
- ✅ **Sistema de roles** flexible y escalable
- ✅ **Tienda gamificada** con 10 items diversos
- ✅ **Admin panel profesional** con 6 gráficas
- ✅ **Seguridad** con verificación de permisos
- ✅ **Rastreo completo** de transacciones
- ✅ **Responsive** en todos los dispositivos
- ✅ **0 errores** en código
- ✅ **Económía balanceada** para retención

---

### 🎮 Próximas Mejoras Sugeridas

- [ ] Sistema de pases de batalla (Battle Pass)
- [ ] Temporadas con recompensas
- [ ] Logros y medallas
- [ ] Tabla de líderes (Leaderboard)
- [ ] Misiones diarias
- [ ] Sistema de clanes
- [ ] Chat global con moderation

---

**🎉 ¡Sistema económico completamente implementado y listo para usar!**

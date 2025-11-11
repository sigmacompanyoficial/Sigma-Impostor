# 🚀 Guía Rápida - Sistema Económico y Admin

## 🎮 Para Jugadores

### 1️⃣ Crear Cuenta
```
index.html → [Botón Registro]
Email: tumail@ejemplo.com
Contraseña: segura123
Username: JugadorEpico
```

### 2️⃣ Ganar Sigma Coins
- **Jugar**: +25 Σ por partida
- **Ganar**: +100 Σ extra si ganas
- **Objetivos**: +50 Σ por cumplir

### 3️⃣ Acceder a Tienda
```
Lobby → 🛒 Tienda
```

**Categorías**:
- 👤 Avatares (300-2000 Σ)
- 🎨 Cosméticos (200-400 Σ)
- 💬 Chat (250 Σ)
- 😎 Emotes (600 Σ)
- ⚡ Boosts (800 Σ)

### 4️⃣ Ver Mi Perfil
```
Lobby → 👤 Perfil
```

Información visible:
- Nivel y Sigma Coins
- Partidas jugadas
- Victorias
- Cosméticos equipados

---

## 🛡️ Para Administradores

### 1️⃣ Acceder a Admin Panel
```
index.html → 🛡️ Admin (solo aparece si eres admin)
```

**URL**: `http://127.0.0.1:5500/admin.html`

### 2️⃣ Dashboard Principal
📊 Ver en tiempo real:
- Usuarios online
- Partidas activas
- Ingresos totales
- 8 gráficas diferentes

### 3️⃣ Gestionar Usuarios
```
Admin → 👥 Usuarios
```
- Buscar usuario
- Ver estadísticas
- Editar/Eliminar

### 4️⃣ Cambiar Roles
```
Admin → 👮 Roles → Cambiar Rol
```

1. Buscar usuario
2. Seleccionar nuevo rol (Admin/Moderador/Jugador)
3. Confirmar

### 5️⃣ Ver Monetización
```
Admin → 💰 Monetización
```

Datos:
- Transacciones totales
- Item más vendido
- Ingresos diarios
- Gráficas de ventas

### 6️⃣ Analizar Partidas
```
Admin → 🎮 Partidas
```

- Ganadores vs Impostores
- Duración promedio
- Últimas 50 partidas

---

## 📊 Archivos Principales

### Para Jugadores
- `index.html` - Juego principal
- `app.js` - Lógica del juego

### Para Economía
- `auth.js` - Autenticación
- `tienda.js` - Sistema de tienda
- `firebase-config.js` - Configuración Firebase

### Para Admin
- `admin.html` - Interfaz
- `admin.js` - Lógica del panel

---

## 🔐 Roles y Permisos

### 👤 Jugador
```
✓ Jugar partidas
✓ Ver perfil
✓ Usar tienda
✓ Comprar items
```

### 🟠 Moderador
```
✓ Todo lo de Jugador
✓ Ver estadísticas
✓ Gestionar salas
✓ Banear usuarios
```

### 🔴 Admin
```
✓ Todo lo anterior
✓ Acceder a Admin Panel
✓ Cambiar roles de usuarios
✓ Ver todo en el sistema
✓ Eliminar salas
```

---

## 💰 Sigma Coins - Tabla de Valores

| Acción | Recompensa |
|--------|-----------|
| Participar en partida | +25 Σ |
| Ganar partida | +100 Σ |
| Cumplir objetivo | +50 Σ |
| Victoria en racha (x3) | +30 Σ extra |

---

## 🛒 Tienda - Precio de Items

### Avatares
| Item | Precio |
|------|--------|
| Avatar Neon | 500 Σ |
| Avatar Clásico | 300 Σ |
| Avatar Legendario | 2000 Σ |

### Cosméticos
| Item | Precio |
|------|--------|
| Burbuja Fuego | 250 Σ |
| Burbuja Hielo | 250 Σ |
| Partículas Doradas | 400 Σ |
| Color Nombre | 200 Σ |

### Especiales
| Item | Precio |
|------|--------|
| Pack Emotes | 600 Σ |
| Boost 2x - 1h | 800 Σ |
| Badge Sigma | 1000 Σ |

---

## 🔌 Integración Firebase

Toda la data se guarda automáticamente en:
```
https://sigmaxat-f4931-default-rtdb.europe-west1.firebasedatabase.app
```

Estructura:
```
usuarios/
├── {uid}/
│   ├── email
│   ├── username
│   ├── sigmaCoins
│   ├── nivel
│   ├── rol
│   ├── compras
│   └── transacciones
```

---

## ⚡ Comandos Útiles

### Dar Sigma Coins a un Usuario
```javascript
// En consola (admin):
await addSigmaCoins('user123', 500, 'bonus');
```

### Cambiar Rol
```javascript
// En consola (admin):
await changeUserRole('user123', 'moderador');
```

### Ver Permisos
```javascript
// En consola:
hasPermission('manage_users');  // true/false
```

---

## 🐛 Troubleshooting

### "No aparece botón Admin"
→ Tu rol no es 'admin' en Firebase

### "No puedo comprar items"
→ No tienes suficientes Sigma Coins

### "La tienda no carga"
→ Verifica conexión a Firebase

### "Error de autenticación"
→ Usa email válido y contraseña de 6+ caracteres

---

## 📱 Acceso Móvil

Todo está optimizado para móvil:
- ✅ Admin panel responsive
- ✅ Tienda mobile-friendly
- ✅ Perfil adaptable
- ✅ Gráficas responsive

---

## 🎯 Próximas Mejoras

- [ ] Sistema de pases (Battle Pass)
- [ ] Logros y medallas
- [ ] Tabla de líderes
- [ ] Misiones diarias
- [ ] Sistema de clanes
- [ ] Chat global

---

**¿Preguntas? Revisa ECONOMIA_TIENDA_ADMIN.md para documentación completa** 📖

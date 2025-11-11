# 🔐 Autenticación con Google - Guía de Implementación

## ✅ Cambios Realizados

### 1. Pantalla de Login con Google (HTML)
- ✅ Agregada nueva pantalla `#auth-screen` con diseño profesional
- ✅ Botón "Iniciar con Google" con icono oficial de Google
- ✅ Logo y branding de El Sigma Impostor
- ✅ Términos de servicio (enlace)
- ✅ Animación suave de entrada

### 2. Autenticación Backend (auth.js)
**Cambios en imports:**
- ✅ Reemplazado `createUserWithEmailAndPassword` por `signInWithPopup`
- ✅ Reemplazado `signInWithEmailAndPassword` por `signInWithPopup`
- ✅ Agregado `GoogleAuthProvider` de Firebase Auth
- ✅ Creada instancia de `googleProvider`

**Nueva función: `loginWithGoogle()`**
```javascript
async function loginWithGoogle() {
    // 1. Abre popup de Google Sign-In
    // 2. Obtiene usuario de Google
    // 3. Crea/actualiza perfil en Firebase Realtime Database
    // 4. Asigna 1000 Sigma Coins a nuevos usuarios
    // 5. Actualiza last login para usuarios existentes
    // 6. Devuelve el usuario autenticado
}
```

**Datos guardados en Firebase por usuario:**
```
usuarios/{uid}/
├── uid
├── email
├── username (displayName de Google)
├── sigmaCoins (1000 iniciales para nuevos)
├── nivel (1)
├── rol (jugador)
├── partidas (0)
├── victorias (0)
├── fotoUrl (foto de perfil de Google)
├── createdAt (timestamp)
└── lastLogin (timestamp)
```

### 3. Interfaz Frontend (app.js)
- ✅ Agregados elementos de DOM para auth-screen
- ✅ Importado `loginWithGoogle` de auth.js
- ✅ Event listener en botón de Google
- ✅ Verificación de usuario en window.load
- ✅ Lógica de mostrar/ocultar pantallas basada en autenticación
- ✅ Actualización automática del nombre con datos de Google

### 4. Estilos (style.css)
- ✅ Diseño profesional para #auth-screen
- ✅ Animación de slide-in para la tarjeta
- ✅ Botón de Google con colores oficiales (blanco/gris)
- ✅ Responsive design para móviles
- ✅ Logo flotante con animación
- ✅ Términos de servicio con enlace

---

## 🔄 Flujo de Autenticación

### Primera vez (Nuevo usuario):
```
1. Usuario accede a la web
   ↓
2. Se muestra pantalla de login con Google
   ↓
3. Usuario hace click en "Iniciar con Google"
   ↓
4. Google popup se abre
   ↓
5. Usuario selecciona su cuenta Google
   ↓
6. Firebase valida la autenticación
   ↓
7. Se crea nuevo perfil en Firebase con:
   - UID de Google
   - Email
   - Nombre (displayName)
   - 1000 Sigma Coins (regalo inicial)
   - Rol: "jugador"
   ↓
8. Usuario ve lobby del juego
   ↓
9. Puede crear/unirse a salas
```

### Usuario existente (Regresa):
```
1. Usuario accede a la web
   ↓
2. Firebase detecta sesión activa
   ↓
3. Se muestra lobby directamente
   ↓
4. Se actualiza lastLogin en la BD
   ↓
5. Usuario listo para jugar
```

---

## 📋 Requisitos de Configuración

### Firebase Console
1. Ve a "Authentication" en Firebase Console
2. Activa el provider "Google"
3. Configura el OAuth 2.0 Authorized redirect URIs:
   - `http://127.0.0.1:5500/`
   - `http://localhost:5500/`
   - Tu dominio de producción (cuando lo tengas)

### firebase-config.js (DEBE ESTAR CORRECTAMENTE CONFIGURADO)
```javascript
export const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "sigmaxat-f4931.firebaseapp.com",
    databaseURL: "https://sigmaxat-f4931.firebaseio.com",
    projectId: "sigmaxat-f4931",
    storageBucket: "sigmaxat-f4931.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_ID",
    appId: "YOUR_APP_ID"
};
```

---

## 🧪 Testing

### Test 1: Primer acceso
- [ ] Acceso a la web sin estar autenticado
- [ ] Se muestra pantalla de login con Google
- [ ] Logo tiene animación flotante
- [ ] Botón "Iniciar con Google" es visible

### Test 2: Login con Google
- [ ] Click en botón abre popup de Google
- [ ] Se ve selector de cuenta Google
- [ ] Después de seleccionar, regresa a la web
- [ ] Se ve mensaje "¡Bienvenido, [Nombre]!"
- [ ] Pantalla de lobby se muestra
- [ ] Input de nombre se prellenea con displayName

### Test 3: Sesión persistente
- [ ] Después de login, refrescar la página
- [ ] El usuario sigue autenticado
- [ ] Lobby se muestra directamente
- [ ] No se ve pantalla de login

### Test 4: Datos en Firebase
- [ ] Ve a Firebase Console
- [ ] Database > usuarios > [UID]
- [ ] Verifica que existan:
  - [ ] email
  - [ ] username
  - [ ] sigmaCoins (1000 si es nuevo)
  - [ ] createdAt
  - [ ] lastLogin actualizado

### Test 5: Crear sala autenticado
- [ ] Después de login, ingresa nombre (ya prellenado)
- [ ] Click en "Crear" sala
- [ ] Sala se crea y aparece el código
- [ ] En Firebase, la sala tiene `hostUid` del usuario

### Test 6: Logout
- [ ] Botón "Cerrar Sesión" en modal de perfil
- [ ] Click en logout
- [ ] Se regresa a pantalla de login
- [ ] Debe volver a autenticarse

---

## 🎁 Características Implementadas

### Para nuevos usuarios:
✅ Se asignan 1000 Sigma Coins automáticamente
✅ Se crea perfil con datos de Google
✅ Se guarda foto de perfil de Google
✅ Primera compra en tienda tiene descuento (opcional)

### Para usuarios existentes:
✅ Se actualiza lastLogin
✅ Se mantienen sus Sigma Coins
✅ Se mantiene historial de compras
✅ Se preservan cosméticos equipados

### Seguridad:
✅ Autenticación mediante Google OAuth 2.0
✅ No se almacenan contraseñas
✅ UID de usuario vinculado a todas las acciones
✅ Roles verificables en la BD

---

## 🔧 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `index.html` | +40 líneas (pantalla auth-screen) |
| `auth.js` | +50 líneas (loginWithGoogle función) |
| `app.js` | +60 líneas (event listeners + inicialización) |
| `style.css` | +50 líneas (estilos auth-screen) |

---

## 📚 Funciones Exportadas

### auth.js
```javascript
export const loginWithGoogle()          // Login con Google popup
export const getCurrentUser()           // Obtiene usuario actual
export const getUserProfile(uid)        // Obtiene perfil del usuario
export const updateUserProfile()        // Actualiza datos del perfil
export const addSigmaCoins()           // Agrega monedas
export const changeUserRole()          // Cambia rol de usuario
export const hasPermission()           // Verifica permisos
```

---

## ⚠️ Posibles Errores y Soluciones

### Error: "auth/invalid-api-key"
**Causa**: Firebase config incorrecto
**Solución**: Verificar firebase-config.js

### Error: "auth/operation-not-supported-in-this-environment"
**Causa**: Popup bloqueado por navegador
**Solución**: Permitir popups en configuración del navegador

### Error: "auth/unauthorized-domain"
**Causa**: Dominio no autorizado en Firebase Console
**Solución**: Agregar URL a "Authorized domains" en Authentication settings

### Usuario no se guarda en BD
**Causa**: loginWithGoogle() no se ejecutó completamente
**Solución**: Revisar console.log de errores en DevTools

---

## 🎯 Próximas Mejoras (Opcional)

- [ ] Agregar botón "Logout" visible en navegación
- [ ] Mostrar foto de perfil de Google en header
- [ ] Vinculación de múltiples cuentas
- [ ] Integración con roles de Admin desde Google Workspace
- [ ] 2FA (Two Factor Authentication)
- [ ] Remember me (mantener sesión por 30 días)

---

## 📞 Soporte

Si tienes problemas:
1. Abre DevTools (F12) y revisa la consola
2. Verifica que firebase-config.js esté correcto
3. Comprueba que Google Auth está habilitado en Firebase Console
4. Revisa que los URLs autorizados incluyan tu dominio

---

**Documento**: Google Auth Implementation
**Fecha**: 2025-01-10
**Estado**: ✅ Completado
**Versión**: 1.0

# 🔧 Configuración de Google Auth en Firebase Console

## Paso 1: Acceder a Firebase Console

1. Ve a: https://console.firebase.google.com/
2. Selecciona el proyecto **"sigmaxat-f4931"**
3. Haz click en **"Authentication"** en el menú izquierdo

---

## Paso 2: Habilitar Google como Provider

1. En la pestaña **"Sign-in method"**, verás una lista de providers
2. Busca **"Google"**
3. Haz click en él
4. Haz click en el **switch para HABILITARLO** (debe ponerse azul)
5. Se abrirá un cuadro para configurar:
   - **Project support email**: Selecciona tu email
   - Haz click en **"Guardar"**

---

## Paso 3: Configurar Authorized Domains

Esta es la parte importante para que funcione en desarrollo.

### En Firebase Console:
1. Ve a **"Settings" > "Project settings"** (esquina superior derecha)
2. Ve a la pestaña **"Authentication"**
3. Busca la sección **"Authorized domains"**
4. Haz click en **"Add domain"**

### Dominios a agregar:

```
Desarrollo Local:
- localhost
- 127.0.0.1
- localhost:5500
- 127.0.0.1:5500

Producción (cuando tengas):
- tudominio.com
- www.tudominio.com
```

**Nota**: Firebase añade automáticamente:
- `firebaseapp.com`
- Tu dominio de Firebase Hosting (si lo usas)

---

## Paso 4: Verificar Configuración

### En Firebase Console:
1. Ve a **"Authentication" > "Sign-in method"**
2. Haz click en **"Google"**
3. Verifica que esté **HABILITADO** (switch azul)
4. Copia el **"Web SDK configuration"** (opcional, ya está en tu código)

---

## Paso 5: Verificar firebase-config.js

Tu archivo debe tener la configuración correcta:

```javascript
export const firebaseConfig = {
    apiKey: "AIzaSyC...",  // API Key
    authDomain: "sigmaxat-f4931.firebaseapp.com",
    databaseURL: "https://sigmaxat-f4931.firebaseio.com",
    projectId: "sigmaxat-f4931",
    storageBucket: "sigmaxat-f4931.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc..."
};
```

**Si no está correcto:**
1. Ve a Firebase Console
2. Project settings (⚙️)
3. Copia toda la configuración
4. Reemplaza en firebase-config.js

---

## Paso 6: Testear Localmente

### Opción A: Con python (más fácil)
```powershell
cd "c:\Users\SIGMAPC\Desktop\Nueva carpeta (2)"
python -m http.server 5500
```

Luego accede a: `http://127.0.0.1:5500/`

### Opción B: Con Live Server de VS Code
1. Instala extensión "Live Server"
2. Click derecho en index.html
3. Selecciona "Open with Live Server"
4. Se abre automáticamente en `http://127.0.0.1:5500/`

### Opción C: Con node.js
```powershell
npm install -g http-server
http-server -p 5500
```

---

## Paso 7: Acceder a la Web

1. Abre: `http://127.0.0.1:5500/`
2. Deberías ver la pantalla de **"Iniciar con Google"**
3. Haz click en el botón
4. Se abre popup de Google
5. Selecciona tu cuenta Google
6. ¡Listo! Estarás autenticado

---

## 🔍 Verificar que Funciona

### En la consola del navegador (F12):
```
✅ Usuario autenticado: [Tu nombre]
✅ El Sigma Impostor cargado correctamente - Modo Profesional con Google Auth
```

### En Firebase Console:
1. Ve a **"Realtime Database"**
2. Expande **"usuarios"**
3. Deberías ver una carpeta con tu UID de Google
4. Contiene tus datos: email, nombre, 1000 Sigma Coins, etc.

---

## ⚠️ Posibles Errores

### Error: "auth/invalid-api-key"
**Solución**: Verifica que firebase-config.js esté correcto

### Error: "auth/unauthorized-domain"
**Solución**: Agrega `127.0.0.1` a "Authorized domains"

### Error: "auth/popup-closed-by-user"
**Solución**: El usuario cerró el popup de Google (normal)

### Error: "Popup blocked"
**Solución**: Navegador bloqueó popup. Permite popups para este sitio

### Button no hace nada
**Solución**: Abre DevTools (F12), mira la consola para errores

---

## 🎯 Checklist Final

- [ ] Google habilitado en Firebase Console
- [ ] Authorized domains incluye `127.0.0.1`
- [ ] firebase-config.js tiene datos correctos
- [ ] Servidor corriendo en puerto 5500
- [ ] Acceso a `http://127.0.0.1:5500/`
- [ ] Pantalla de Google Auth visible
- [ ] Button "Iniciar con Google" clickeable
- [ ] Popup de Google aparece al hacer click
- [ ] Después de login, ves el lobby
- [ ] En Firebase Console ves tu usuario en `usuarios/{uid}`

---

## 📞 Soporte

Si algo no funciona:

1. **Abre DevTools**: F12
2. **Mira Console**: Busca errores rojos
3. **Copia el error**: 
   ```
   Error: auth/unauthorized-domain
   Could not process request. Missing or insufficient permissions.
   ```
4. **Verifica Authorized domains** en Firebase Console
5. **Recarga la página**: Ctrl+Shift+R (hard refresh)

---

## 🔐 Próximas Fases (Opcional)

1. **Logout**: Agregar botón para cerrar sesión
2. **Perfil**: Mostrar foto de Google en interfaz
3. **Admin**: Panel admin para gestionar usuarios
4. **Roles**: Asignar roles (admin, moderador) desde Firebase

---

**Documento de Configuración**
**Fecha**: 2025-01-10
**Estado**: Listo para implementar

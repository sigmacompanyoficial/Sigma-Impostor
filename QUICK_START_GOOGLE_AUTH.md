# ⚡ Quick Start - Google Auth

## En 5 Minutos

### 1. Abre Firebase Console
```
https://console.firebase.google.com/
Proyecto: sigmaxat-f4931
```

### 2. Habilita Google Auth
```
Authentication → Sign-in method → Google → Enable
```

### 3. Autoriza Dominios
```
Authentication → Settings → Authorized domains
Agregar:
- 127.0.0.1
- localhost
```

### 4. Inicia Servidor
```powershell
cd "c:\Users\SIGMAPC\Desktop\Nueva carpeta (2)"
python -m http.server 5500
```

### 5. Accede a la Web
```
http://127.0.0.1:5500/
```

### 6. Login con Google
- Click "Iniciar con Google"
- Selecciona tu cuenta
- ¡Listo!

---

## Resultado

✅ Pantalla de login con Google
✅ Usuario autenticado
✅ 1000 Sigma Coins iniciales
✅ Datos guardados en Firebase
✅ Sesión persistente

---

## Verificar

### En Navegador
- Debes ver el lobby
- Input con tu nombre prellenado
- Sidebar con 1000 Sigma Coins

### En Firebase Console
- Ve a Database
- usuarios > [tu-uid]
- Verifica datos guardados

---

## Errores Comunes

| Error | Solución |
|---|---|
| "Unauthorized domain" | Agrega 127.0.0.1 a dominios autorizados |
| Popup bloqueado | Permite popups en navegador |
| API Key inválida | Verifica firebase-config.js |
| Botón no responde | F12 → Console → Mira errores |

---

## Archivos

- ✅ index.html - Pantalla auth-screen
- ✅ auth.js - loginWithGoogle()
- ✅ app.js - Event listeners
- ✅ style.css - Estilos

---

**¡Listo! Ahora tienes Google Auth funcionando 🎉**

// ==================== AUTENTICACIÓN Y USUARIO ====================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, signInWithPopup, signInWithRedirect, GoogleAuthProvider, signOut, onAuthStateChanged, getRedirectResult } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getDatabase, ref, set, get, update, child } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Estado de autenticación
let currentUser = null;
let userProfile = null;

// Registrar/Iniciar sesión con Google
async function loginWithGoogle() {
    try {
        let result;
        
        // Intentar primero con popup
        try {
            result = await signInWithPopup(auth, googleProvider);
        } catch (popupError) {
            console.warn('Popup bloqueado, usando redirección:', popupError.code);
            // Si el popup falla, usar redirección
            await signInWithRedirect(auth, googleProvider);
            return null; // La página se recargará
        }
        
        const user = result.user;
        await createOrUpdateUserProfile(user);
        return user;
        
    } catch (error) {
        console.error('❌ Error al iniciar sesión con Google:', error.message);
        throw error;
    }
}

// Crear o actualizar perfil de usuario
async function createOrUpdateUserProfile(user) {
    try {
        const userRef = ref(database, `usuarios/${user.uid}`);
        const snapshot = await get(userRef);
        
        if (!snapshot.exists()) {
            // Nuevo usuario - crear perfil
            const newProfile = {
                uid: user.uid,
                email: user.email,
                username: user.displayName || user.email.split('@')[0],
                sigmaCoins: 1000,
                nivel: 1,
                rol: 'admin', // ← NUEVO: primer usuario es admin
                partidas: 0,
                victorias: 0,
                derrota: 0,
                racha: 0,
                items: [],
                cosmeticos: [],
                avatar: 'avatar-1',
                estado: 'online',
                fotoUrl: user.photoURL || '',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                isNewUser: true, // ← FLAG para detectar nuevo usuario
                estadisticas: {
                    tiempoJugado: 0,
                    palabrasAdivinadas: 0,
                    intentosVotos: 0,
                    votosCerteros: 0,
                }
            };
            await set(userRef, newProfile);
            userProfile = newProfile;
            console.log('✅ Nuevo usuario registrado como ADMIN:', user.displayName);
            return newProfile;
        } else {
            // Usuario existente - actualizar last login
            const existingProfile = snapshot.val();
            await update(userRef, {
                lastLogin: new Date().toISOString(),
                estado: 'online',
                fotoUrl: user.photoURL || '',
                isNewUser: false // ← FLAG para usuario existente
            });
            userProfile = { ...existingProfile, isNewUser: false };
            console.log('✅ Sesión iniciada:', user.displayName);
            return userProfile;
        }
    } catch (error) {
        console.error('❌ Error al crear/actualizar perfil:', error);
        throw error;
    }
}

// Registrar nuevo usuario (legacy - no usado con Google)
async function registerUser(email, password, username) {
    console.warn('⚠️ registerUser() es legacy. Usa loginWithGoogle() en su lugar');
    throw new Error('Use loginWithGoogle() instead');
}

// Iniciar sesión (legacy - no usado con Google)
async function loginUser(email, password) {
    console.warn('⚠️ loginUser() es legacy. Usa loginWithGoogle() en su lugar');
    throw new Error('Use loginWithGoogle() instead');
}

// Cerrar sesión
async function logoutUser() {
    try {
        await signOut(auth);
        currentUser = null;
        userProfile = null;
        console.log('✅ Sesión cerrada');
    } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
    }
}

// Cargar perfil del usuario
async function loadUserProfile(uid) {
    try {
        const userRef = ref(database, `usuarios/${uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            userProfile = snapshot.val();
            return userProfile;
        }
    } catch (error) {
        console.error('❌ Error al cargar perfil:', error);
    }
    return null;
}

// Actualizar perfil del usuario
async function updateUserProfile(uid, updates) {
    try {
        const userRef = ref(database, `usuarios/${uid}`);
        await update(userRef, updates);
        if (userProfile) {
            Object.assign(userProfile, updates);
        }
        console.log('✅ Perfil actualizado');
    } catch (error) {
        console.error('❌ Error al actualizar perfil:', error);
    }
}

// Agregar Sigma Coins después de una partida
async function addSigmaCoins(uid, amount, reason = 'partida') {
    try {
        const userRef = ref(database, `usuarios/${uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            const currentCoins = snapshot.val().sigmaCoins || 0;
            const newCoins = currentCoins + amount;
            
            await update(userRef, { sigmaCoins: newCoins });
            
            // Registrar la transacción
            const transactionRef = ref(database, `usuarios/${uid}/transacciones/${Date.now()}`);
            await set(transactionRef, {
                amount: amount,
                reason: reason,
                timestamp: new Date().toISOString(),
                balance: newCoins
            });
            
            console.log(`✅ ${amount} Sigma Coins agregados (${reason})`);
            if (userProfile) userProfile.sigmaCoins = newCoins;
            return newCoins;
        }
    } catch (error) {
        console.error('❌ Error al agregar coins:', error);
    }
}

// Cambiar rol de usuario (solo admin)
async function changeUserRole(uid, newRole) {
    try {
        const userRef = ref(database, `usuarios/${uid}`);
        await update(userRef, { rol: newRole });
        console.log(`✅ Rol cambiado a ${newRole}`);
    } catch (error) {
        console.error('❌ Error al cambiar rol:', error);
    }
}

// Verificar permisos
function hasPermission(action) {
    if (!userProfile) return false;
    
    const permissions = {
        'admin': ['view_admin', 'manage_users', 'change_roles', 'view_stats', 'delete_rooms'],
        'moderador': ['view_stats', 'manage_rooms', 'ban_users'],
        'jugador': ['play', 'view_profile', 'use_shop']
    };
    
    return permissions[userProfile.rol]?.includes(action) || false;
}

// Monitorear estado de autenticación
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        userProfile = await loadUserProfile(user.uid);
        console.log('👤 Usuario autenticado:', userProfile?.username);
        document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: userProfile }));
    } else {
        currentUser = null;
        userProfile = null;
        console.log('👤 Usuario no autenticado');
        document.dispatchEvent(new CustomEvent('userLoggedOut'));
    }
});

// Manejar redirect result (si se usó signInWithRedirect)
getRedirectResult(auth).then(result => {
    if (result?.user) {
        createOrUpdateUserProfile(result.user);
    }
}).catch(error => {
    console.error('Error en redirect result:', error);
});

// Exportar funciones y variables
export {
    auth,
    database,
    loginWithGoogle,
    registerUser,
    loginUser,
    logoutUser,
    loadUserProfile,
    updateUserProfile,
    addSigmaCoins,
    changeUserRole,
    hasPermission
};

export const getCurrentUser = () => currentUser;
export const getUserProfile = async (uid) => {
    if (!uid && currentUser) {
        return userProfile;
    }
    // Si se proporciona un uid, intentar cargar ese perfil
    if (uid) {
        const profile = await loadUserProfile(uid);
        return profile;
    }
    return userProfile;
};

// ==================== SISTEMA DE TIENDA Y COSMÉTTICOS ====================
import { getDatabase, ref, set, update, get, child } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';

const tiendaItems = [
    {
        id: 'avatar-2',
        tipo: 'avatar',
        nombre: 'Avatar Neon',
        descripcion: 'Avatar con efecto neon futurista',
        precio: 500,
        icono: '🌌',
        rarity: 'comun'
    },
    {
        id: 'avatar-3',
        tipo: 'avatar',
        nombre: 'Avatar Clásico',
        descripcion: 'El avatar original mejorado',
        precio: 300,
        icono: '👑',
        rarity: 'comun'
    },
    {
        id: 'avatar-4',
        tipo: 'avatar',
        nombre: 'Avatar Legendario',
        descripcion: 'Avatar exclusivo y legendario',
        precio: 2000,
        icono: '💎',
        rarity: 'legendario'
    },
    {
        id: 'chat-bubble-1',
        tipo: 'chat_bubble',
        nombre: 'Burbuja de Chat Fuego',
        descripcion: 'Mensajes con efecto de fuego 🔥',
        precio: 250,
        icono: '🔥',
        rarity: 'raro'
    },
    {
        id: 'chat-bubble-2',
        tipo: 'chat_bubble',
        nombre: 'Burbuja de Chat Hielo',
        descripcion: 'Mensajes con efecto de hielo ❄️',
        precio: 250,
        icono: '❄️',
        rarity: 'raro'
    },
    {
        id: 'particle-1',
        tipo: 'particles',
        nombre: 'Partículas Doradas',
        descripcion: 'Efecto de partículas doradas al votación',
        precio: 400,
        icono: '✨',
        rarity: 'raro'
    },
    {
        id: 'emote-1',
        tipo: 'emote',
        nombre: 'Pack de Emotes Premium',
        descripcion: 'Acceso a 10 emotes exclusivos',
        precio: 600,
        icono: '😎',
        rarity: 'legendario'
    },
    {
        id: 'boost-2x',
        tipo: 'boost',
        nombre: 'Boost 2x Coins - 1 hora',
        descripcion: 'Gana el doble de Sigma Coins durante 1 hora',
        precio: 800,
        icono: '⚡',
        rarity: 'limitado'
    },
    {
        id: 'name-color',
        tipo: 'cosmetic',
        nombre: 'Color de Nombre Premium',
        descripcion: 'Cambia el color de tu nombre en chat',
        precio: 200,
        icono: '🎨',
        rarity: 'comun'
    },
    {
        id: 'badge-sigma',
        tipo: 'badge',
        nombre: 'Badge Sigma Master',
        descripcion: 'Badge exclusivo de maestro',
        precio: 1000,
        icono: 'Σ',
        rarity: 'legendario'
    }
];

// Obtener items de la tienda
function getTiendaItems() {
    return tiendaItems;
}

// Filtrar por rareza
function getTiendaItemsByRarity(rarity) {
    return tiendaItems.filter(item => item.rarity === rarity);
}

// Obtener item por ID
function getTiendaItem(id) {
    return tiendaItems.find(item => item.id === id);
}

// Comprar item
async function buyTiendaItem(uid, itemId, userProfile, database) {
    try {
        const item = getTiendaItem(itemId);
        if (!item) {
            throw new Error('Item no encontrado');
        }

        if (userProfile.sigmaCoins < item.precio) {
            throw new Error('Sigma Coins insuficientes');
        }

        // Verificar si ya lo tiene
        if (userProfile.cosmeticos?.includes(itemId)) {
            throw new Error('Ya posees este item');
        }

        // Actualizar coins
        const newCoins = userProfile.sigmaCoins - item.precio;
        const userRef = ref(database, `usuarios/${uid}`);
        
        // Agregar item a cosmeticos
        const cosmeticos = userProfile.cosmeticos || [];
        cosmeticos.push(itemId);

        await update(userRef, {
            sigmaCoins: newCoins,
            cosmeticos: cosmeticos
        });

        // Registrar compra
        const purchaseRef = ref(database, `usuarios/${uid}/compras/${Date.now()}`);
        await set(purchaseRef, {
            itemId: itemId,
            itemName: item.nombre,
            price: item.precio,
            timestamp: new Date().toISOString()
        });

        console.log(`✅ ${item.nombre} comprado`);
        return { success: true, newCoins, item };
    } catch (error) {
        console.error('❌ Error al comprar:', error.message);
        return { success: false, error: error.message };
    }
}

// Usar cosmético (equipar)
async function equiparCosmetico(uid, itemId, database) {
    try {
        const item = getTiendaItem(itemId);
        if (!item) throw new Error('Item no encontrado');

        const userRef = ref(database, `usuarios/${uid}`);
        
        // Actualizar según tipo
        if (item.tipo === 'avatar') {
            await update(userRef, { avatar: itemId });
        } else if (item.tipo === 'chat_bubble') {
            await update(userRef, { chatBubble: itemId });
        } else if (item.tipo === 'particles') {
            await update(userRef, { particles: itemId });
        } else if (item.tipo === 'badge') {
            const badges = await get(child(userRef, 'badges')) || [];
            badges.push(itemId);
            await update(userRef, { badges: badges });
        }

        console.log(`✅ ${item.nombre} equipado`);
        return { success: true, item };
    } catch (error) {
        console.error('❌ Error al equipar:', error.message);
        return { success: false, error: error.message };
    }
}

// Aplicar boost temporal
async function aplicarBoost(uid, boostId, database) {
    try {
        const item = getTiendaItem(boostId);
        if (!item?.tipo !== 'boost') {
            throw new Error('Este item no es un boost');
        }

        const userRef = ref(database, `usuarios/${uid}`);
        const boostEndTime = Date.now() + (60 * 60 * 1000); // 1 hora

        await update(userRef, {
            activeBoosters: {
                [boostId]: boostEndTime
            }
        });

        console.log(`✅ Boost ${item.nombre} activado`);
        return { success: true, endTime: boostEndTime };
    } catch (error) {
        console.error('❌ Error al aplicar boost:', error.message);
        return { success: false, error: error.message };
    }
}

export {
    tiendaItems,
    getTiendaItems,
    getTiendaItemsByRarity,
    getTiendaItem,
    buyTiendaItem,
    equiparCosmetico,
    aplicarBoost
};

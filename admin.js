// ==================== ADMIN PANEL ====================
import { database, getCurrentUser, getUserProfile, changeUserRole } from './auth.js';
import { ref, get, child, query, orderByChild } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';

let allUsers = [];
let allGames = [];
let selectedUserForRole = null;
let charts = {};

// Verificar permisos de admin
async function checkAdminAccess() {
    const user = getCurrentUser();
    const profile = await getUserProfile(); // AÑADIDO: Esperar a que el perfil se cargue
    

    // Si el perfil no se ha cargado, esperar un poco y reintentar
    if (!profile && user) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        profile = await getUserProfile(user.uid);
    }
    
    if (!user || !profile || profile.rol !== 'admin') { // MODIFICADO: Verificación más robusta
        alert('❌ Acceso denegado. Solo administradores.');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Cargar todos los usuarios
async function loadAllUsers() {
    try {
        const usersRef = ref(database, 'usuarios');
        const snapshot = await get(usersRef);
        
        if (snapshot.exists()) {
            allUsers = [];
            snapshot.forEach(childSnapshot => {
                allUsers.push({
                    uid: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            console.log(`✅ ${allUsers.length} usuarios cargados`);
            return allUsers;
        }
    } catch (error) {
        console.error('❌ Error cargando usuarios:', error);
    }
    return [];
}

// Cargar todas las partidas
async function loadAllGames() {
    try {
        const gamesRef = ref(database, 'partidas');
        const snapshot = await get(gamesRef);
        
        if (snapshot.exists()) {
            allGames = [];
            snapshot.forEach(childSnapshot => {
                allGames.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            console.log(`✅ ${allGames.length} partidas cargadas`);
            return allGames;
        }
    } catch (error) {
        console.error('❌ Error cargando partidas:', error);
    }
    return [];
}

// Actualizar estadísticas del dashboard
async function updateDashboardStats() {
    await loadAllUsers();
    await loadAllGames();

    // Total usuarios
    document.getElementById('totalUsers').textContent = allUsers.length;
    
    // Partidas
    document.getElementById('totalGames').textContent = allGames.length;
    
    // Sigma Coins circulantes
    const totalCoins = allUsers.reduce((sum, u) => sum + (u.sigmaCoins || 0), 0);
    document.getElementById('circulatingCoins').textContent = totalCoins.toLocaleString();
    
    // Usuarios online
    const onlineUsers = allUsers.filter(u => u.estado === 'online').length;
    document.getElementById('onlineUsers').textContent = onlineUsers;
    
    // Partidas activas
    const activeGames = allGames.filter(g => g.estado === 'en_progreso').length;
    document.getElementById('activeGames').textContent = activeGames;
    
    // Ingresos totales (suma de precios de items comprados)
    let totalRevenue = 0;
    for (const user of allUsers) {
        const compras = user.compras || {};
        for (const purchase of Object.values(compras)) {
            totalRevenue += purchase.price || 0;
        }
    }
    document.getElementById('totalRevenue').textContent = `Σ${totalRevenue.toLocaleString()}`;
    
    // Retención (usuarios que jugaron en los últimos 7 días)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const retainedUsers = allUsers.filter(u => u.lastGameDate && new Date(u.lastGameDate).getTime() > sevenDaysAgo).length;
    const retentionRate = allUsers.length > 0 ? Math.round((retainedUsers / allUsers.length) * 100) : 0;
    document.getElementById('retentionRate').textContent = `${retentionRate}%`;
}

// Crear gráficas
function initCharts() {
    // Usuarios por día (últimos 7 días)
    const usersChartCtx = document.getElementById('usersChart').getContext('2d');
    charts.users = new Chart(usersChartCtx, {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Nuevos Usuarios',
                data: [45, 52, 48, 61, 55, 67, 72],
                borderColor: '#00FFFF',
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#E0E0E0' } }
            },
            scales: {
                y: { ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(0, 255, 255, 0.1)' } },
                x: { ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(0, 255, 255, 0.1)' } }
            }
        }
    });

    // Partidas por hora
    const gamesChartCtx = document.getElementById('gamesChart').getContext('2d');
    charts.games = new Chart(gamesChartCtx, {
        type: 'bar',
        data: {
            labels: ['00h', '04h', '08h', '12h', '16h', '20h', '24h'],
            datasets: [{
                label: 'Partidas',
                data: [23, 45, 89, 156, 203, 145, 67],
                backgroundColor: 'rgba(0, 102, 255, 0.6)',
                borderColor: '#0066FF',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#E0E0E0' } }
            },
            scales: {
                y: { ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(0, 255, 255, 0.1)' } },
                x: { ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(0, 255, 255, 0.1)' } }
            }
        }
    });

    // Ingresos
    const revenueChartCtx = document.getElementById('revenueChart').getContext('2d');
    charts.revenue = new Chart(revenueChartCtx, {
        type: 'line',
        data: {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            datasets: [{
                label: 'Sigma Coins Vendidos',
                data: [4500, 5200, 6100, 7300],
                borderColor: '#00FF00',
                backgroundColor: 'rgba(0, 255, 0, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#E0E0E0' } }
            },
            scales: {
                y: { ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(0, 255, 255, 0.1)' } },
                x: { ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(0, 255, 255, 0.1)' } }
            }
        }
    });

    // Distribución de roles
    const rolesChartCtx = document.getElementById('rolesChart').getContext('2d');
    const adminCount = allUsers.filter(u => u.rol === 'admin').length;
    const modCount = allUsers.filter(u => u.rol === 'moderador').length;
    const playerCount = allUsers.filter(u => u.rol === 'jugador').length;

    charts.roles = new Chart(rolesChartCtx, {
        type: 'doughnut',
        data: {
            labels: ['Jugadores', 'Moderadores', 'Administradores'],
            datasets: [{
                data: [playerCount, modCount, adminCount],
                backgroundColor: [
                    'rgba(0, 200, 100, 0.6)',
                    'rgba(255, 165, 0, 0.6)',
                    'rgba(255, 0, 0, 0.6)'
                ],
                borderColor: ['#66FF99', '#FFB84D', '#FF6666'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#E0E0E0' } }
            }
        }
    });

    // Ganadores vs Impostores
    const winnersChartCtx = document.getElementById('winnersChart').getContext('2d');
    const ganadores = allGames.filter(g => g.ganador === 'ciudadanos').length;
    const impostores = allGames.filter(g => g.ganador === 'impostor').length;

    charts.winners = new Chart(winnersChartCtx, {
        type: 'pie',
        data: {
            labels: ['Ciudadanos', 'Impostores'],
            datasets: [{
                data: [ganadores, impostores],
                backgroundColor: ['rgba(0, 255, 100, 0.6)', 'rgba(255, 50, 50, 0.6)'],
                borderColor: ['#66FF99', '#FF6666'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#E0E0E0' } }
            }
        }
    });

    // Duración promedio
    const durationChartCtx = document.getElementById('durationChart').getContext('2d');
    charts.duration = new Chart(durationChartCtx, {
        type: 'bar',
        data: {
            labels: ['< 5 min', '5-10 min', '10-15 min', '15-20 min', '> 20 min'],
            datasets: [{
                label: 'Cantidad de Partidas',
                data: [34, 78, 125, 89, 45],
                backgroundColor: 'rgba(100, 150, 255, 0.6)',
                borderColor: '#0066FF',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#E0E0E0' } }
            },
            scales: {
                y: { ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(0, 255, 255, 0.1)' } },
                x: { ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(0, 255, 255, 0.1)' } }
            }
        }
    });

    // Ventas por item
    const itemSalesCtx = document.getElementById('itemSalesChart').getContext('2d');
    charts.itemSales = new Chart(itemSalesCtx, {
        type: 'horizontalBar',
        data: {
            labels: ['Avatar Legendario', 'Badge Sigma', 'Boost 2x', 'Pack Emotes', 'Partículas Doradas'],
            datasets: [{
                label: 'Cantidad Vendida',
                data: [156, 203, 289, 167, 134],
                backgroundColor: 'rgba(0, 255, 200, 0.6)',
                borderColor: '#00FFCC',
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: { labels: { color: '#E0E0E0' } }
            },
            scales: {
                x: { ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(0, 255, 255, 0.1)' } },
                y: { ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(0, 255, 255, 0.1)' } }
            }
        }
    });

    // Ingresos diarios
    const dailyRevenueCtx = document.getElementById('dailyRevenueChart').getContext('2d');
    charts.dailyRevenue = new Chart(dailyRevenueCtx, {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Ingresos Diarios (Σ Coins)',
                data: [1200, 1900, 1600, 2400, 1800, 2200, 2800],
                borderColor: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#E0E0E0' } }
            },
            scales: {
                y: { ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(0, 255, 255, 0.1)' } },
                x: { ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(0, 255, 255, 0.1)' } }
            }
        }
    });
}

// Cargar tabla de usuarios
function populateUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    allUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.nivel || 1}</td>
            <td><span class="role-badge role-${user.rol}">${user.rol}</span></td>
            <td>Σ${user.sigmaCoins || 0}</td>
            <td>${user.partidas || 0}</td>
            <td>${user.victorias || 0}</td>
            <td>${user.estado || 'offline'}</td>
            <td class="action-buttons">
                <button class="action-btn" onclick="editUser('${user.uid}')">✏️ Editar</button>
                <button class="action-btn" onclick="deleteUser('${user.uid}')">🗑️ Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Cargar tabla de partidas
function populateGamesTable() {
    const tbody = document.getElementById('gamesTableBody');
    tbody.innerHTML = '';
    
    allGames.slice(0, 50).forEach(game => {
        const row = document.createElement('tr');
        const duration = game.duracion || '10:30';
        const date = new Date(game.fechaInicio).toLocaleDateString();
        
        row.innerHTML = `
            <td>${game.id.substring(0, 8)}</td>
            <td>${game.jugadores?.length || 0}</td>
            <td>${game.ganador === 'ciudadanos' ? '👥 Ciudadanos' : '👹 Impostor'}</td>
            <td>${duration}</td>
            <td>${date}</td>
            <td>${game.estado}</td>
        `;
        tbody.appendChild(row);
    });
}

// Tabs navegación
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        
        // Remover active de todos
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Agregar active al seleccionado
        this.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// Modal de cambio de rol
document.getElementById('openRoleModal').addEventListener('click', () => {
    document.getElementById('roleModal').classList.add('active');
});

document.getElementById('cancelRoleChange').addEventListener('click', () => {
    document.getElementById('roleModal').classList.remove('active');
});

// Búsqueda de usuarios para cambio de rol
document.getElementById('roleUserSearch').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const suggestions = document.getElementById('userSuggestions');
    suggestions.innerHTML = '';
    
    if (searchTerm.length === 0) return;
    
    const filtered = allUsers.filter(u => 
        u.username.toLowerCase().includes(searchTerm) || 
        u.email.toLowerCase().includes(searchTerm)
    );
    
    filtered.slice(0, 5).forEach(user => {
        const div = document.createElement('div');
        div.style.cssText = 'padding: 10px; background: rgba(0, 102, 255, 0.1); margin-bottom: 5px; border-radius: 4px; cursor: pointer; border: 1px solid #0066FF;';
        div.innerHTML = `<strong>${user.username}</strong> (${user.email})`;
        div.addEventListener('click', () => {
            selectedUserForRole = user;
            document.getElementById('roleUserSearch').value = user.username;
            suggestions.innerHTML = '';
        });
        suggestions.appendChild(div);
    });
});

document.getElementById('confirmRoleChange').addEventListener('click', async () => {
    if (!selectedUserForRole) {
        alert('Selecciona un usuario');
        return;
    }
    
    const newRole = document.getElementById('newRole').value;
    await changeUserRole(selectedUserForRole.uid, newRole);
    
    alert(`✅ ${selectedUserForRole.username} ahora es ${newRole}`);
    document.getElementById('roleModal').classList.remove('active');
    selectedUserForRole = null;
    await updateDashboardStats();
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Inicializar
async function init() {
    if (!await checkAdminAccess()) return;
    
    await updateDashboardStats();
    initCharts();
    populateUsersTable();
    populateGamesTable();
    
    // Actualizar cada 30 segundos
    setInterval(async () => {
        await updateDashboardStats();
    }, 30000);
}

document.addEventListener('DOMContentLoaded', init);

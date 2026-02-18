// La aplicación está implementada como una Expresión de Función
// Ejecutada Inmediatamente (IIFE) que devuelve un objeto con métodos
// públicos. Esto ayuda a encapsular variables privadas y evitar
// contaminar el espacio de nombres global.
const App = (() => {
    // rastrea el usuario logueado y su rol
    let currentUser = null;
    let currentRole = null;
    // sección del panel que se muestra actualmente
    let activeSection = 'homeSection';
    // colección de instancias de Chart.js para poder eliminarlas al cambiar sección
    let charts = {};

    // base URL para peticiones al backend (servidor Express)
    const API_BASE = '';

    // helpers genéricos para llamar al API REST
    async function apiRequest(path, method = 'GET', body = null) {
        const opts = { method, headers: { 'Content-Type': 'application/json' } };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(`${API_BASE}/api/${path}`, opts);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`API ${method} /${path} falló: ${res.status} ${text}`);
        }
        return res.json();
    }

    // wrapper para actualizar un solo cuarto en el backend
    async function updateRoom(number, changes) {
        return apiRequest(`rooms/${number}`, 'PUT', changes);
    }

    // wrapper para actualizar o crear reservas
    async function updateReservation(id, changes) {
        if (id) {
            return apiRequest(`reservations/${id}`, 'PUT', changes);
        } else {
            return apiRequest('reservations', 'POST', changes);
        }
    }

    // el estado de la aplicación contiene usuarios, habitaciones, reservas y consumos
    const state = {
        users: {
            'admin': { password: 'admin123', role: 'administrador', name: 'Admin General' },
            'recepcion': { password: 'recep123', role: 'recepcionista', name: 'María García' },
            'limpieza': { password: 'limpieza123', role: 'limpieza', name: 'Juan Pérez' }
        },
        rooms: {},
        reservations: [],
        consumptions: []
    };

    // los permisos definen qué elementos del menú lateral puede ver cada rol
    // cada entrada incluye id, etiqueta, sección a mostrar e ícono SVG
    const rolePermissions = {
        administrador: [
            { id: 'home', label: 'Dashboard', section: 'homeSection', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />' },
            { id: 'reservations', label: 'Reservas', section: 'reservationsSection', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />' },
            { id: 'rooms', label: 'Habitaciones', section: 'roomsSection', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />' },
            { id: 'reports', label: 'Informes', section: 'reportsSection', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />' },
            { id: 'users', label: 'Usuarios', section: 'usersSection', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1.5a2.5 2.5 0 00-5 0V21" />' }
        ],
        recepcionista: [
            { id: 'home', label: 'Dashboard', section: 'homeSection', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />' },
            { id: 'reservations', label: 'Reservas', section: 'reservationsSection', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />' },
            { id: 'rooms', label: 'Habitaciones', section: 'roomsSection', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />' },
        ],
        limpieza: [
            { id: 'home', label: 'Dashboard', section: 'homeSection', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />' },
            { id: 'cleaning', label: 'Limpieza', section: 'cleaningSection', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />' }
        ]
    };
    
    // almacena en caché elementos del DOM usados con frecuencia para evitar consultas repetidas
    const DOM = {
        loginForm: document.getElementById('loginForm'),
        loginError: document.getElementById('loginError'),
        loginScreen: document.getElementById('loginScreen'),
        dashboard: document.getElementById('dashboard'),
        sidebar: document.getElementById('sidebar'),
        sidebarOverlay: document.getElementById('sidebarOverlay'),
        hamburgerButton: document.getElementById('hamburgerButton'),
        mobileHeaderTitle: document.getElementById('mobileHeaderTitle'),
        navButtons: document.getElementById('navButtons'),
        currentUser: document.getElementById('currentUser'),
        currentRole: document.getElementById('currentRole'),
        userAvatar: document.getElementById('userAvatar'),
        sections: document.querySelectorAll('.section'),
        statsGrid: document.getElementById('statsGrid'),
        reservationsTable: document.getElementById('reservationsTable'),
        roomsGrid: document.getElementById('roomsGrid'),
        cleaningRooms: document.getElementById('cleaningRooms'),
        usersTable: document.getElementById('usersTable'),
        reservationForm: document.getElementById('reservationForm'),
        userForm: document.getElementById('userForm'),
        roomSelect: document.getElementById('roomSelect'),
        confirmModal: document.getElementById('confirmModal'),
        confirmTitle: document.getElementById('confirmTitle'),
        confirmMessage: document.getElementById('confirmMessage'),
        confirmButton: document.getElementById('confirmButton'),
        cancelButton: document.getElementById('cancelButton'),
    };

    // guarda el usuario actual en localStorage para mantener sesión
    function saveSession() {
        if (currentUser) {
            localStorage.setItem('staypro_user', currentUser);
        }
    }

    // elimina datos de sesión
    function clearSession() {
        localStorage.removeItem('staypro_user');
    }

    // intenta restaurar la sesión si hay un usuario persistido
    function loadSession() {
        const stored = localStorage.getItem('staypro_user');
        if (stored && state.users[stored]) {
            currentUser = stored;
            currentRole = state.users[stored].role;
            DOM.loginScreen.classList.add('hidden');
            DOM.dashboard.classList.remove('hidden');
            renderDashboard();
        }
    }

    // punto de entrada llamado cuando el DOM se carga completamente
    async function init() {
        setupEventListeners(); // conecto eventos de la IU
        await initializeData();      // llenar datos iniciales del estado
        loadSession();           // restaurar sesión si existe
    }

    // adjunta manejadores de eventos a formularios y botones
    function setupEventListeners() {
        DOM.loginForm.addEventListener('submit', handleLogin);
        DOM.reservationForm.addEventListener('submit', handleNewReservation);
        DOM.userForm.addEventListener('submit', handleNewUser);
        DOM.hamburgerButton.addEventListener('click', toggleSidebar);
        DOM.sidebarOverlay.addEventListener('click', toggleSidebar);
    }

    // muestra/oculta el menú lateral móvil y la superposición
    function toggleSidebar() {
        DOM.sidebar.classList.toggle('-translate-x-full');
        DOM.sidebarOverlay.classList.toggle('hidden');
    }

    // prepara datos iniciales de habitaciones, reservas y consumos
    async function initializeData() {
        try {
            // load users and rooms from API as before
            const users = await apiRequest('users');
            state.users = {};
            users.forEach(u => state.users[u.username] = u);

            const rooms = await apiRequest('rooms');
            state.rooms = {};
            rooms.forEach(r => state.rooms[r.number] = r);

            // ---- new: fetch reservations from backend so they survive reloads ----
            const reservations = await apiRequest('reservations');
            state.reservations = reservations;

            // any reservation that is already in progress should keep the room marked occupied
            state.reservations.forEach(r => {
                if (r.status === 'en_curso') {
                    if (state.rooms[r.room]) {
                        state.rooms[r.room].status = 'ocupada';
                        state.rooms[r.room].guest = r.clientName;
                    }
                }
            });

            // consumptions remain in memory for now
            state.consumptions = [];
        } catch (err) {
            console.error('No se pudo cargar datos iniciales desde API, usando valores por defecto', err);

            // crea 20 habitaciones numeradas 101-120 con tipos y estado predeterminado
            for(let i = 101; i <= 120; i++) {
                state.rooms[i] = { number: i, type: i <= 110 ? 'Individual' : 'Doble', status: 'disponible', price: i <= 110 ? 80 : 120, guest: null, cleaningStatus: 'limpia' };
            }
            
            // reserva de demostración y estados de habitaciones de ejemplo
            state.reservations = [];

            // no hay ocupaciones por defecto en este modo de demostración
            
            state.consumptions = [
                { room: 101, clientName: 'Ana López', concept: 'minibar', description: 'Bebidas y snacks', quantity: 2, price: 15.50, date: new Date().toLocaleDateString() },
                { room: 110, clientName: 'Carlos Ruiz', concept: 'lavanderia', description: 'Servicio de lavandería', quantity: 1, price: 25.00, date: new Date().toLocaleDateString() }
            ];
        }
    }

    // valida credenciales de inicio de sesión con state.users en memoria
    function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const user = state.users[username];
        if (user && user.password === password) {
            currentUser = username;
            currentRole = user.role;
            saveSession();
            DOM.loginScreen.classList.add('hidden');
            DOM.dashboard.classList.remove('hidden');
            renderDashboard();
        } else {
            DOM.loginError.textContent = 'Usuario o contraseña incorrectos.';
            DOM.loginError.classList.remove('hidden');
        }
    }

    // el cierre de sesión reinicia el estado, limpia campos y vuelve a la pantalla de login
    function logout() {
        currentUser = null;
        currentRole = null;
        clearSession();
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        DOM.loginError.classList.add('hidden');
        DOM.dashboard.classList.add('hidden');
        DOM.loginScreen.classList.remove('hidden');
        if (!DOM.sidebar.classList.contains('-translate-x-full')) {
            toggleSidebar();
        }
    }

    // actualiza la UI del panel con la información del usuario y enlaces de navegación
    function renderDashboard() {
        const user = state.users[currentUser];
        DOM.currentUser.textContent = user.name;
        DOM.currentRole.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        DOM.userAvatar.textContent = user.name.charAt(0);
        renderNavigation();
        showSection('homeSection');
    }

    // build sidebar links based on rolePermissions and attach click handlers
    function renderNavigation() {
        const permissions = rolePermissions[currentRole] || [];
        DOM.navButtons.innerHTML = permissions.map(perm => `
            <a href="#" data-section="${perm.section}" data-label="${perm.label}" class="nav-link flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors ${perm.section === activeSection ? 'active-link' : ''}">
                <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">${perm.icon}</svg>
                <span>${perm.label}</span>
            </a>
        `).join('');
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showSection(e.currentTarget.dataset.section);
                if (window.innerWidth < 768) {
                    toggleSidebar();
                }
            });
        });
    }

    // hide all sections and display the selected one; also update header title
    function showSection(sectionId) {
        activeSection = sectionId;
        DOM.sections.forEach(section => section.classList.add('hidden'));
        document.getElementById(sectionId).classList.remove('hidden');
        
        const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
        DOM.mobileHeaderTitle.textContent = activeLink ? activeLink.dataset.label : 'Dashboard';

        renderNavigation();
        loadSectionData(sectionId);
    }

    // clear any existing charts for previous section and call renderer for the new section
    function loadSectionData(sectionId) {
        const canvasId = Object.keys(charts).find(key => key.startsWith(sectionId));
        if (canvasId && charts[canvasId]) {
            charts[canvasId].destroy();
            delete charts[canvasId];
        }
        
        switch(sectionId) {
            case 'homeSection': renderHome(); break;
            case 'reservationsSection': renderReservations(); break;
            case 'roomsSection': renderRooms(); break;
            case 'cleaningSection': renderCleaning(); break;
            case 'reportsSection': renderReports(); break;
            case 'usersSection': renderUsers(); break;
        }
    }

    // construye la vista inicial del panel con estadísticas y gráfico de dona
    function renderHome() {
        const occupied = Object.values(state.rooms).filter(r => r.status === 'ocupada').length;
        const available = Object.values(state.rooms).filter(r => r.status === 'disponible').length;
        const cleaning = Object.values(state.rooms).filter(r => r.status === 'limpieza').length;
        
        const stats = [
            { label: 'Ocupadas', value: occupied, icon: '🛌' },
            { label: 'Disponibles', value: available, icon: '✅' },
            { label: 'En Limpieza', value: cleaning, icon: '🧹' },
            { label: 'Reservas Activas', value: state.reservations.filter(r => r.status === 'confirmada').length, icon: '📅' }
        ];
        DOM.statsGrid.innerHTML = stats.map(s => `
            <div class="p-6 bg-white rounded-2xl shadow-lg flex items-center gap-4">
                <div class="text-3xl">${s.icon}</div>
                <div>
                    <div class="text-3xl font-bold">${s.value}</div>
                    <div class="text-slate-500">${s.label}</div>
                </div>
            </div>
        `).join('');

        const chartData = {
            labels: ['Ocupadas', 'Disponibles', 'En Limpieza', 'Mantenimiento'],
            datasets: [{
                data: [occupied, available, cleaning, Object.values(state.rooms).filter(r => r.status === 'mantenimiento').length],
                backgroundColor: ['#f43f5e', '#22c55e', '#f59e0b', '#64748b'],
                borderColor: '#ffffff',
                borderWidth: 4,
            }]
        };
        renderChart('roomStatusChart', 'doughnut', chartData, { responsive: true, maintainAspectRatio: false });
    }

    // rellena filas de la tabla de reservas y el desplegable de habitaciones
    function renderReservations() {
        DOM.reservationsTable.innerHTML = state.reservations.map(res => {
            const statusClasses = {
                confirmada: 'bg-blue-100 text-blue-800',
                en_curso: 'bg-green-100 text-green-800',
                cancelada: 'bg-red-100 text-red-800'
            };
            return `
                <tr class="border-b border-slate-200 hover:bg-slate-50">
                    <td class="p-4 whitespace-nowrap">${res.clientName}<br><small class="text-slate-500">${res.clientEmail}</small></td>
                    <td class="p-4 whitespace-nowrap">Hab. ${res.room}</td>
                    <td class="p-4 whitespace-nowrap">${res.checkin} → ${res.checkout}</td>
                    <td class="p-4 whitespace-nowrap"><span class="px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[res.status]}">${res.status}</span></td>
                    <td class="p-4 whitespace-nowrap">
                        ${res.status === 'confirmada' ? `<button onclick="App.checkIn(${res.id})" class="text-sm text-green-600 hover:underline">Check-in</button>` : ''}
                        ${res.status !== 'cancelada' ? `<button onclick="App.cancelReservation(${res.id})" class="ml-2 text-sm text-red-600 hover:underline">Cancelar</button>` : ''}
                    </td>
                </tr>
            `;
        }).join('');
        
        DOM.roomSelect.innerHTML = '<option value="">Seleccionar habitación...</option>' + 
            Object.values(state.rooms).filter(r => r.status === 'disponible').map(r => 
                `<option value="${r.number}">Hab. ${r.number} - ${r.type} ($${r.price})</option>`
            ).join('');
    }
    
    // muestra una cuadrícula de habitaciones coloreadas según su estado
    function renderRooms() {
        const statusMap = {
            disponible: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', label: 'Disponible' },
            ocupada: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300', label: 'Ocupada' },
            limpieza: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', label: 'Limpieza' },
            mantenimiento: { bg: 'bg-slate-200', text: 'text-slate-800', border: 'border-slate-300', label: 'Mantenimiento' }
        };
        DOM.roomsGrid.innerHTML = Object.values(state.rooms).map(room => {
            const base = `
                <div class="p-4 rounded-lg border-2 text-center ${statusMap[room.status].bg} ${statusMap[room.status].text} ${statusMap[room.status].border}">
                    <div class="font-bold text-lg">${room.number}</div>
                    <div class="text-xs">${statusMap[room.status].label}</div>`;
            // only admins and recepcionistas may change status manually
            let actions = '';
            if (currentRole === 'administrador' || currentRole === 'recepcionista') {
                // solo habitaciones ocupadas pueden ir a limpieza
                if (room.status === 'ocupada') {
                    actions += `<button onclick="App.markForCleaning(${room.number})" class="mt-2 w-full text-sm py-1 px-2 bg-amber-500 text-white rounded">Marcar limpieza</button>`;
                }
                // solo habitaciones disponibles pueden ir a mantenimiento
                if (room.status === 'disponible') {
                    actions += `<button onclick="App.markForMaintenance(${room.number})" class="mt-2 w-full text-sm py-1 px-2 bg-slate-600 text-white rounded">Marcar mantenimiento</button>`;
                }
                if (room.status === 'limpieza') {
                    actions += `<button onclick="App.markForMaintenance(${room.number})" class="mt-2 w-full text-sm py-1 px-2 bg-slate-600 text-white rounded">Enviar a mantenimiento</button>`;
                } else if (room.status === 'mantenimiento') {
                    actions += `<button onclick="App.setAvailable(${room.number})" class="mt-2 w-full text-sm py-1 px-2 bg-green-500 text-white rounded">Marcar disponible</button>`;
                }
            }
            return base + actions + `</div>`;
        }).join('');
    }
    
    // lista habitaciones que necesitan o están en limpieza con botones de acción
    function renderCleaning() {
        const dirtyRooms = Object.values(state.rooms).filter(r => r.cleaningStatus === 'sucia' || r.status === 'limpieza');
        if (dirtyRooms.length === 0) {
            DOM.cleaningRooms.innerHTML = '<p>No hay habitaciones pendientes de limpieza.</p>';
            return;
        }
        DOM.cleaningRooms.innerHTML = dirtyRooms.map(room => `
             <div class="p-4 rounded-lg shadow bg-white">
                <div class="font-bold text-lg">Habitación ${room.number}</div>
                <div class="text-sm text-slate-500 mb-4">${room.cleaningStatus === 'sucia' ? 'Pendiente de limpieza' : 'Limpieza en proceso'}</div>
                <div class="flex gap-2">
                    ${room.cleaningStatus === 'sucia' ? `<button onclick="App.startCleaning(${room.number})" class="w-full text-sm py-1 px-2 bg-amber-500 text-white rounded">Iniciar</button>` : ''}
                    <button onclick="App.finishCleaning(${room.number})" class="w-full text-sm py-1 px-2 bg-green-500 text-white rounded">Finalizar</button>
                </div>
             </div>
        `).join('');
    }

    // renderiza gráficos para informes: ingresos y ocupación por tipo
    function renderReports() {
        const revenueData = {
            labels: ['Día -6', 'Día -5', 'Día -4', 'Ayer', 'Hoy'],
            datasets: [{
                label: 'Ingresos',
                data: [520, 980, 760, 1250, 880],
                borderColor: '#475569',
                backgroundColor: 'rgba(71, 85, 105, 0.1)',
                fill: true,
                tension: 0.4
            }]
        };
        renderChart('revenueChart', 'line', revenueData, { responsive: true, maintainAspectRatio: false });

        const individualOccupied = Object.values(state.rooms).filter(r => r.type === 'Individual' && r.status === 'ocupada').length;
        const individualTotal = Object.values(state.rooms).filter(r => r.type === 'Individual').length;
        const doubleOccupied = Object.values(state.rooms).filter(r => r.type === 'Doble' && r.status === 'ocupada').length;
        const doubleTotal = Object.values(state.rooms).filter(r => r.type === 'Doble').length;

        const occupancyData = {
            labels: ['Individual', 'Doble'],
            datasets: [{
                label: 'Tasa de Ocupación (%)',
                data: [
                    (individualOccupied / individualTotal * 100).toFixed(1),
                    (doubleOccupied / doubleTotal * 100).toFixed(1)
                ],
                backgroundColor: ['#38bdf8', '#f472b6'],
                borderRadius: 4
            }]
        };
        renderChart('occupancyTypeChart', 'bar', occupancyData, { responsive: true, maintainAspectRatio: false, indexAxis: 'y' });
    }
    
    // rellena tabla de usuarios, excluyendo al admin de borrado
    function renderUsers() {
        DOM.usersTable.innerHTML = Object.entries(state.users).map(([username, user]) => `
            <tr class="border-b border-slate-200 hover:bg-slate-50">
                <td class="p-4 whitespace-nowrap">${username}</td>
                <td class="p-4 whitespace-nowrap">${user.name}</td>
                <td class="p-4 whitespace-nowrap">${user.role}</td>
                <td class="p-4 whitespace-nowrap">
                    ${username !== 'admin' ? `<button onclick="App.deleteUser('${username}')" class="text-sm text-red-600 hover:underline">Eliminar</button>` : ''}
                </td>
            </tr>
        `).join('');
    }

    // auxiliar para crear/eliminar gráficos de Chart.js y llevar el control
    function renderChart(canvasId, type, data, options) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        const chartId = `${activeSection}-${canvasId}`;
        if (charts[chartId]) charts[chartId].destroy();
        charts[chartId] = new Chart(ctx, { type, data, options });
    }

    // process reservation form submission and add a new reservation
    async function handleNewReservation(e) {
        e.preventDefault();
        const payload = {
            clientName: document.getElementById('clientName').value,
            clientEmail: document.getElementById('clientEmail').value,
            room: parseInt(document.getElementById('roomSelect').value),
            checkin: document.getElementById('checkinDate').value,
            checkout: document.getElementById('checkoutDate').value,
            status: 'confirmada'
        };
        try {
            const res = await updateReservation(null, payload);
            state.reservations.push(res);
            closeModal('reservationModal');
            e.target.reset();
            renderReservations();
        } catch (err) {
            alert('Error al crear reserva: ' + err.message);
        }
    }
    
    // add a new user from the user form, persist to backend
    async function handleNewUser(e) {
        e.preventDefault();
        const username = document.getElementById('newUsername').value;
        if(state.users[username]) {
            alert('El nombre de usuario ya existe.');
            return;
        }
        const payload = {
            username,
            password: document.getElementById('newPassword').value,
            name: document.getElementById('newFullName').value,
            role: document.getElementById('newUserRole').value
        };
        try {
            const user = await apiRequest('users', 'POST', payload);
            state.users[user.username] = user;
            closeModal('userModal');
            e.target.reset();
            renderUsers();
        } catch (err) {
            alert('Error al crear usuario: ' + err.message);
        }
    }

    // generic helpers to show/hide modal dialogs
    function openModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
        document.getElementById(modalId).classList.add('flex');
    }

    function closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
        document.getElementById(modalId).classList.remove('flex');
    }

    // reusable confirmation modal logic for dangerous actions
    function confirmAction({ title, message, confirmText = 'Confirmar', onConfirm }) {
        DOM.confirmTitle.textContent = title;
        DOM.confirmMessage.textContent = message;
        DOM.confirmButton.textContent = confirmText;
        openModal('confirmModal');

        const handleConfirm = () => {
            onConfirm();
            cleanup();
        };
        
        const cleanup = () => {
            closeModal('confirmModal');
            DOM.confirmButton.removeEventListener('click', handleConfirm);
            DOM.cancelButton.removeEventListener('click', cleanup);
        };

        DOM.confirmButton.addEventListener('click', handleConfirm);
        DOM.cancelButton.addEventListener('click', cleanup);
    }

    // change reservation status to in-progress and mark room occupied
    function checkIn(id) {
        confirmAction({
            title: 'Confirmar Check-in',
            message: '¿Está seguro de que desea realizar el check-in para esta reserva? La habitación se marcará como ocupada.',
            confirmText: 'Sí, Check-in',
            onConfirm: async () => {
                const res = state.reservations.find(r => r.id === id);
                if (res) {
                    res.status = 'en_curso';
                    state.rooms[res.room].status = 'ocupada';
                    state.rooms[res.room].guest = res.clientName;
                    try {
                        await updateRoom(res.room, { status: 'ocupada', guest: res.clientName });
                        await updateReservation(res.id, { status: 'en_curso' });
                    } catch (err) {
                        console.error('Error actualizando habitación o reserva en check-in', err);
                    }
                    renderReservations();
                }
            }
        });
    }

    // cancel a reservation and free room unless occupied
    function cancelReservation(id) {
        confirmAction({
            title: 'Cancelar Reserva',
            message: 'Esta acción no se puede deshacer. ¿Está seguro?',
            confirmText: 'Sí, Cancelar',
            onConfirm: async () => {
                const res = state.reservations.find(r => r.id === id);
                if (res) {
                    res.status = 'cancelada';
                    try {
                        await updateReservation(res.id, { status: 'cancelada' });
                    } catch (err) {
                        console.error('Error actualizando reserva', err);
                    }
                    if (state.rooms[res.room].status !== 'ocupada') {
                         state.rooms[res.room].status = 'disponible';
                         try {
                             await updateRoom(res.room, { status: 'disponible', guest: null });
                         } catch (err) {
                             console.error('Error actualizando habitación', err);
                         }
                    }
                    renderReservations();
                }
            }
        });
    }
    
    // remove user from state after confirmation (admin can't be deleted via UI)
    function deleteUser(username) {
        confirmAction({
            title: 'Eliminar Usuario',
            message: `¿Está seguro de que desea eliminar al usuario ${username}?`,
            confirmText: 'Sí, Eliminar',
            onConfirm: async () => {
                try {
                    await apiRequest(`users/${encodeURIComponent(username)}`, 'DELETE');
                    delete state.users[username];
                    renderUsers();
                } catch (err) {
                    alert('No se pudo eliminar el usuario: ' + err.message);
                }
            }
        });
    }
    
    // mark a room as currently being cleaned
    async function startCleaning(roomNumber) {
        state.rooms[roomNumber].cleaningStatus = 'en_proceso';
        try {
            await updateRoom(roomNumber, { cleaningStatus: 'en_proceso' });
        } catch (err) {
            console.error('Error actualizando habitación al iniciar limpieza', err);
        }
        renderCleaning();
    }

    // helpers for administrative status changes
    async function markForCleaning(number) {
        // solo ocupadas
        if (state.rooms[number].status !== 'ocupada') return;
        state.rooms[number].status = 'limpieza';
        state.rooms[number].cleaningStatus = 'sucia';
        try {
            await updateRoom(number, { status: 'limpieza', cleaningStatus: 'sucia' });
        } catch (err) {
            console.error('Error al marcar habitación para limpieza', err);
        }
        renderRooms();
    }

    async function markForMaintenance(number) {
        // solo disponibles necesiten mantenimiento (o en limpieza enviar a mantenimiento también permitido)
        if (state.rooms[number].status !== 'disponible' && state.rooms[number].status !== 'limpieza') return;
        state.rooms[number].status = 'mantenimiento';
        state.rooms[number].cleaningStatus = 'limpia';
        state.rooms[number].guest = null;
        try {
            await updateRoom(number, { status: 'mantenimiento', cleaningStatus: 'limpia', guest: null });
        } catch (err) {
            console.error('Error al marcar habitación para mantenimiento', err);
        }
        renderRooms();
    }

    async function setAvailable(number) {
        state.rooms[number].status = 'disponible';
        state.rooms[number].cleaningStatus = 'limpia';
        state.rooms[number].guest = null;
        try {
            await updateRoom(number, { status: 'disponible', cleaningStatus: 'limpia', guest: null });
        } catch (err) {
            console.error('Error al marcar habitación disponible', err);
        }
        renderRooms();
    }    
    // finish cleaning and make the room available again
    async function finishCleaning(roomNumber) {
        state.rooms[roomNumber].cleaningStatus = 'limpia';
        state.rooms[roomNumber].status = 'disponible';
        try {
            await updateRoom(roomNumber, { cleaningStatus: 'limpia', status: 'disponible', guest: null });
        } catch (err) {
            console.error('Error actualizando habitación al terminar limpieza', err);
        }
        renderCleaning();
    }

    return { init, logout, showSection, openModal, closeModal, checkIn, cancelReservation, deleteUser, startCleaning, finishCleaning, markForCleaning, markForMaintenance, setAvailable };
})();

window.addEventListener('DOMContentLoaded', App.init);


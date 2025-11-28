const App = (() => {
    let currentUser = null;
    let currentRole = null;
    let activeSection = 'homeSection';
    let charts = {};

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

    function init() {
        setupEventListeners();
        initializeData();
    }

    function setupEventListeners() {
        DOM.loginForm.addEventListener('submit', handleLogin);
        DOM.reservationForm.addEventListener('submit', handleNewReservation);
        DOM.userForm.addEventListener('submit', handleNewUser);
        DOM.hamburgerButton.addEventListener('click', toggleSidebar);
        DOM.sidebarOverlay.addEventListener('click', toggleSidebar);
    }

    function toggleSidebar() {
        DOM.sidebar.classList.toggle('-translate-x-full');
        DOM.sidebarOverlay.classList.toggle('hidden');
    }

    function initializeData() {
        // Inicializar habitaciones
        for(let i = 101; i <= 120; i++) {
            state.rooms[i] = { number: i, type: i <= 110 ? 'Individual' : 'Doble', status: 'disponible', price: i <= 110 ? 80 : 120, guest: null, cleaningStatus: 'limpia' };
        }
        
        // Datos de demo originales
        state.reservations = [
            { id: 1, clientName: 'Ana López', clientEmail: 'ana@email.com', clientPhone: '123-456-7890', room: 101, checkin: '2024-05-24', checkout: '2024-05-26', status: 'confirmada', observations: 'Cliente VIP' }
        ];

        state.rooms[101].status = 'ocupada';
        state.rooms[101].guest = 'Ana López';
        state.rooms[105].status = 'limpieza';
        state.rooms[105].cleaningStatus = 'sucia';
        state.rooms[110].status = 'ocupada';
        state.rooms[110].guest = 'Carlos Ruiz';
        state.rooms[115].status = 'mantenimiento';

        state.consumptions = [
            { room: 101, clientName: 'Ana López', concept: 'minibar', description: 'Bebidas y snacks', quantity: 2, price: 15.50, date: new Date().toLocaleDateString() },
            { room: 110, clientName: 'Carlos Ruiz', concept: 'lavanderia', description: 'Servicio de lavandería', quantity: 1, price: 25.00, date: new Date().toLocaleDateString() }
        ];
    }

    function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const user = state.users[username];
        if (user && user.password === password) {
            currentUser = username;
            currentRole = user.role;
            DOM.loginScreen.classList.add('hidden');
            DOM.dashboard.classList.remove('hidden');
            renderDashboard();
        } else {
            DOM.loginError.textContent = 'Usuario o contraseña incorrectos.';
            DOM.loginError.classList.remove('hidden');
        }
    }

    function logout() {
        currentUser = null;
        currentRole = null;
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        DOM.loginError.classList.add('hidden');
        DOM.dashboard.classList.add('hidden');
        DOM.loginScreen.classList.remove('hidden');
        if (!DOM.sidebar.classList.contains('-translate-x-full')) {
            toggleSidebar();
        }
    }

    function renderDashboard() {
        const user = state.users[currentUser];
        DOM.currentUser.textContent = user.name;
        DOM.currentRole.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        DOM.userAvatar.textContent = user.name.charAt(0);
        renderNavigation();
        showSection('homeSection');
    }

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

    function showSection(sectionId) {
        activeSection = sectionId;
        DOM.sections.forEach(section => section.classList.add('hidden'));
        document.getElementById(sectionId).classList.remove('hidden');
        
        const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
        DOM.mobileHeaderTitle.textContent = activeLink ? activeLink.dataset.label : 'Dashboard';

        renderNavigation();
        loadSectionData(sectionId);
    }

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
    
    function renderRooms() {
        const statusMap = {
            disponible: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', label: 'Disponible' },
            ocupada: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300', label: 'Ocupada' },
            limpieza: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', label: 'Limpieza' },
            mantenimiento: { bg: 'bg-slate-200', text: 'text-slate-800', border: 'border-slate-300', label: 'Mantenimiento' }
        };
        DOM.roomsGrid.innerHTML = Object.values(state.rooms).map(room => `
            <div class="p-4 rounded-lg border-2 text-center ${statusMap[room.status].bg} ${statusMap[room.status].text} ${statusMap[room.status].border}">
                <div class="font-bold text-lg">${room.number}</div>
                <div class="text-xs">${statusMap[room.status].label}</div>
            </div>
        `).join('');
    }
    
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

    function renderChart(canvasId, type, data, options) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        const chartId = `${activeSection}-${canvasId}`;
        if (charts[chartId]) charts[chartId].destroy();
        charts[chartId] = new Chart(ctx, { type, data, options });
    }

    function handleNewReservation(e) {
        e.preventDefault();
        const newReservation = {
            id: Date.now(),
            clientName: document.getElementById('clientName').value,
            clientEmail: document.getElementById('clientEmail').value,
            room: parseInt(document.getElementById('roomSelect').value),
            checkin: document.getElementById('checkinDate').value,
            checkout: document.getElementById('checkoutDate').value,
            status: 'confirmada'
        };
        state.reservations.push(newReservation);
        closeModal('reservationModal');
        e.target.reset();
        renderReservations();
    }
    
    function handleNewUser(e) {
        e.preventDefault();
        const username = document.getElementById('newUsername').value;
        if(state.users[username]) {
            alert('El nombre de usuario ya existe.');
            return;
        }
        state.users[username] = {
            password: document.getElementById('newPassword').value,
            name: document.getElementById('newFullName').value,
            role: document.getElementById('newUserRole').value
        };
        closeModal('userModal');
        e.target.reset();
        renderUsers();
    }

    function openModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
        document.getElementById(modalId).classList.add('flex');
    }

    function closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
        document.getElementById(modalId).classList.remove('flex');
    }

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

    function checkIn(id) {
        confirmAction({
            title: 'Confirmar Check-in',
            message: '¿Está seguro de que desea realizar el check-in para esta reserva? La habitación se marcará como ocupada.',
            confirmText: 'Sí, Check-in',
            onConfirm: () => {
                const res = state.reservations.find(r => r.id === id);
                if (res) {
                    res.status = 'en_curso';
                    state.rooms[res.room].status = 'ocupada';
                    state.rooms[res.room].guest = res.clientName;
                    renderReservations();
                }
            }
        });
    }

    function cancelReservation(id) {
        confirmAction({
            title: 'Cancelar Reserva',
            message: 'Esta acción no se puede deshacer. ¿Está seguro?',
            confirmText: 'Sí, Cancelar',
            onConfirm: () => {
                const res = state.reservations.find(r => r.id === id);
                if (res) {
                    res.status = 'cancelada';
                    if (state.rooms[res.room].status !== 'ocupada') {
                         state.rooms[res.room].status = 'disponible';
                    }
                    renderReservations();
                }
            }
        });
    }
    
    function deleteUser(username) {
        confirmAction({
            title: 'Eliminar Usuario',
            message: `¿Está seguro de que desea eliminar al usuario ${username}?`,
            confirmText: 'Sí, Eliminar',
            onConfirm: () => {
                delete state.users[username];
                renderUsers();
            }
        });
    }
    
    function startCleaning(roomNumber) {
        state.rooms[roomNumber].cleaningStatus = 'en_proceso';
        renderCleaning();
    }
    
    function finishCleaning(roomNumber) {
        state.rooms[roomNumber].cleaningStatus = 'limpia';
        state.rooms[roomNumber].status = 'disponible';
        renderCleaning();
    }

    return { init, logout, showSection, openModal, closeModal, checkIn, cancelReservation, deleteUser, startCleaning, finishCleaning };
})();

window.addEventListener('DOMContentLoaded', App.init);
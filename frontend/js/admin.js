document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('tourUser'));
    if (!user || user.role !== 'Admin') {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('adminNameDisplay').textContent = user.nombre;
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('tourUser');
        window.location.href = 'index.html';
    });

    initCalendar();
    loadUsers();
    loadZonesForSelect();

    document.getElementById('createTourForm').addEventListener('submit', handleCreateTour);
});

async function loadZonesForSelect() {
    try {
        const zones = await $.ajax({
            url: 'http://localhost:3000/api/zones',
            method: 'GET'
        });
        const select = document.getElementById('tourZones');
        select.innerHTML = zones.map(z => `<option value="${z.idZona}">${z.nombre}</option>`).join('');
    } catch (error) {
        console.error('Error loading zones:', error);
    }
}

let calendar;

function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: async function(info, successCallback, failureCallback) {
            try {
                const tours = await $.ajax({
                    url: 'http://localhost:3000/api/tours',
                    method: 'GET'
                });
                const events = tours.map(t => ({
                    title: t.tipo,
                    start: t.fechaInicio,
                    end: new Date(new Date(t.fechaInicio).getTime() + t.duracion * 60000).toISOString(),
                    color: '#16a34a'
                }));
                successCallback(events);
            } catch (error) {
                failureCallback(error);
            }
        }
    });
    calendar.render();
}

async function handleCreateTour(e) {
    e.preventDefault();
    const type = document.getElementById('tourType').value;
    const date = document.getElementById('tourDate').value;
    const time = document.getElementById('tourTime').value;
    const duration = document.getElementById('tourDuration').value;
    
    const zonesSelect = document.getElementById('tourZones');
    const selectedZones = Array.from(zonesSelect.selectedOptions).map(option => option.value);

    // Combine date and time for MySQL (YYYY-MM-DD HH:MM:SS)
    const mysqlDate = `${date} ${time}:00`;

    try {
        await $.ajax({
            url: 'http://localhost:3000/api/tours',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ 
                tipo: type, 
                fechaInicio: mysqlDate, 
                duracion: duration, 
                idGuia: null,
                zones: selectedZones 
            })
        });

        alert('Tour scheduled successfully!');
        calendar.refetchEvents();
        e.target.reset();
    } catch (error) {
        console.error('Error creating tour:', error);
        alert('Failed to schedule tour: ' + (error.responseJSON?.error || 'Unknown error'));
    }
}

async function loadUsers() {
    try {
        const users = await $.ajax({
            url: 'http://localhost:3000/api/participants',
            method: 'GET'
        });
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = users.map(u => `
            <tr class="border-b border-gray-700">
                <td class="p-3">${u.nombre}</td>
                <td class="p-3">${u.correo}</td>
                <td class="p-3">
                    <span class="px-2 py-1 rounded text-xs ${u.conexionActiva ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}">
                        ${u.conexionActiva ? 'Online' : 'Offline'}
                    </span>
                </td>
                <td class="p-3">
                    <button onclick="deleteUser(${u.idParticipante})" class="text-red-400 hover:text-red-300">
                        <i data-feather="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        feather.replace();
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function deleteUser(id) {
    if(!confirm('Are you sure you want to delete this user?')) return;
    try {
        await $.ajax({
            url: `http://localhost:3000/api/participants/${id}`,
            method: 'DELETE'
        });
        loadUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}
window.deleteUser = deleteUser;

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

    document.getElementById('createTourForm').addEventListener('submit', handleCreateTour);
});

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
                const response = await fetch('http://localhost:3000/api/tours');
                const tours = await response.json();
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
    const duration = document.getElementById('tourDuration').value;

    // Convert datetime-local to MySQL format (YYYY-MM-DD HH:MM:SS)
    const mysqlDate = date.replace('T', ' ') + ':00';

    try {
        const response = await fetch('http://localhost:3000/api/tours', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: type, fechaInicio: mysqlDate, duracion: duration, idGuia: null }) // Guide optional for now
        });

        if (response.ok) {
            alert('Tour scheduled successfully!');
            calendar.refetchEvents();
            e.target.reset();
        } else {
            const data = await response.json();
            alert('Failed to schedule tour: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error creating tour:', error);
    }
}

async function loadUsers() {
    try {
        const response = await fetch('http://localhost:3000/api/participants');
        const users = await response.json();
        const list = document.getElementById('usersList');
        
        list.innerHTML = users.map(u => `
            <div class="bg-gray-800 p-2 rounded flex justify-between items-center">
                <div>
                    <span class="text-white font-bold text-sm">${u.nombre}</span>
                    <span class="text-xs text-gray-400 block">${u.tourType ? 'Booked: ' + u.tourType : 'No Tour'}</span>
                </div>
                <button onclick="deleteUser(${u.idParticipante})" class="text-red-400 hover:text-red-300 text-xs">Remove</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function deleteUser(id) {
    if(!confirm('Remove user?')) return;
    try {
        await fetch(`http://localhost:3000/api/participants/${id}`, { method: 'DELETE' });
        loadUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}
window.deleteUser = deleteUser;

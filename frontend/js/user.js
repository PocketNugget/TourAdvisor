document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('tourUser'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('userNameDisplay').textContent = user.nombre;
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('tourUser');
        window.location.href = 'index.html';
    });

    initCalendar();
    loadTours();
    loadMyBookings(user.id);
    loadZonesForMove();
});

async function loadZonesForMove() {
    try {
        const response = await fetch('http://localhost:3000/api/zones');
        const zones = await response.json();
        const select = document.getElementById('moveZoneSelect');
        select.innerHTML = zones.map(z => `<option value="${z.idZona}">${z.nombre}</option>`).join('');
        
        // Also update current location display if we had that info in user object (we might need to fetch user details again)
        // For now, default is Lobby or whatever is in DB.
    } catch (error) {
        console.error('Error loading zones:', error);
    }
}

async function moveAvatar() {
    const user = JSON.parse(localStorage.getItem('tourUser'));
    const zoneId = document.getElementById('moveZoneSelect').value;
    const zoneName = document.getElementById('moveZoneSelect').options[document.getElementById('moveZoneSelect').selectedIndex].text;

    try {
        const response = await fetch('http://localhost:3000/api/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idParticipante: user.id, idZona: zoneId })
        });

        if (response.ok) {
            document.getElementById('currentZoneDisplay').textContent = zoneName;
            alert(`Moved to ${zoneName}`);
        } else {
            alert('Failed to move.');
        }
    } catch (error) {
        console.error('Error moving:', error);
    }
}
window.moveAvatar = moveAvatar;

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
                    color: '#22c55e'
                }));
                successCallback(events);
            } catch (error) {
                failureCallback(error);
            }
        }
    });
    calendar.render();
}

async function loadTours() {
    try {
        const response = await fetch('http://localhost:3000/api/tours');
        const tours = await response.json();
        const list = document.getElementById('toursList');
        
        list.innerHTML = tours.map(t => `
            <div class="bg-gray-800 rounded-lg border border-gray-700 hover:border-primary-500 transition overflow-hidden">
                <div class="h-32 overflow-hidden">
                    <img src="${getTourImage(t.tipo)}" alt="Tour" class="w-full h-full object-cover">
                </div>
                <div class="p-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-bold text-white">${t.tipo}</h4>
                            <p class="text-sm text-gray-400">${new Date(t.fechaInicio).toLocaleString()}</p>
                            <p class="text-xs text-gray-500">${t.duracion} mins</p>
                        </div>
                        <button onclick="bookTour(${t.idRecorrido})" class="bg-primary-600 hover:bg-primary-500 text-white px-3 py-1 rounded text-sm font-medium h-fit mt-1">Book</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading tours:', error);
    }
}

function getTourImage(type) {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('cenote')) return 'https://i.imgur.com/MGF02uk.jpeg';
    if (lowerType.includes('astronomy') || lowerType.includes('star')) return 'https://i.imgur.com/IUdDio3.jpeg';
    return 'https://i.imgur.com/pGKvx2s.jpeg'; // Default to El Castillo
}

async function bookTour(tourId) {
    const user = JSON.parse(localStorage.getItem('tourUser'));
    if(!confirm('Confirm booking for this tour?')) return;

    try {
        const response = await fetch('http://localhost:3000/api/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idParticipante: user.id, idRecorrido: tourId })
        });
        
        if (response.ok) {
            alert('Tour booked successfully!');
            loadMyBookings(user.id);
            calendar.refetchEvents(); // Refresh calendar if we want to show booked status differently
        } else {
            alert('Failed to book tour.');
        }
    } catch (error) {
        console.error('Booking error:', error);
    }
}
window.bookTour = bookTour;

async function loadMyBookings(userId) {
    // Ideally we have an endpoint for this, but for MVP we can filter participants list or add a new endpoint.
    // Let's use the participants endpoint which joins with tours.
    try {
        const response = await fetch('http://localhost:3000/api/participants');
        const users = await response.json();
        const me = users.find(u => u.idParticipante === userId);
        
        const container = document.getElementById('myBookings');
        
        // Update Current Location Display
        if (me && me.ubicacionActual) {
            document.getElementById('currentZoneDisplay').textContent = me.ubicacionActual;
        }

        if (me && me.tourType) {
            container.innerHTML = `
                <div class="bg-primary-900/30 p-3 rounded border border-primary-500/50">
                    <h4 class="font-bold text-primary-300">${me.tourType}</h4>
                    <p class="text-sm text-gray-300">Status: Confirmed</p>
                </div>
            `;
        } else {
            container.innerHTML = '<p class="text-gray-400 text-sm">No active bookings.</p>';
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

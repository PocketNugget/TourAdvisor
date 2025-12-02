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
        const zones = await $.ajax({
            url: 'http://localhost:3000/api/zones',
            method: 'GET'
        });
        const select = document.getElementById('moveZoneSelect');
        select.innerHTML = zones.map(z => `<option value="${z.idZona}">${z.nombre}</option>`).join('');
    } catch (error) {
        console.error('Error loading zones:', error);
    }
}

async function moveAvatar() {
    const user = JSON.parse(localStorage.getItem('tourUser'));
    const zoneId = document.getElementById('moveZoneSelect').value;
    const zoneName = document.getElementById('moveZoneSelect').options[document.getElementById('moveZoneSelect').selectedIndex].text;

    try {
        await $.ajax({
            url: 'http://localhost:3000/api/move',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ idParticipante: user.id, idZona: zoneId })
        });

        document.getElementById('currentZoneDisplay').textContent = zoneName;
        alert(`Moved to ${zoneName}`);
    } catch (error) {
        console.error('Error moving:', error);
        alert('Failed to move.');
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
                const tours = await $.ajax({
                    url: 'http://localhost:3000/api/tours',
                    method: 'GET'
                });
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
        const tours = await $.ajax({
            url: 'http://localhost:3000/api/tours',
            method: 'GET'
        });
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
        await $.ajax({
            url: 'http://localhost:3000/api/book',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ idParticipante: user.id, idRecorrido: tourId })
        });
        
        alert('Tour booked successfully!');
        loadMyBookings(user.id);
        calendar.refetchEvents(); 
    } catch (error) {
        console.error('Booking error:', error);
        alert('Failed to book tour.');
    }
}
window.bookTour = bookTour;

async function loadMyBookings(userId) {
    try {
        const users = await $.ajax({
            url: 'http://localhost:3000/api/participants',
            method: 'GET'
        });
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

document.addEventListener('DOMContentLoaded', () => {
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Toggle Tabs
    tabLogin.addEventListener('click', () => {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabLogin.classList.add('bg-gray-700', 'text-white');
        tabLogin.classList.remove('text-gray-400');
        tabRegister.classList.remove('bg-gray-700', 'text-white');
        tabRegister.classList.add('text-gray-400');
    });

    tabRegister.addEventListener('click', () => {
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        tabRegister.classList.add('bg-gray-700', 'text-white');
        showTab('register');
    });

    // Handle Login
    loginForm.addEventListener('submit', async function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;

    try {
        const data = await $.ajax({
            url: 'http://localhost:3000/api/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username: user, password: pass })
        });

        if (data.success) {
            const currentUser = data.user;
            localStorage.setItem('tourUser', JSON.stringify(currentUser));
            alert(`Welcome back, ${currentUser.nombre}!`);
            
            // Redirect based on role
            if (currentUser.role === 'Admin') {
                window.location.href = 'dashboard-admin.html';
            } else {
                window.location.href = 'dashboard-user.html';
            }
        } else {
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + (error.responseJSON?.message || 'Server error'));
    }
});

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const user = document.getElementById('regUser').value;
    const pass = document.getElementById('regPass').value;

    try {
        await $.ajax({
            url: 'http://localhost:3000/api/participants',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ nombre: name, correo: email, username: user, password: pass, idRol: 1 })
        });
        
        alert('Registration successful! Please login.');
        showTab('login');
    } catch (error) {
        console.error('Register error:', error);
        alert('Registration failed.');
    }
}

    // Handle Register
    registerForm.addEventListener('submit', handleRegister);
});

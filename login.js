document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://florentine-subsequent-passionfruit.glitch.me/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('❌ Invalid username or password!');
            } else {
                alert('⚠️ Something went wrong. Try again later.');
            }
            return;
        }

        const user = await response.json();
        alert(`✅ Welcome back, ${user.name}!`);

        // Store user and redirect
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'dashboard.html';

    } catch (error) {
        console.error('Login failed:', error);
        alert('🚫 Could not connect to the server.');
    }
});

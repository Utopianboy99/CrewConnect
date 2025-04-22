// Optionally set this from login
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (currentUser) {
  document.getElementById('welcome').textContent = `Welcome, ${currentUser.name}!`;
}

// Fetch office tabs
fetch('http://localhost:3000/offices')
  .then(res => res.json())
  .then(offices => {
    const tabs = document.getElementById('tabs');
    offices.forEach(office => {
      const btn = document.createElement('button');
      btn.textContent = office.label;
      btn.className = 'tab-button';
      btn.onclick = () => loadUsers(office.id);
      tabs.appendChild(btn);
    });
  });

// Load users in selected office
function loadUsers(officeId) {
  fetch(`http://localhost:3000/offices/${officeId}/users`)
    .then(res => res.json())
    .then(users => {
      const userList = document.getElementById('userList');
      userList.innerHTML = ''; // clear list

      if (users.length === 0) {
        userList.innerHTML = `<p>No users in this office yet.</p>`;
        return;
      }

      users.forEach(user => {
        const div = document.createElement('div');
        div.className = 'user-card';
        div.innerHTML = `
          <strong>${user.name}</strong>
          <br><br>
          Username: @${user.username}<br>
          DOB: ${user.dob}
        `;
        userList.appendChild(div);
      });
    });
}



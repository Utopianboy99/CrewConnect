document.getElementById('userForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // prevent the default form submission
  
    // Collect input values
    const name = document.getElementById('name').value;
    const username = document.getElementById('username').value;
    const dob = document.getElementById('dob').value;
    const officeId = document.getElementById('Office').value;
    const password = document.getElementById('password').value;
  
    // Create user object
    const user = { name, username, dob, officeId, password };
  
    try {
      const response = await fetch('https://florentine-subsequent-passionfruit.glitch.me/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });
  
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
  
      const data = await response.json();
      alert(`✅ Welcome, ${data.name}! You’ve been registered.`);
      console.log('Submitted user:', data);
  
      // Reset the form after successful submission
      document.getElementById('userForm').reset();
    } catch (error) {
      console.error('Submission error:', error);
      alert('Something went wrong. Please check the console.');
    }
  });
  
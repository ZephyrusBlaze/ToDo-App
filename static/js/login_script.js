document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('password');
    const showPasswordCheckbox = document.getElementById('show-password');

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting via default behavior

        const email = document.getElementById('email').value;
        const password = passwordInput.value;

        // Perform client-side form validation (you can add more validation checks here)
        if (!validateEmail(email)) {
            document.getElementById("error").innerHTML = 'Please enter a valid email address.';
            return;
        }

        if (password.length < 8) {
            document.getElementById("error").innerHTML = 'Password must be at least 8 characters long.';
            return;
        }

        // If form validation passes, send the login data to the server
        const loginData = new URLSearchParams({
            email: email,
            password: password
        });

        // Send a POST request to the Flask server to handle user login
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded' // Use URL-encoded form data
            },
            body: loginData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok'); // Handle non-2xx responses
                }
                return response.text(); // Parse the response text as plain text
            })
            .then(data => {
                try {
                    const jsonData = JSON.parse(data);
                    if (jsonData.success) {
                        window.location.href = '/dashboard';
                    } else {
                        document.getElementById("error").innerHTML = jsonData.message;
                    }
                } catch (e) {
                    console.log(data);
                }
            })

            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again later.');
            });
    });

    // Function to validate email format
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Add event listener to show password checkbox
    showPasswordCheckbox.addEventListener('change', function () {
        if (showPasswordCheckbox.checked) {
            passwordInput.type = 'text';
        } else {
            passwordInput.type = 'password';
        }
    });
});

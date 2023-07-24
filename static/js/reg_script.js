document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('register-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const showPasswordCheckbox = document.getElementById('show-password');

    // Add event listener to the register form submission
    registerForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting via default behavior

        const email = document.getElementById('email').value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Perform client-side form validation (you can add more validation checks here)
        if (!validateEmail(email)) {
            document.getElementById("error").innerHTML = 'Please enter a valid email address.';
            return;
        }

        if (password.length < 8) {
            document.getElementById("error").innerHTML = 'Password must be at least 8 characters long.';
            return;
        }

        if (password !== confirmPassword) {
            document.getElementById("error").innerHTML = "Passwords don't match.";
            return;
        }

        // If form validation passes, send the registration data to the server
        const registerData = new URLSearchParams({
            email: email,
            password: password
        });

        // Send a POST request to the Flask server to handle user registration
        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded' // Use URL-encoded form data
            },
            body: registerData
        })
            .then(response => response.json())
            .then(data => {
                // Redirect to the dashboard after successful registration
                if (data.success) {
                    window.location.href = '/dashboard';
                } else {
                    document.getElementById("error").innerHTML = data.message; // Display an error message if registration fails
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
            confirmPasswordInput.type = 'text';
        } else {
            passwordInput.type = 'password';
            confirmPasswordInput.type = 'password';
        }
    });
});

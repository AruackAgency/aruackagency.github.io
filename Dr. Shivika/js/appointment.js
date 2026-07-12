document.addEventListener('DOMContentLoaded', () => {
    
    const appointmentForm = document.getElementById('appointmentForm');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    if (appointmentForm) {
        // Set minimum date to today
        const dateInput = document.getElementById('date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);

        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Basic custom validation (HTML5 handles most of required fields)
            const phone = document.getElementById('phone').value;
            const phoneRegex = /^[0-9\+\-\s\(\)]{10,15}$/;
            
            if (!phoneRegex.test(phone)) {
                alert('Please enter a valid phone number.');
                return;
            }

            // Show success modal
            successModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Reset form
            appointmentForm.reset();
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            successModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }
    
    // Close modal if clicked outside of content
    if (successModal) {
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                successModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

});

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const passwordModal = document.getElementById('passwordModal');
    const changePasswordForm = document.getElementById('changePasswordForm');
    
    let currentUsername = ''; // Para saber a quién cambiarle la contraseña

    // Proceso de Login con Supabase
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();

            if (error || !user) {
                alert('Usuario o contraseña incorrectos');
                return;
            }

            // Guardamos el username actual en caso de necesitar cambiar la contraseña
            currentUsername = user.username;

            if (user.estado_password === 'temporal') {
                passwordModal.classList.add('active');
            } else {
                // Guardamos el usuario en sesión
                sessionStorage.setItem('user', JSON.stringify(user));
                
                // Redirigir según el rol
                if (user.rol === 'super_admin' || user.rol === 'admin') {
                    window.location.href = 'pages/admin-dashboard.html';
                } else {
                    window.location.href = 'pages/student-dashboard.html';
                }
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            alert('No se pudo conectar con Supabase.');
        }
    });

    // Proceso de Cambio de Contraseña con Supabase
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            alert('Las contraseñas no coinciden. Inténtalo de nuevo.');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('users')
                .update({ password: newPassword, estado_password: 'permanente' })
                .eq('username', currentUsername);

            if (error) {
                alert('Error al actualizar contraseña en Supabase');
                return;
            }

            alert('Contraseña actualizada exitosamente. Por favor, inicia sesión con tu nueva contraseña.');
            passwordModal.classList.remove('active');
            window.location.reload();
        } catch (error) {
            console.error('Error de conexión:', error);
            alert('No se pudo conectar con Supabase para cambiar la contraseña.');
        }
    });
});

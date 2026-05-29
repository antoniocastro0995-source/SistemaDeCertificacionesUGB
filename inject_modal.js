const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'pages');
const files = ['admin-dashboard.html', 'student-dashboard.html', 'modules.html', 'exams.html', 'mentors.html', 'certificate.html'];

const modalHTML = `
    <!-- Perfil Modal (Glassmorphism) -->
    <div class="modal-overlay" id="profileModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 9999; justify-content: center; align-items: center;">
        <div class="glass-panel" style="width: 90%; max-width: 400px; padding: 30px; position: relative;">
            <button onclick="document.getElementById('profileModal').style.display='none'" style="position: absolute; right: 20px; top: 20px; background: transparent; border: none; color: white; cursor: pointer; font-size: 1.2rem;">✖</button>
            <h2 class="text-gradient" style="text-align: center; margin-bottom: 20px;">Mi Perfil</h2>
            
            <form id="modalProfileForm" style="display: flex; flex-direction: column; gap: 15px;">
                <div style="text-align: center;">
                    <div id="modalAvatarPreview" style="width: 100px; height: 100px; border-radius: 50%; background: #374151; margin: 0 auto 10px auto; display: flex; align-items: center; justify-content: center; font-size: 2rem; overflow: hidden; border: 3px solid var(--accent-blue);">
                        <!-- Avatar -->
                    </div>
                    <label for="modalAvatarInput" style="cursor: pointer; color: var(--accent-blue); font-size: 0.9rem; text-decoration: underline;">Cambiar Foto</label>
                    <input type="file" id="modalAvatarInput" accept="image/*" style="display: none;">
                </div>
                
                <div class="input-group" style="margin: 0;">
                    <label>Nombre Completo</label>
                    <input type="text" id="modalProfileName" class="input-control" required>
                </div>
                
                <div class="input-group" style="margin: 0;">
                    <label>Nueva Contraseña (Opcional)</label>
                    <input type="password" id="modalProfilePass" class="input-control" placeholder="Dejar en blanco para no cambiar">
                </div>
                
                <button type="submit" class="btn-primary" style="margin-top: 10px;">Guardar Cambios</button>
            </form>
        </div>
    </div>

    <script>
        // Lógica del Modal
        const profileModal = document.getElementById('profileModal');
        const userProfileBtn = document.querySelector('.user-profile');
        
        if(userProfileBtn) {
            userProfileBtn.style.cursor = 'pointer';
            userProfileBtn.title = "Clic para editar perfil";
            userProfileBtn.addEventListener('click', () => {
                const sessionUser = JSON.parse(sessionStorage.getItem('user'));
                if(sessionUser) {
                    document.getElementById('modalProfileName').value = sessionUser.nombre;
                    if(sessionUser.avatar_url) {
                        document.getElementById('modalAvatarPreview').innerHTML = \`<img src="http://localhost:3000\${sessionUser.avatar_url}" style="width:100%; height:100%; object-fit:cover;">\`;
                    } else {
                        document.getElementById('modalAvatarPreview').innerText = sessionUser.nombre.charAt(0);
                    }
                }
                profileModal.style.display = 'flex';
            });
        }

        let selectedAvatarFile = null;
        document.getElementById('modalAvatarInput').addEventListener('change', (e) => {
            if(e.target.files && e.target.files[0]) {
                selectedAvatarFile = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('modalAvatarPreview').innerHTML = \`<img src="\${e.target.result}" style="width:100%; height:100%; object-fit:cover;">\`;
                };
                reader.readAsDataURL(selectedAvatarFile);
            }
        });

        document.getElementById('modalProfileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const sessionUser = JSON.parse(sessionStorage.getItem('user'));
            const formData = new FormData();
            formData.append('userId', sessionUser.id);
            formData.append('nombre', document.getElementById('modalProfileName').value);
            const pass = document.getElementById('modalProfilePass').value;
            if(pass) formData.append('password', pass);
            if(selectedAvatarFile) formData.append('avatar', selectedAvatarFile);

            try {
                const res = await fetch('http://localhost:3000/api/profile/update', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if(data.success) {
                    sessionStorage.setItem('user', JSON.stringify(data.user));
                    alert('Perfil actualizado.');
                    window.location.reload();
                }
            } catch(e) { alert('Error actualizando perfil'); }
        });
    </script>
`;

files.forEach(f => {
    const filePath = path.join(dir, f);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Remove profile.html link
        content = content.replace(/<li><a href="profile\.html"[^>]*>Mi Perfil<\/a><\/li>/g, '');
        
        // Add modal before </body>
        if (!content.includes('id="profileModal"')) {
            content = content.replace('</body>', modalHTML + '\n</body>');
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Injected modal in', f);
    }
});

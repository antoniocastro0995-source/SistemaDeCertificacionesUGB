// ==========================================
// CONFIGURACIÓN GLOBAL DE SUPABASE
// ==========================================

const supabaseUrl = 'https://jzzdozftahqfechbxlng.supabase.co';
const supabaseKey = 'sb_publishable_s5QcjkJeju6WsxeSq-ytfQ_ntqowckl';

// Inicializar el cliente reemplazando el objeto global de la librería
window.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Función global para manejar subida de archivos (imágenes/documentos) al bucket 'archivos'
async function uploadToSupabase(file, folderPath) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folderPath}/${fileName}`;

    const { data, error } = await supabase.storage
        .from('archivos')
        .upload(filePath, file);

    if (error) {
        console.error('Error subiendo archivo a Supabase:', error);
        throw error;
    }

    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
        .from('archivos')
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
}

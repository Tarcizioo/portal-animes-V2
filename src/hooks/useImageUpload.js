import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export function useImageUpload() {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);

    /**
     * Compresses an image and returns as Base64 string
     * @param {File} file 
     * @returns {Promise<string>}
     */
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const maxWidth = 800; // Reduzi um pouco para garantir string menor
            const maxHeight = 800;
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Retorna Base64 direto (JPEG 70% quality)
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    /**
     * Processes image for profile (compression + base64)
     * Does NOT upload to Storage anymore to avoid CORS/Permissions issues.
     * @param {File} file
     * @returns {Promise<string>} Base64 string
     */
    const uploadImage = async (file) => {
        if (!file) return null;

        setUploading(true);
        try {
            const base64String = await compressImage(file);
            return base64String;
        } catch (error) {
            console.error("Erro ao processar imagem:", error);
            throw error;
        } finally {
            setUploading(false);
        }
    };

    return { uploadImage, uploading };
}

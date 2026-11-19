import { useState } from 'react';
import {
  CLOUDINARY_UPLOAD_URL,
  CLOUDINARY_UPLOAD_PRESET
} from './cloudinary';

function PhotoUpload({ onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handlePhotoUpload(event) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select image files only.');
        }

        if (file.size > 10 * 1024 * 1024) {
          throw new Error('Each photo must be smaller than 10 MB.');
        }

        const formData = new FormData();

        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || 'Photo upload failed.');
        }

        onUpload(result.secure_url);
      }

    } catch (error) {
      console.error('Photo upload error:', error);
      setError(error.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  return (
    <div className="photo-upload">

      <label htmlFor="adventure-photos">
        Upload our adventure photos 📸
      </label>

      <input
        id="adventure-photos"
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoUpload}
        disabled={uploading}
      />

      {uploading && <p>Uploading our photos... ❤️</p>}

      {error && <p className="date-error">{error}</p>}

    </div>
  );
}

export default PhotoUpload;
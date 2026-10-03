import api from './api';

const uploadService = {
  // Upload multiple images
  uploadMultiple: async (files, folder = 'takkunu-booku') => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    formData.append('folder', folder);

    const response = await api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload a single image
  uploadSingle: async (file, folder = 'takkunu-booku') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    const response = await api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete an image by publicId
  deletePhoto: async (publicId) => {
    const response = await api.delete(`/upload/${encodeURIComponent(publicId)}`);
    return response.data;
  },
};

export default uploadService;

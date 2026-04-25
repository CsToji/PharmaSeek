/**
 * AI Service
 * Handles image OCR and drug detection
 */

import apiClient from './apiClient';

const aiService = {
  /**
   * Analyze image and detect drug
   */
  analyzeImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return apiClient.post('/api/ai/analyze', formData);
  },

  /**
   * Detect drug from image
   */
  detectDrug: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return apiClient.post('/api/ai/detect-drug', formData);
  },

  /**
   * Extract text from image only
   */
  extractText: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return apiClient.post('/api/ai/ocr', formData);
  },

  /**
   * Test AI service
   */
  test: async () => {
    return apiClient.get('/api/ai/test');
  },
};

export default aiService;
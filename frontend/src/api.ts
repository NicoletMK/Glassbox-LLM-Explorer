import axios, { AxiosError } from 'axios';
import { ModelParams, Prediction } from './types';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  timeout: 30000,
});

export const getPrediction = async (params: ModelParams): Promise<Prediction> => {
  try {
    const response = await API.post('/predict', {
      ...params,
      _cacheBuster: Date.now() // Prevent caching
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message);
    }
    throw new Error('Failed to get prediction');
  }
};

// Add this new function
export const breakModel = async (): Promise<Prediction> => {
  try {
    const response = await API.get('/break');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message);
    }
    throw new Error('Failed to break model');
  }
};
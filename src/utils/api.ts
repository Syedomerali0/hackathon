import axios from 'axios';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = axios.create({
  baseURL: supabaseUrl,
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
  },
});

export const geminiApi = axios.create({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  headers: {
    'Authorization': `Bearer ${process.env.REACT_APP_GEMINI_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export const inaturalistApi = axios.create({
  baseURL: 'https://api.inaturalist.org/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const googleMapsApi = axios.create({
  baseURL: 'https://maps.googleapis.com/maps/api',
  params: {
    key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  },
});

import React, { useState } from 'react';
import { Container, Box, Typography, Button, TextField, Paper, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { addObservation, setLoading } from '../store/slices/observationSlice';
import { supabase, geminiApi, inaturalistApi } from '../utils/api';
import type { Observation } from '../types';

const Observe: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [image, setImage] = useState<File | null>(null);
  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [loading, setLoadingState] = useState(false);
  const [speciesSuggestions, setSpeciesSuggestions] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocation(prev => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;

    try {
      setLoadingState(true);
      dispatch(setLoading(true));

      // Upload image to Supabase
      const file = new FormData();
      file.append('file', image);
      const imageResponse = await supabase.post('/storage/v1/object/public/observations', file);
      
      // Get species suggestions using Gemini
      const geminiResponse = await geminiApi.post('', {
        contents: [{
          parts: [{
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageResponse.data,
            },
          }],
        }],
      });

      // Get species validation from iNaturalist
      const inaturalistResponse = await inaturalistApi.get('/observations/species_counts', {
        params: {
          lat: location.latitude,
          lng: location.longitude,
          radius: 1,
        },
      });

      // Create observation
      const observation: Observation = {
        id: Date.now(),
        userId: 'user_123', // Replace with actual user ID from authentication
        imageUrl: imageResponse.data,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        timestamp: new Date().toISOString(),
        species: {
          name: geminiResponse.data.candidates[0].content.parts[0].text,
          scientificName: inaturalistResponse.data.results[0].scientific_name,
          confidence: geminiResponse.data.candidates[0].rating,
        },
        status: 'pending' as const,
      };

      dispatch(addObservation(observation));
      navigate('/');
    } catch (error) {
      console.error('Error creating observation:', error);
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Add New Observation
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
            <Button
              variant="contained"
              component="label"
              fullWidth
            >
              Upload Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
              <TextField
                fullWidth
                label="Latitude"
                name="latitude"
                type="number"
                value={location.latitude}
                onChange={handleLocationChange}
              />
              <TextField
                fullWidth
                label="Longitude"
                name="longitude"
                type="number"
                value={location.longitude}
                onChange={handleLocationChange}
              />
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Submit Observation
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Observe;

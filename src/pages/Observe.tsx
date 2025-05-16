import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, TextField, Paper, CircularProgress, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { addObservation, setLoading } from '../store/slices/observationSlice';
import { supabase, geminiApi, inaturalistApi } from '../utils/api';
import type { Observation } from '../types';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

// Declare the Google Maps namespace
declare global {
  interface Window {
    google: any;
  }
}
interface Taxon {
    common_name?: string;
  }
  
  interface SpeciesResult {
    count: number;
    taxon: Taxon;
  }
  
  interface iNaturalistResponse {
    results: SpeciesResult[];
  }
  

// Define libraries as a constant
const MAP_LIBRARIES = ['places', 'visualization'] as const;

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
  overflow: 'hidden',
};

const Observe: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [image, setImage] = useState<File | null>(null);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [loading, setLoadingState] = useState(false);
  const [speciesSuggestions, setSpeciesSuggestions] = useState<string[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [speciesName, setSpeciesName] = useState('');
const [observationDate, setObservationDate] = useState(new Date().toISOString());
const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    // Get user's current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error('Error getting location:', error);
        // Fallback to default location if geolocation fails
        setLocation({ lat: 33.6844, lng: 73.0479 });
      }
    );

    // Add a click event listener to the map container to prevent scrolling
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
      mapContainer.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
    }
    return () => {
      if (mapContainer) {
        mapContainer.removeEventListener('wheel', (e) => e.preventDefault());
      }
    };
  }, []);
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    
      try {
        // First check iNaturalist
        const inaturalistResponse = await fetch(`https://api.inaturalist.org/v1/observations/species_counts?lat=${location.lat}&lng=${location.lng}&radius=1`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
        });
  
        if (!inaturalistResponse.ok) {
          throw new Error('Failed to fetch iNaturalist data');
        }
  
        const inaturalistData = await inaturalistResponse.json();
        
        // Check if any species match our location
        const speciesFound = inaturalistData.results?.some((result: SpeciesResult) => 
          result.count > 0 && 
          result.taxon?.common_name?.toLowerCase().includes('margalla')
        );
  
        if (speciesFound) {
          setSpeciesName('Found in Margalla Hills');
          return;
        }
  
        // If not found in iNaturalist, use Gemini
        // Convert file to base64 using FileReader
        const fileReader = new FileReader();
        let imageData = '';
        
        fileReader.onload = (event) => {
          if (event.target?.result) {
            imageData = event.target.result.toString();
          }
        };
        
        fileReader.readAsDataURL(file);
        
        // Wait for the file to be read
        await new Promise((resolve) => {
          fileReader.onloadend = resolve;
        });
  
        // Check if we have a valid Gemini API key
        const geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY;
        if (!geminiApiKey) {
          throw new Error('Gemini API key is not configured');
        }
  
        const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${geminiApiKey}`
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: imageData.split(',')[1], // Remove the data: prefix
                },
              }],
            }],
            prompt: "Identify the species in this image and provide its common name. Focus on species found in Margalla Hills region."
          }),
        });
  
        if (!geminiResponse.ok) {
          const errorData = await geminiResponse.json();
          throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
        }
  
        const geminiData = await geminiResponse.json();
        const suggestedSpeciesName = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Unknown';
        setSpeciesName(`Suggested: ${suggestedSpeciesName}`);
      } catch (error) {
        console.error('Error checking species:', error);
        if (error instanceof Error) {
          setSpeciesName(`Error: ${error.message}`);
        } else {
          setSpeciesName('Could not determine species');
        }
      }
    }
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setLocation({ lat, lng });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form default submission
    if (!image) return;
  
    try {
      setLoadingState(true);
      dispatch(setLoading(true));
  
      // Upload image to Supabase
      const file = new FormData();
      file.append('file', image);
      const imageResponse = await supabase.post('/storage/v1/object/public/observations', file);
  
      // Get species suggestions using Gemini
      const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_GEMINI_API_KEY}`
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageResponse.data,
              },
            }],
          }],
        }),
      });
  
      const geminiData = await geminiResponse.json();
  
      // Extract species name from Gemini response
      const suggestedSpeciesName = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Unknown';
      setSpeciesName(suggestedSpeciesName);
  
      // Get species validation from iNaturalist
      const inaturalistResponse = await fetch(`${process.env.REACT_APP_INATURALIST_API_URL}/observations/species_counts?lat=${location.lat}&lng=${location.lng}&radius=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_INATURALIST_API_KEY}`
        },
      });
  
      const inaturalistData = await inaturalistResponse.json();
  
      // Create observation
      const observation: Observation = {
        id: Date.now(),
        userId: 'user_123',
        imageUrl: imageResponse.data,
        location: {
          latitude: location.lat,
          longitude: location.lng,
        },
        timestamp: new Date().toISOString(),
        species: {
          name: suggestedSpeciesName,
          scientificName: inaturalistData.results?.[0]?.scientific_name || 'Unknown',
          confidence: geminiData.candidates?.[0]?.rating || 0,
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
  
  const onLoad = React.useCallback(function callback(mapInstance: google.maps.Map) {
    console.log('Google Maps loaded successfully');
    const bounds = new window.google.maps.LatLngBounds(location);
    mapInstance.fitBounds(bounds);
    setMap(mapInstance);
  }, [location]);

  const onUnmount = React.useCallback(function callback() {
    console.log('Google Maps unmounted');
    setMap(null);
  }, []);

  if (mapError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add New Observation
        </Typography>
        <Typography color="error" variant="body1">
          Error loading Google Maps: {mapError}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Add New Observation
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
          <Grid item xs={12}>
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
</Grid>

{image && (
  <Grid item xs={12}>
    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="subtitle1" gutterBottom>
        Image Preview
      </Typography>
      <img
        src={URL.createObjectURL(image)}
        alt="Preview"
        style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
      />
    </Paper>
  </Grid>
)}




            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Latitude"
                value={location.lat}
                onChange={(e) => handleLocationChange(parseFloat(e.target.value), location.lng)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Longitude"
                value={location.lng}
                onChange={(e) => handleLocationChange(location.lat, parseFloat(e.target.value))}
              />
            </Grid>

            <Grid item xs={12}>
  <TextField
    fullWidth
    label="Species Name"
    value={speciesName}
    onChange={(e) => setSpeciesName(e.target.value)}
  />
</Grid>
<Grid item xs={12}>
  <TextField
    fullWidth
    label="Observation Date & Time"
    value={observationDate}
    disabled
  />
</Grid>


            <Grid item xs={12}>
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
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Observe;

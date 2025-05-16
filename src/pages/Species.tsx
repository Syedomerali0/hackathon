import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Card, CardMedia, CardContent, Button, TextField, CircularProgress } from '@mui/material';
import { supabase, inaturalistApi } from '../utils/api';

const Species: React.FC = () => {
  const [species, setSpecies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpecies();
  }, []);

  const fetchSpecies = async () => {
    try {
      const { data } = await supabase.get('/rest/v1/species');
      setSpecies(data);
    } catch (error) {
      console.error('Error fetching species:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchSpecies = async () => {
    if (!searchTerm) return;

    try {
      const response = await inaturalistApi.get('/taxa', {
        params: {
          q: searchTerm,
          rank: 'species',
          per_page: 10,
        },
      });
      setSpecies(response.data.results);
    } catch (error) {
      console.error('Error searching species:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Explore Species
        </Typography>
        <TextField
          fullWidth
          label="Search species"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchSpecies()}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={searchSpecies}
        >
          Search
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
          {species.map((speciesItem) => (
            <Card key={speciesItem.id}>
              {speciesItem.default_photo?.url && (
                <CardMedia
                  component="img"
                  height="200"
                  image={speciesItem.default_photo.url}
                  alt={speciesItem.name}
                />
              )}
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {speciesItem.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Scientific Name: {speciesItem.scientific_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Conservation Status: {speciesItem.conservation_status}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Species;
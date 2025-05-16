import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Card, CardMedia, CardContent, Button, CircularProgress } from '@mui/material';
import { supabase } from '../utils/api';
import { Observation } from '../types';

const Community: React.FC = () => {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchObservations();
  }, []);

  const fetchObservations = async () => {
    try {
      const { data } = await supabase.get('/rest/v1/observations');
      setObservations(data);
    } catch (error) {
      console.error('Error fetching observations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (observationId: number, vote: boolean) => {
    try {
      await supabase.post(`/rest/v1/validation_votes`, {
        observation_id: observationId,
        vote: vote,
      });
      // Refresh observations after voting
      fetchObservations();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Community Observations
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
          {observations.map((observation) => (
            <Card key={observation.id}>
              <CardMedia
                component="img"
                height="200"
                image={observation.imageUrl}
                alt={observation.species?.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {observation.species?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Location: {observation.location.latitude}, {observation.location.longitude}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Timestamp: {new Date(observation.timestamp).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {observation.status}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Validation Votes: {observation.validationVotes}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleVote(observation.id, true)}
                  >
                    Validate
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleVote(observation.id, false)}
                  >
                    Reject
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Community;

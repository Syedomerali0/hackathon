export interface Observation {
  id: number;
  userId: string;
  imageUrl: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  species?: {
    name: string;
    scientificName: string;
    confidence: number;
  };
  status: 'pending' | 'identified' | 'validated';
  validationVotes?: number;
}

export interface Species {
  id: number;
  commonName: string;
  scientificName: string;
  imageUrl: string;
  description: string;
  conservationStatus: string;
  habitat: string;
}

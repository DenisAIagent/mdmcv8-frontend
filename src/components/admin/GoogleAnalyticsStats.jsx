import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

const API_URL = 'https://analyticsdata.googleapis.com/v1beta/properties';

const GoogleAnalyticsStats = ({ propertyId, accessToken }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!propertyId || !accessToken) return;
    setLoading(true);
    setError(null);

    const fetchStats = async () => {
      try {
        const response = await axios.post(
          `${API_URL}/${propertyId}:runReport`,
          {
            dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
            metrics: [
              { name: 'activeUsers' },
              { name: 'sessions' },
              { name: 'screenPageViews' },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setStats(response.data);
      } catch (err) {
        setError('Erreur lors de la récupération des statistiques Google Analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [propertyId, accessToken]);

  return (
    <Box sx={{ my: 2 }}>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {stats && stats.rows && stats.rows[0] && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Statistiques des 7 derniers jours</Typography>
          <Typography>Utilisateurs actifs : <b>{stats.rows[0].metricValues[0].value}</b></Typography>
          <Typography>Sessions : <b>{stats.rows[0].metricValues[1].value}</b></Typography>
          <Typography>Pages vues : <b>{stats.rows[0].metricValues[2].value}</b></Typography>
        </Box>
      )}
    </Box>
  );
};

export default GoogleAnalyticsStats;

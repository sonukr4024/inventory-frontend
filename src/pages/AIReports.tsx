import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { Psychology, Send } from '@mui/icons-material';
import { aiReportService } from '../services/aiReportService';

const AIReports: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const examplePrompts = [
    'What were the top 5 selling products this month and what was the revenue from each?',
    'Show me a summary of sales trends for the past week',
    'Which customers have the highest outstanding balance?',
    'Analyze inventory levels and suggest which products need restocking',
    'What is the total revenue breakdown by payment mode?'
  ];

  const handleGenerateReport = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await aiReportService.generateReport({ prompt });
      setReport(response.data.report);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Psychology sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4">AI-Powered Reports</Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Ask questions about your business in natural language and get AI-generated insights.
          </Typography>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Enter Your Query
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Example: What were the top selling products last month?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            margin="normal"
          />
          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
            onClick={handleGenerateReport}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Example Queries
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            {examplePrompts.map((example, index) => (
              <Button
                key={index}
                variant="outlined"
                onClick={() => handleExampleClick(example)}
                sx={{ justifyContent: 'flex-start', textAlign: 'left', textTransform: 'none' }}
              >
                {example}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      {report && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            AI Generated Report
          </Typography>
          <Box
            sx={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              bgcolor: 'grey.50',
              p: 2,
              borderRadius: 1,
              maxHeight: '600px',
              overflow: 'auto'
            }}
          >
            {report}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default AIReports;

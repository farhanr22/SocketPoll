import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  IconButton,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
  Divider,
  Checkbox,
  Stack
} from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { ThemeProvider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { v4 as uuidv4 } from 'uuid';

import PollSuccessDialog from './PollSuccessDialog';
import Notification from './Notification';
import { createPoll } from '../services/api';
import { themeOptions, getPollThemes } from '../themes/pollThemes';

// Available durations users can choose from
const durationOptions = [
  { value: 1, label: '1 Hour' },
  { value: 6, label: '6 Hours' },
  { value: 24, label: '1 Day' },
  { value: 72, label: '3 Days' },
  { value: 168, label: '7 Days' },
];


function PollCreationForm({ onPollCreated }) {
  const [question, setQuestion] = useState('');

  // The options are stored as an array of objects, each with a unique ID
  const [options, setOptions] = useState([
    { id: uuidv4(), value: '' },
    { id: uuidv4(), value: '' },
  ]);

  const [duration, setDuration] = useState(24);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [newPollData, setNewPollData] = useState(null);
  const [allowMultipleChoices, setAllowMultipleChoices] = useState(false);
  const [publicResults, setPublicResults] = useState(true);
  const [error, setError] = useState(null);

  const [theme, setTheme] = useState('default');
  const mainTheme = useTheme();
  const pollThemes = getPollThemes(mainTheme);



  // Handles updates when the text for an option changes
  const handleOptionChange = (id, value) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, value } : opt));
  };

  // Adds a new empty option field
  const handleAddOption = () => {
    setOptions([...options, { id: uuidv4(), value: '' }]);
  };

  // Removes a specific option by its ID
  const handleRemoveOption = (id) => {
    setOptions(options.filter(opt => opt.id !== id));
  };

  // Handles the form submission and logs the poll data
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const payload = {
      question,
      options: options.map(opt => opt.value),
      duration_hours: duration,
      theme,
      allow_multiple_choices: allowMultipleChoices,
      public_results: publicResults,
      turnstile_token: "placeholder_token", // Will replace later
    };

    try {
      const result = await createPoll(payload);
      console.log("SUCCESS! Poll created:", result);
      onPollCreated(result);

      setNewPollData(result);
      setShowSuccessDialog(true);
      //Remaining steps : turnstile, themes

    } catch (error) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.response?.data?.detail) {
        // FastAPI 422 error response has a 'detail' array of objects
        if (Array.isArray(error.response.data.detail)) {
          // Grab the message from the first error
          errorMessage = error.response.data.detail[0].msg;
        }
        // Handle other cases
        else if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        }
      } console.error("Failed to create poll:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <ThemeProvider theme={pollThemes[theme]}>
      <Card sx={{ width: '100%', p: 1.75, borderRadius: 2 }}>
        <CardContent sx={{
          p: { xs: 0.6, sm: 1.7 },
          pt: { xs: 0.4, sm: 0.9 },
        }}>
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            color="primary"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HelpOutlineIcon sx={{ mr: 0.75 }} />
            Poll Question
          </Typography>


          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

              <TextField
                placeholder="What's on your mind?"
                fullWidth
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />

              <Box>
                <Typography variant="h6" component="h2" gutterBottom color="primary">
                  Options
                </Typography>

                <TransitionGroup>
                  {options.map((option) => (
                    <Collapse key={option.id}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1.5,
                        }}
                      >
                        <TextField
                          placeholder="Option"
                          fullWidth
                          required
                          value={option.value}
                          onChange={(e) =>
                            handleOptionChange(option.id, e.target.value)
                          }
                        />

                        <Collapse in={options.length > 2} orientation="horizontal">
                          <IconButton onClick={() => handleRemoveOption(option.id)}>
                            <RemoveCircleOutlineIcon />
                          </IconButton>
                        </Collapse>
                      </Box>
                    </Collapse>
                  ))}
                </TransitionGroup>

                <Button
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={handleAddOption}
                  variant="outlined"
                >
                  Add Option
                </Button>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Voting Duration</InputLabel>
                  <Select
                    value={duration}
                    label="Voting Duration"
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    {durationOptions.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={theme}
                    label="Theme"
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    {themeOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value} >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              backgroundColor: opt.color,
                              border: '1px solid #ccc',
                              flexShrink: 0,
                            }}
                          />
                          <Typography>{opt.label}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Stack direction="column" spacing={-1} sx={{ mt: 0 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allowMultipleChoices}
                      onChange={(e) => setAllowMultipleChoices(e.target.checked)}
                      sx={{ pl: 0 }}
                    />
                  }
                  label="Allow multiple choices"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={publicResults}
                      onChange={(e) => setPublicResults(e.target.checked)}
                      sx={{ pl: 0 }}
                    />
                  }
                  label="Results are public"
                />
              </Stack>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Poll'}
              </Button>
            </Box>
          </form>
        </CardContent>

        <PollSuccessDialog
          open={showSuccessDialog}
          onClose={() => setShowSuccessDialog(false)}
          pollData={newPollData}
        />
        <Notification
          open={!!error}
          onClose={() => setError(null)}
          message={error}
          severity="error"
        />
      </Card >
    </ThemeProvider>
  );
}

export default PollCreationForm;

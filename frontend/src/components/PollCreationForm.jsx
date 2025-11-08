import { useState, useRef } from 'react';
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
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CircleTwoToneIcon from '@mui/icons-material/CircleTwoTone';
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { ThemeProvider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { v4 as uuidv4 } from 'uuid';
import { Turnstile } from '@marsidev/react-turnstile';

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
  const [turnstileToken, setTurnstileToken] = useState(null);
  const turnstileRef = useRef(null);

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
    setError(null); // Clear previous errors

    const payload = {
      question,
      options: options.map(opt => opt.value),
      duration_hours: duration,
      theme,
      allow_multiple_choices: allowMultipleChoices,
      public_results: publicResults,
      turnstile_token: turnstileToken,
    };

    const result = await createPoll(payload);

    if (result.success) {
      console.log("SUCCESS! Poll created:", result.data);

      // Pass the theme from the form state along with the API result
      onPollCreated({ ...result.data, theme });
      setNewPollData({ ...result.data, theme });

      setShowSuccessDialog(true);
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } else {
      setError(result.error);
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <ThemeProvider theme={pollThemes[theme]}>
        <Card sx={{ width: '100%', p: 1.75, borderRadius: 1.6 }}>
          <CardContent sx={{
            p: { xs: 0.2, sm: 1.4 },
            pt: { xs: 0, sm: 0.5 },
          }}>
            <Typography
              variant="h6"

              component="h2"
              gutterBottom
              color="primary"
              sx={{
                display: 'flex', alignItems: 'center',
                fontSize: { xs: '1.15rem', sm: '1.25rem' }
              }}
            >
              <HelpOutlineIcon sx={{ mr: 0.75, fontSize: { xs: '1.2rem', sm: '1.4rem' } }} />
              Poll Question
            </Typography>


            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

                <TextField
                  placeholder="What's on your mind?"
                  fullWidth
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />

                <Box>
                  <Typography
                    variant="h6"
                    component="h2"
                    gutterBottom
                    color="primary"
                    sx={{ display: 'flex', alignItems: 'center', fontSize: { xs: '1.15rem', sm: '1.25rem' } }}
                  >
                    <CheckCircleOutlineRoundedIcon sx={{ mr: 0.75, fontSize: { xs: '1.2rem', sm: '1.4rem' } }} />
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
                    disabled={options.length >= 10}
                  >
                    Add Option
                  </Button>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, }}>
                  <FormControl fullWidth>
                    <InputLabel>Voting Duration</InputLabel>
                    <Select
                      value={duration}
                      label="Voting Duration"
                      onChange={(e) => setDuration(e.target.value)}
                      renderValue={(selected) => {
                        const selectedOption = durationOptions.find((o) => o.value === selected);
                        return (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <AccessTimeIcon color="primary" />
                            {selectedOption?.label}
                          </Box>
                        );
                      }}
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          padding: { xs: '12px 14px' },
                        },
                      }}
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
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          padding: { xs: '12px 14px' },
                        },
                      }}
                    >
                      {
                        themeOptions.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value} >
                            <Stack direction="row" alignItems="center" spacing={1.2}>
                              <CircleTwoToneIcon sx={{ color: opt.color }} />
                              <Typography>{opt.label}</Typography>
                            </Stack>
                          </MenuItem>
                        ))
                      }
                    </Select>
                  </FormControl>
                </Box>

                <Stack direction="column" spacing={-1} sx={{ mt: 0, ml: -1.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={allowMultipleChoices}
                        onChange={(e) => setAllowMultipleChoices(e.target.checked)}
                      />
                    }
                    label="Allow multiple choices"
                    sx={{ ml: 0 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={publicResults}
                        onChange={(e) => setPublicResults(e.target.checked)}
                      />
                    }
                    label="Display results publicly"
                    sx={{ ml: 0 }}
                  />
                </Stack>

                <Turnstile
                  ref={turnstileRef}
                  siteKey={import.meta.env.VITE_CLOUDFLARE_SITE_KEY}
                  options={{ size: "flexible", theme: "light" }}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  loading={isSubmitting || !turnstileToken}
                  loadingPosition="start"
                  disabled={isSubmitting || !turnstileToken}
                >
                  {
                    !turnstileToken ? 'Running Captcha...' :
                      isSubmitting ? 'Creating...' :
                        'Create Poll'
                  }
                </Button>
              </Box>
            </form>
          </CardContent>

          <PollSuccessDialog
            open={showSuccessDialog}
            onClose={() => setShowSuccessDialog(false)}
            pollData={newPollData}
          />
        </Card >
      </ThemeProvider >
      <Notification
        open={!!error}
        onClose={() => setError(null)}
        message={error}
        severity="error"
      />
    </>
  );
}

export default PollCreationForm;

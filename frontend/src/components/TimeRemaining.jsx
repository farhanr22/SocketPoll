import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

const calculateTimeLeft = (utcEndDate) => {
  const difference = +new Date(utcEndDate) - +new Date();
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
    };
  }
  return timeLeft;
};

/**
 * Countdown timer text display component.
 * @param {string} activeUntil - The ISO 8601 UTC datetime string for the deadline.
 * @param {string} prefixText - The text to display before the countdown (e.g., "Closes in:").
 * @param {string} closedText - The text to display when the countdown is over. Can be null to render nothing.
 * @param {string} lessThanAMinuteText - The text for when < 1 minute remains.
 */
function TimeRemaining({
  activeUntil,
  prefixText,
  closedText = "The poll has closed",
  lessThanAMinuteText = "Closing in less than a minute"
}) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(activeUntil));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(activeUntil));
    }, 30000); // 30 seconds

    return () => clearInterval(timer);
  }, [activeUntil]);

  const timerComponents = [];
  if (timeLeft.days > 0) timerComponents.push(`${timeLeft.days} day${timeLeft.days > 1 ? 's' : ''}`);
  if (timeLeft.hours > 0) timerComponents.push(`${timeLeft.hours} hour${timeLeft.hours > 1 ? 's' : ''}`);
  if (timeLeft.minutes > 0) timerComponents.push(`${timeLeft.minutes} min${timeLeft.minutes > 1 ? 's' : ''}`);

  // Case 1: Less than a minute remaining
  if (timerComponents.length === 0 && Object.keys(timeLeft).length > 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 0.4 }}>
        {lessThanAMinuteText}
      </Typography>
    );
  }

  // Case 2: Time is still remaining
  if (timerComponents.length > 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 0.4 }}>
        {prefixText} {timerComponents.join(' ')}
      </Typography>
    );
  }

  // Case 3: Time has expired. Render nothing if closedText is null.
  if (!closedText) {
    return null;
  }

  return (
    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 0.4 }}>
      {closedText}
    </Typography>
  );
}

export default TimeRemaining;
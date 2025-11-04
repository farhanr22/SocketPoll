import { Box, Typography, Radio, Checkbox, alpha } from '@mui/material';

function PollOption({ option, isSelected, onChange, disabled, isMultiChoice }) {
    const handleClick = () => {
        if (!disabled) {
            const event = { target: { value: option.id, checked: !isSelected } };
            onChange(event);
        }
    };

    return (
        <Box
            onClick={handleClick}
            sx={{
                p: { xs: 1.1, sm: 1.5 },
                borderRadius: 1,
                border: '2px solid',
                borderColor:
                    isSelected ? 'primary.main' : (theme) => alpha(theme.palette.primary.main, 0.2),
                backgroundColor: (theme) =>
                    isSelected ? alpha(theme.palette.primary.main, 0.07) : 'transparent',
                cursor: disabled ? 'default' : 'pointer',
                transition: 'border-color 0.2s, background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                '&:hover': {
                    // Only apply hover border color if the option is NOT selected
                    borderColor: isSelected
                        ? 'primary.main'
                        : (theme) => alpha(theme.palette.primary.main, 0.4),
                },
            }}
        >
            {isMultiChoice ? (
                <Checkbox
                    checked={isSelected}
                    readOnly
                    sx={{
                        p: 0,
                        color: !isSelected ? (theme) => alpha(theme.palette.primary.main, 0.2) : undefined,
                    }}
                />
            ) : (
                <Radio
                    checked={isSelected}
                    readOnly
                    sx={{
                        p: 0,
                        color: !isSelected ? (theme) => alpha(theme.palette.primary.main, 0.2) : undefined,
                    }}
                />
            )}
            <Typography
                sx={{
                    color: isSelected ? 'primary.main' : 'text.primary',
                }}
            >
                {option.text}
            </Typography>
        </Box>
    );
}

export default PollOption;
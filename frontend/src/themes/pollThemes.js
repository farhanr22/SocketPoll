import { createTheme } from '@mui/material/styles';

export const themeOptions = [
    { value: 'default', label: 'Default', color: '#313947' },
    { value: 'steelblue', label: 'SteelBlue', color: '#3b6182' },
    { value: 'darkred', label: 'DarkRed', color: '#a03939' },
    { value: 'seagreen', label: 'SeaGreen', color: '#407858' },
    { value: 'amber', label: 'Amber', color: '#bd7d33' },
    { value: 'rose', label: 'Rose', color: '#c76d92' },
];

// Helper function to create a new theme object from a given color.
const createPollTheme = (primaryColor, baseTheme) => {
    // Use the base theme's augmentColor helper to create a complete
    // color object (main, light, dark, etc) from the new color
    // Simply replacing primary color wont account for hover state shades, etc
    const newPrimary = baseTheme.palette.augmentColor({
        color: {
            main: primaryColor,
        },
    });

    // Merge the full primary color object into the base theme
    return createTheme(baseTheme, {
        palette: {
            primary: newPrimary,
        },
    });
};

/**
 * Dynamically generate and return a map of named theme objects from the themeOptions array.
 * @param {object} baseTheme - The base MUI theme to use for all variants.
 * @returns {object} An object where keys are theme names (e.g., 'steelblue')
 * and values are the complete theme objects.
 */
export const getPollThemes = (baseTheme) =>
    themeOptions.reduce((acc, theme) => {
        acc[theme.value] = createPollTheme(theme.color, baseTheme);
        return acc;
    }, {});
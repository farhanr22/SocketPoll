import { createTheme } from '@mui/material/styles';

export const themeOptions = [
    { value: 'default', label: 'Default', color: '#303030ff' },
    { value: 'steelblue', label: 'SteelBlue', color: '#3b6182ff' },
    { value: 'darkred', label: 'DarkRed', color: '#a03939ff' },
    { value: 'seagreen', label: 'SeaGreen', color: '#2E8B57' },
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

// Create a dictionary of the actual theme objects.
export const getPollThemes = (baseTheme) => ({
    default: createPollTheme(themeOptions[0].color, baseTheme),
    steelblue: createPollTheme(themeOptions[1].color, baseTheme),
    darkred: createPollTheme(themeOptions[2].color, baseTheme),
    seagreen: createPollTheme(themeOptions[3].color, baseTheme),
});
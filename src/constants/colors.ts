

const colors = {
  light: {
    // Primary
    primary: "#006874",
    onPrimary: "#ffffff",
    primaryContainer: "#9eeffd",
    onPrimaryContainer: "#004f58",

    // Secondary
    secondary: "#4a6267",
    onSecondary: "#ffffff",
    secondaryContainer: "#cde7ec",
    onSecondaryContainer: "#334b4f",

    // Tertiary
    tertiary: "#525e7d",
    onTertiary: "#ffffff",
    tertiaryContainer: "#dae2ff",
    onTertiaryContainer: "#3b4664",

    // Error
    error: "#ba1a1a",
    onError: "#ffffff",
    errorContainer: "#ffdad6",
    onErrorContainer: "#93000a",

    // Neutral — background & surface
    background: "#f5fafb",
    onBackground: "#171d1e",
    surface: "#f5fafb",
    onSurface: "#171d1e",
    surfaceVariant: "#dbe4e6",
    onSurfaceVariant: "#3f484a",

    // Surface container tiers — elevation via tone, not shadow
    surfaceDim: "#d5dbdc",
    surfaceBright: "#f5fafb",
    surfaceContainerLowest: "#ffffff",
    surfaceContainerLow: "#eff5f6",
    surfaceContainer: "#e9eff0",
    surfaceContainerHigh: "#e3e9ea",
    surfaceContainerHighest: "#dee3e5",

    // Outline / borders
    outline: "#6f797a",
    outlineVariant: "#bfc8ca",

    // Overlays
    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#2b3133",
    inverseOnSurface: "#ecf2f3",
    inversePrimary: "#82d3e0",

    // Fixed roles — same value across light/dark, for elements (e.g.
    // segmented buttons, expressive sliders) that must not flip with theme
    fixed: {
      primaryFixed: "#9eeffd",
      primaryFixedDim: "#82d3e0",
      onPrimaryFixed: "#001f24",
      onPrimaryFixedVariant: "#004f58",
      secondaryFixed: "#cde7ec",
      secondaryFixedDim: "#b1cbd0",
      onSecondaryFixed: "#051f23",
      onSecondaryFixedVariant: "#334b4f",
      tertiaryFixed: "#dae2ff",
      tertiaryFixedDim: "#bac6ea",
      onTertiaryFixed: "#0e1b37",
      onTertiaryFixedVariant: "#3b4664",
    },

    // Extended/custom colors — harmonized bright accents (not in export;
    // generated to complement the teal primary)
    accent: {
      teal: {
        color: "#00696a",
        onColor: "#ffffff",
        colorContainer: "#6ff6f8",
        onColorContainer: "#002020",
      },
      green: {
        color: "#006b56",
        onColor: "#ffffff",
        colorContainer: "#7ef8d4",
        onColorContainer: "#002018",
      },
      coral: {
        color: "#8d4e29",
        onColor: "#ffffff",
        colorContainer: "#ffdbca",
        onColorContainer: "#703714",
      },
      amber: {
        color: "#705d0d",
        onColor: "#ffffff",
        colorContainer: "#fce186",
        onColorContainer: "#554500",
      },
      violet: {
        color: "#555a92",
        onColor: "#ffffff",
        colorContainer: "#e0e0ff",
        onColorContainer: "#3d4278",
      },
    },
  },

  dark: {
    primary: "#82d3e0",
    onPrimary: "#00363d",
    primaryContainer: "#004f58",
    onPrimaryContainer: "#9eeffd",

    secondary: "#b1cbd0",
    onSecondary: "#1c3438",
    secondaryContainer: "#334b4f",
    onSecondaryContainer: "#cde7ec",

    tertiary: "#bac6ea",
    onTertiary: "#24304d",
    tertiaryContainer: "#3b4664",
    onTertiaryContainer: "#dae2ff",

    error: "#ffb4ab",
    onError: "#690005",
    errorContainer: "#93000a",
    onErrorContainer: "#ffdad6",

    background: "#0e1415",
    onBackground: "#dee3e5",
    surface: "#0e1415",
    onSurface: "#dee3e5",
    surfaceVariant: "#3f484a",
    onSurfaceVariant: "#bfc8ca",

    surfaceDim: "#0e1415",
    surfaceBright: "#343a3b",
    surfaceContainerLowest: "#090f10",
    surfaceContainerLow: "#171d1e",
    surfaceContainer: "#1b2122",
    surfaceContainerHigh: "#252b2c",
    surfaceContainerHighest: "#303637",

    outline: "#899294",
    outlineVariant: "#3f484a",

    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#dee3e5",
    inverseOnSurface: "#2b3133",
    inversePrimary: "#006874",

    fixed: {
      primaryFixed: "#9eeffd",
      primaryFixedDim: "#82d3e0",
      onPrimaryFixed: "#001f24",
      onPrimaryFixedVariant: "#004f58",
      secondaryFixed: "#cde7ec",
      secondaryFixedDim: "#b1cbd0",
      onSecondaryFixed: "#051f23",
      onSecondaryFixedVariant: "#334b4f",
      tertiaryFixed: "#dae2ff",
      tertiaryFixedDim: "#bac6ea",
      onTertiaryFixed: "#0e1b37",
      onTertiaryFixedVariant: "#3b4664",
    },

    accent: {
      teal: {
        color: "#4cdadb",
        onColor: "#003737",
        colorContainer: "#004f50",
        onColorContainer: "#6ff6f8",
      },
      green: {
        color: "#60dbb9",
        onColor: "#00382b",
        colorContainer: "#005140",
        onColorContainer: "#7ef8d4",
      },
      coral: {
        color: "#ffb68f",
        onColor: "#532201",
        colorContainer: "#703714",
        onColorContainer: "#ffdbca",
      },
      amber: {
        color: "#dec56d",
        onColor: "#3b2f00",
        colorContainer: "#554500",
        onColorContainer: "#fce186",
      },
      violet: {
        color: "#bec2ff",
        onColor: "#272b60",
        colorContainer: "#3d4278",
        onColorContainer: "#e0e0ff",
      },
    },
  },

  radius: 8,
};

export default colors;

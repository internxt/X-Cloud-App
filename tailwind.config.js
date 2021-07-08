module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      width: {
        'sidenav-1280': '187px',
        'activity-1280': '296px'
      },
      padding: {
        '42px': "42px",
        '32px': '32px'
      }
    },
    colors: {
      "black": "#000000",
      "gray": {
        "10": "#f4f4f4",
        "20": "#e0e0e0",
        "30": "#c6c6c6",
        "40": "#a8a8a8",
        "50": "#8d8d8d",
        "60": "#6f6f6f",
        "70": "#525252",
        "80": "#393939",
        "90": "#161616",
        "100": "#161616"
      },
      "blue": {
        "10": "#edf5ff",
        "20": "#d0e2ff",
        "30": "#a6c8ff",
        "40": "#78a9ff",
        "50": "#4589ff",
        "60": "#0f62fe",
        "70": "#0043ce",
        "80": "#002d9c",
        "90": "#001d6c",
        "100": "#001141"
      },
      "white": "#ffffff",
      "red": {
        "10": "#fff1f1",
        "20": "#ffd7d9",
        "30": "#ffb3b8",
        "40": "#ff8389",
        "50": "#fa4d56",
        "60": "#da1e28",
        "70": "#a2191f",
        "80": "#750e13",
        "90": "#520408",
        "100": "#2d0709"
      },
      "orange": {
        "10": "#fff2e8",
        "20": "#ffd9be",
        "30": "#ffb784",
        "40": "#ff832b",
        "50": "#eb6200",
        "60": "#ba4e00",
        "70": "#8a3800",
        "80": "#5e2900",
        "90": "#3e1a00",
        "100": "#231000"
      },
      "green": {
        "10": "#defbe6",
        "20": "#a7f0ba",
        "30": "#6fdc8c",
        "40": "#42be65",
        "50": "#24a148",
        "60": "#198038",
        "70": "#0e6027",
        "80": "#044317",
        "90": "#022d0d",
        "100": "#071908"
      },
      "yellow": {
        "10": "#fcf4d6",
        "20": "#fddc69",
        "30": "#f1c21b",
        "40": "#d2a106",
        "50": "#b28600",
        "60": "#8e6a00",
        "70": "#684e00",
        "80": "#483700",
        "90": "#302400",
        "100": "#1c1500"
      },
      "l-neutral": {
        "10": "#fafbfc",
        "20": "#f4f5f7",
        "30": "#ebecf0",
        "40": "#dfe1e6",
        "50": "#f4f5f7"
      }
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

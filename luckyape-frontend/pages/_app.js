import '../styles/App.css';
import { React } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles';

// import '@fontsource/nanum-gothic-coding/300.css';
// import '@fontsource/nanum-gothic-coding/400.css';
// import '@fontsource/nanum-gothic-coding/500.css';
// import '@fontsource/nanum-gothic-coding/700.css';


const theme = createTheme({

  palette: {
    black: {
      main: "#000000",
    },
    yellowgreen: {
      main: "#BBE311",
      dark: "#BBE311",
    },
    cream: {
      main: "#FFFDD0",
    }
  },
});

function MyApp({ Component, pageProps }) {

  return (
    <>
      <ThemeProvider theme = {theme} >
        <Component {...pageProps} />
      </ThemeProvider>
    </>)
}

export default MyApp

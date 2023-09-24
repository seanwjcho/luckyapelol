import {Button, Container, Box, Typography, TextField} from '@mui/material';
import React, { useState } from 'react';
import { WalletConnect } from "../components/walletConnect"
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    black: {
      main: "#000000"
    },
    yellowgreen: {
      main: "#BBE311",
      dark: "#BBE311"
    }
  },
});

export default function Home() {
  return (
    
    <Container sx = {{
    backgroundColor: '#673e00',
    height: '100vh', 
    padding: '2rem',
    alignItems: 'center',
    justifyContent: 'flex-center',
    margin: '0 !important',
    maxWidth: '100% !important', 
    flexDirection: 'row',
    }}>

  
        <center>
        <Box fontWeight='fontWeightMedium'>
          <Typography color="white" fontSize="60px"> 
            LuckyApe 🍌
          </Typography>
          <WalletConnect />  
        </Box>
        </center>
        <br></br>

        <Box border=  '5px solid #feeb00' borderRadius= '8px' padding= '1rem'>
          <center>
          <Typography color="white" fontSize="30px"> 
              Current Pot: 2500 ApeCoin
          </Typography>
          <Typography color="white" fontSize="30px"> 
              Currently: 36 Apes Aped In
          </Typography>
          <br></br>
          <Box border=  '5px solid #feeb00' borderRadius= '8px' padding= '1rem'>
            <Typography color="white" fontSize="30px"> 
                Time Remaining: 00 hr 36 sec
            </Typography>
          </Box>
          <br></br>
          <Box border=  '5px solid #feeb00' borderRadius= '8px' padding= '1rem'>
            <TextField label="Enter Amt in ApeCoin" focused />
            <br></br>
            <br></br>
            <Button  variant="contained">
              Ape In!
            </Button>
          </Box>
          <br></br>
          </center>
        </Box>
    

    </Container>
  );
}
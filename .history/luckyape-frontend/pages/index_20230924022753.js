import { Button, Container, Box, Typography, TextField } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useState, useEffect } from "react";
import { WalletConnect } from "../components/walletConnect";
import { createTheme } from "@mui/material/styles";
import { ContractABI, M20ABI } from "../components/contractABI.js";
import { ethers } from "ethers";

// create provider variable
let provider;
if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  // we are in the browser and metamask is running
  provider = new ethers.providers.Web3Provider(window.ethereum);
} else {
  // we are on the server *OR* the user is not running metamask
  // https://medium.com/jelly-market/how-to-get-infura-api-key-e7d552dd396f
  provider = new ethers.providers.JsonRpcProvider(
    "https://eth-goerli.g.alchemy.com/v2/<insert alchemy key or use infura http link>"
  );
  // provider = new ethers.providers.Web3Provider(provider);
}

// create smart contract variable wiht inputs: contract address, abi, and signer
const Roulette = new ethers.Contract(
  "0xF59Fd31A737135E3D232f5c3D39B2633AD6Ea0C6",
  ContractABI,
  provider.getSigner()
);

const M20 = new ethers.Contract(
  "0x328507DC29C95c170B56a1b3A758eB7a9E73455c",
  M20ABI,
  provider.getSigner()
);

function convertTimeToMinutesAndSeconds(timeLeft) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return formattedTime;
}

export default function Home() {
  const [numBidders, setNumBidders] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalPot, setTotalPot] = useState(0);
  const [bidders, setBidders] = useState([]);

  useEffect(() => {
    const getTotalPot = async () => {
      const totalPot = await Roulette.connect(provider.getSigner()).totalPot();
      setTotalPot(totalPot/1000000000000000000);
    };
    getTotalPot();
  }, []);

  useEffect(() => {
    const getNumBidders = async () => {
      const numBidders = await Roulette.connect(provider.getSigner()).getApes();
      setNumBidders(numBidders);
    };
    getNumBidders();
  }, []);

  useEffect(() => {
    const getTimeLeft = async () => {
      const timeLeft = await Roulette.connect(provider.getSigner()).getTime();
      setTimeLeft(timeLeft);
    };
    getTimeLeft();
  }, []);

  useEffect(() => {
    const getTimeLeft = async () => {
      const timeLeft = await Roulette.connect(provider.getSigner()).getTime();
      console.log(timeLeft);
      setTimeLeft(timeLeft);
    };
    getTimeLeft();
  }, []);

  useEffect(() => {
    const getLeaderboard = async () => {
      const nums = await Roulette.connect(provider.getSigner()).getApes();
      const bidders = await Promise.all(
        Array.from({ length: nums }, (_, i) =>
          Roulette.connect(provider.getSigner()).getBidderAtIndex(i)
        )
      );
      console.log(bidders);
      const bidderBids = await Promise.all(
        bidders.map(async (bidder) => {
            const bid = await Roulette.connect(provider.getSigner()).getBidFromBidder(bidder);
            return { address: bidder, bid: bid.toString() };
        })
      );
      console.log(bidderBids);
    };
    getLeaderboard();
  }, []);

  const [amount, setAmount] = useState(0);

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleButtonClick = async () => {
    // Access the amount value here
    try {
      const convert = ethers.utils.parseUnits(amount, "ether");

      const tx = await Roulette.connect(provider.getSigner()).submitBid(convert);
      
      var popup = alert("Succesfully sent " + amount + " ApeCoin to the pot!");
    } catch (error) {
      console.log(error);
      var popup = alert(
        "Error: caused by either invalid input, insufficient balance, or wrong network!"
      );
    }
  };

  const handleButtonClickApprove = async () => {
    // Access the amount value here
    try {
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      const balance = await M20.balanceOf(signerAddress);

      const tx = await M20.approve(Roulette.address, balance);
      
      var popup = alert("approved!");
    } catch (error) {
      console.log(error);
      var popup = alert(
        "Error: caused by either invalid input, insufficient balance, or wrong network!"
      );
    }
  };

  const getLeaderboard = async () => {
    try {
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      const balance = await M20.balanceOf(signerAddress);

      const tx = await M20.approve(Roulette.address, balance);
      
      var popup = alert("approved!");
    } catch (error) {
      console.log(error);
      var popup = alert(
        "Error: caused by either invalid input, insufficient balance, or wrong network!"
      );
    }

  };

  return (
    <Container
      sx={{
        height: "100vh",
        alignItems: "center",
        justifyContent: "flex-center",
        paddingTop: 2,
        maxWidth: "100% !important",
        flexDirection: "row",
      }}
      maxWidth="md"
    >
      <Grid container spacing={2}>
        <Grid xs={2}>
          <Typography color="white" fontSize="20px">
            LuckyApe 🍌
          </Typography>
        </Grid>
        <Grid xs />
        <Grid
          xs={2}
          justifyItems="right"
          display="flex"
          justifyContent="flex-end"
          alignItems="flex-end"
        >
          <WalletConnect />
        </Grid>
      </Grid>
      <br></br>
      <Container maxWidth="sm">
        <Typography color="white" fontSize="60px" align="center">
        time left: {convertTimeToMinutesAndSeconds(timeLeft).toString()}
        </Typography>
      </Container>

      {/* <Typography color="white" fontSize="30px">
            Current Pot: 2500 ApeCoin
          </Typography>
          <Typography color="white" fontSize="30px">
            Currently: 36 Apes Aped In
          </Typography> */}
      <br></br>
      <br></br>
      <Box borderRadius="8px" padding="1rem">
        <Container align="center">
        <TextField
          label=""
          onChange={handleAmountChange}
          color="cream"
          sx={{
            fieldset: {
              borderColor: "#ffffff",
              ":hover": { borderColor: "#ffffff" },
            },
            input: { color: "#ffffff" },
            label: { color: "#ffffff" },
          }}
        />
        
        
        <br />
        <br />
        <Button variant="contained" color="cream" onClick={handleButtonClickApprove}>
          Approve
        </Button>
        <br />
        <br />
        <Button variant="contained" color="cream" onClick={handleButtonClick}>
          Ape In!
        </Button>
        <br />
        <br />
        </Container>

        <Typography color="white" fontSize="20px" align="center">
          number of bidders: {numBidders.toString()}
        </Typography>

        <Typography color="white" fontSize="20px" align="center">
          total pot: {totalPot.toString()} M20
        </Typography>
    
      </Box>
      <br></br>
    </Container>
  );
}

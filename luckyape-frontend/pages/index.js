import {
  Button,
  Card,
  Container,
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useState, useEffect } from "react";
import { WalletConnect } from "../components/walletConnect";
import { createTheme } from "@mui/material/styles";
import { ContractABI, M20ABI } from "../components/contractABI.js";
import { ethers } from "ethers";
import Image from "next/future/image";
// import Ape from "../components/ape"
import ape from "../public/apecoin.svg";

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
  "0x914a2C35035C8AF9fc1aD81C1935F07C211f5A41",
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

  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return formattedTime;
}

export default function Home() {
  const [numBidders, setNumBidders] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalPot, setTotalPot] = useState(0);
  const [lastPayOut, setLastPayOut] = useState(0);
  const [lastWinner, setLastWinner] = useState(0);
  const [bids, setBids] = useState([]);

  useEffect(() => {
    const getTotalPot = async () => {
      const totalPot = await Roulette.connect(provider.getSigner()).totalPot();
      setTotalPot(totalPot / 1000000000000000000);
    };
    getTotalPot();
  }, []);

  useEffect(() => {
    const getLastPayout = async () => {
      const lastPayOut = await Roulette.connect(
        provider.getSigner()
      ).lastPayOut();
      setLastPayOut(lastPayOut);
    };
    getLastPayout();
  }, []);

  useEffect(() => {
    const getLastWinner = async () => {
      const lastWinner = await Roulette.connect(
        provider.getSigner()
      ).lastWinner();
      setLastWinner(lastWinner);
    };
    getLastWinner();
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
          const bid = await Roulette.connect(
            provider.getSigner()
          ).getBidFromBidder(bidder);
          return {
            address: bidder,
            bid: (bid / 10 ** 18).toString() + " ApeCoin",
          };
        })
      );
      console.log(bidderBids);
      setBids(bidderBids);
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

      const tx = await Roulette.connect(provider.getSigner()).submitBid(
        convert
      );

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

  const handleButtonClickNew = async () => {
    // Access the amount value here
    try {
      const tx = await Roulette.connect(provider.getSigner()).startGame();

      var popup = alert("A new game has been started!");
    } catch (error) {
      console.log(error);
      var popup = alert(
        "Error: caused by either invalid input, insufficient balance, or wrong network!"
      );
    }
  };

  const handleButtonClickEnd = async () => {
    // Access the amount value here
    try {
      const tx = await Roulette.connect(provider.getSigner()).endGame();

      var popup = alert("Game has been ended");
    } catch (error) {
      console.log(error);
      var popup = alert(
        "Error: caused by either invalid input, insufficient balance, or wrong network!"
      );
    }
  };

  const handleButtonClickReset = async () => {
    // Access the amount value here
    try {
      const tx = await Roulette.connect(provider.getSigner()).reset();

      var popup = alert("Game has been reset");
    } catch (error) {
      console.log(error);
      var popup = alert(
        "Error: caused by either invalid input, insufficient balance, or wrong network!"
      );
    }
  };

  return (
    <>
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
        <Box borderRadius="8px" padding="1rem">
          <Container align="center">
            <TextField
              label="Max bet: 1000"
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
            <Box display="flex" justifyContent="center" gap={1}>

            <Button
              variant="contained"
              color="cream"
              onClick={handleButtonClickNew}
            >
              Start New Game
            </Button>
            <br />
            <br />
            <Button
              variant="contained"
              color="cream"
              onClick={handleButtonClickApprove}
            >
              Approve ApeCoin Spending
            </Button>
            <br />
            <br />
            <Button
              variant="contained"
              color="cream"
              onClick={handleButtonClick}
            >
              Ape In!
            </Button>
            <br />
            <br />
            <Button
              variant="contained"
              color="cream"
              onClick={handleButtonClickEnd}
            >
              END GAME
            </Button>
            <br />
            <br />
            <Button
              variant="contained"
              color="cream"
              onClick={handleButtonClickReset}
            >
              RESET
            </Button>
            </Box>
            <br />
            <br />
          </Container>

          <Typography color="white" fontSize="20px" align="center">
            number of bidders: {numBidders.toString()}
          </Typography>

          <Typography color="white" fontSize="20px" align="center">
            total pot: {totalPot.toString()} ApeCoin
          </Typography>

          <Typography color="white" fontSize="20px" align="center">
            last payout: {(lastPayOut / 1000000000000000000).toString()} ApeCoin
            to {lastWinner.toString()}
          </Typography>

          <Typography color="white" fontSize="20px" align="center">
              goerli contract address: &nbsp;
              <Link
              href="https://goerli.etherscan.io/address/0x914a2C35035C8AF9fc1aD81C1935F07C211f5A41"
              target="_blank"
              rel="noopener noreferrer"
            >
              0x914a2C35035C8AF9fc1aD81C1935F07C211f5A41
            </Link>
            </Typography>
        </Box>
        <br></br>
        <div>
          <TableContainer
            component={Card}
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Address</TableCell>
                  <TableCell>Bid</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bids.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell style={{ color: "cream" }}>
                      {item.address}
                    </TableCell>
                    <TableCell style={{ color: "cream" }}>{item.bid}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <br></br>
          <br></br>

           
            
        </div>
      </Container>
      <div style={{ position: "absolute", top: 100, right: 800 }}>
        <Image
          src={ape}
          width={800}
          height={800}
          layout="raw"
          style={{ position: "absolute!important", opacity: 0.1 }}
        />
      </div>
    </>
  );
}

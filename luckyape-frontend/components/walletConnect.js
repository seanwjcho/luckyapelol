import { ethers, BigNumber } from "ethers";
import { useEffect, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import {Button, Container, Box, Typography, TextField} from '@mui/material';

import { theme } from "../pages/index";


export function WalletConnect() {
  // getting whether user is authenticated
  const [authenticated, setAuthenticated] = useState(false);

  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("");

  // getting wallet balance
  const getBalance = async () => {
    const [account] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(account);
    setBalance(ethers.utils.formatEther(balance));
  };

  // talking with metamask to get the accounts with wallet connection
  async function requestAccount() {
    console.log("Requesting account...");

    // check if MetaMask is installed
    if (window.ethereum) {
      console.log("detected metamask");

      // update wallet address and balance
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log(accounts);

        setWalletAddress(accounts[0]);
        getBalance();

        if (accounts.length > 0) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }

        console.log("auth detected", authenticated);
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("no metamask detected");
    }
  }

  // connecting wallet to app after requestAccount() is complete
  async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
    }
  }

  if (authenticated) {
    return (<div>hey</div>);
  }
  // Top Navigation Bar Element
  return (
     <Button
          variant="outlined"
          color="cream"
          onClick={() => connectWallet()}
    >
    Connect
  </Button>
  )
}

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import axiosRetry from "axios-retry";
import { NextApiRequest, NextApiResponse } from "next";
import { RawData } from "../../data/helius/types";
import { parsedDiceDuelData } from "../../helpers/backend/parsedDiceDuelData";
import { getEnrichedTransactions } from "../../helpers/backend/getEnrichedTransactions";
import fetchLinkedNftsInWallet from "../../helpers/backend/fetchLinkedNftsInWallet";
import { PublicKey } from "@solana/web3.js";
import addOrUpdateDataInLinkedNft from "../../helpers/backend/addOrUpdateDataInLinkedNft";
import fetchDataFromLinkedNft from "../../helpers/backend/fetchDataFromLinkedNft";
import { db } from "../../intializeDb";
import { doc, getDoc, setDoc } from "firebase/firestore";

const apiURL = "https://api.helius.xyz/v0/addresses";
const resource = "transactions";
const options = `?api-key=${process.env.HELIUS_API_KEY}`;

axiosRetry(axios, {
  retries: 3, // number of retries
  retryDelay: (retryCount) => {
    console.log(`retry attempt: ${retryCount}`);
    return retryCount * 2000; // time interval between retries
  },
  retryCondition: (error) => {
    // if retry condition is not specified, by default idempotent requests are retried
    return error.response!.status === 429;
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "POST") {
    let body = req.body as [RawData];
    console.log(body);
    body.forEach((data) => {
      let result = parsedDiceDuelData(data);
      if (
        result.state == "Game Completed!" &&
        result.escrowAccount.length == 2
      ) {
        const winner = result.feePayer;
        result.escrowAccount.forEach(async (account) => {
          const url = `${apiURL}/${account}/${resource}${options}`;
          const transactions = await getEnrichedTransactions(url); // get fee payer from the escrow account
          if (transactions != undefined && transactions.length > 0) {
            const loser = transactions[0].feePayer;
            if (loser != undefined && loser != winner) {
              await updateResultToMainLinkedNFTInWallet(
                loser,
                -(result.feeCollected + result.winnings)
              );
              await updateResultToMainLinkedNFTInWallet(
                winner,
                result.winnings
              );
            }
          }
        });
      }
    });
    res.status(200).send("Success");
  } else if (req.method == "GET") {
    res.status(200).send("API ENDPOINT");
  }
}

async function updateResultToMainLinkedNFTInWallet(
  wallet: string,
  winnings: number
) {
  const walletLinkedNfts = await fetchLinkedNftsInWallet(new PublicKey(wallet));
  console.log(walletLinkedNfts);
  if (walletLinkedNfts != undefined && walletLinkedNfts.length > 0) {
    //fetch data in the first linkedNFT
    const mainNFT = walletLinkedNfts[0];
    const result = await fetchDataFromLinkedNft(mainNFT);
    const name = "Dice Duel";
    const url = `https://firestore.googleapis.com/v1/projects/${
      process.env.FIREBASE_PROJECT_ID
    }/databases/(default)/documents/mint/${mainNFT.toString()}`;
    const filteredResult = result.filter((data) => {
      data.name == name && data.url == url;
    });
    console.log(filteredResult);
    //main nft does not contain the same metadata
    if (filteredResult.length == 0) {
      const ix = await addOrUpdateDataInLinkedNft(name, url, mainNFT);
      console.log(ix);
    } else {
      //just update the centralised db instead
      const docRef = doc(db, "mint", mainNFT.toString());
      const docSnap = await getDoc(docRef);
      let currentWinnings = winnings;
      let currentGamesPlayed = 1;
      if (docSnap.exists()) {
        currentWinnings = docSnap.data().winnings + currentWinnings;
        currentGamesPlayed = docSnap.data().gamesPlayed + currentGamesPlayed;
      }
      await setDoc(docRef, {
        mint: mainNFT.toString(),
        winnings: currentWinnings,
        gamesPlayed: currentGamesPlayed,
      });
    }
  }
}

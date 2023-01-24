import axios from "axios";
import { RawData } from "../../data/helius/types";

export async function getEnrichedTransactions(url: string): Promise<[RawData]> {
  let transactions = [];
  try {
    const response = await axios.get(url, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
    transactions = response.data;
  } catch (err) {
    console.log(err);
  }
  return transactions;
}

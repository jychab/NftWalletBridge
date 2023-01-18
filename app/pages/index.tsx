import styles from "../styles/Home.module.css";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { MetaplexProvider } from "./MetaplexProvider";
import "@solana/wallet-adapter-react-ui/styles.css";
import dynamic from "next/dynamic";
import NFTButton from "./components/NFTButton";

require("@solana/wallet-adapter-react-ui/styles.css");

export default function Home() {
  const WalletMultiButtonDynamic = dynamic(
    async () =>
      (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
  );
  return (
    <div className={styles.main}>
      <ConnectionProvider endpoint={clusterApiUrl(WalletAdapterNetwork.Devnet)}>
        <WalletProvider wallets={[new PhantomWalletAdapter()]}>
          <WalletModalProvider>
            <MetaplexProvider>
              <div className={styles.container}>
                <NFTButton />
                <WalletMultiButtonDynamic />
              </div>
            </MetaplexProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}

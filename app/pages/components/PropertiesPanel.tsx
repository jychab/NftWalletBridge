import { useState, useEffect } from "react";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import { Connection, PublicKey } from "@solana/web3.js";
import removeLinkedNftFromWallet from "../../helpers/removeLinkedNftFromWallet";
import PropertiesDropDownBox from "./PropertiesDropDownBox";
import fetchDataFromLinkedNft from "../../helpers/fetchDataFromLinkedNft";
import SetNftDataPanel from "./SetNftDataPanel";

export default function PropertiesPanel(props: {
  setPropertiesProps: (
    arg0: { url: string; name: string; address: PublicKey } | null
  ) => void;
  propertiesProps: { url: string; name: string; address: PublicKey };
  wallet: AnchorWallet;
  connection: Connection;
  setFetching: (arg0: boolean) => void;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [nftData, setNFTData] = useState<Array<{ name: string; url: string }>>(
    []
  );
  const [currentProperties, setCurrentProperties] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (loading && props.wallet) {
      fetchDataFromLinkedNft(
        props.propertiesProps.address,
        props.wallet,
        props.connection,
        setNFTData
      );
      setLoading(false);
    }
  }, [loading]);
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-row justify-between">
        <button
          className="text-black"
          onClick={() => {
            props.setPropertiesProps(null);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="black"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
            />
          </svg>
        </button>
        <PropertiesDropDownBox
          data={nftData}
          wallet={props.wallet}
          connection={props.connection}
          callback={setCurrentProperties}
        />
        <button
          className="flex flex-row text-black items-center space-x-1"
          onClick={async () => {
            const tx = await removeLinkedNftFromWallet(
              props.propertiesProps.address,
              props.wallet,
              props.connection
            );
            if (tx != null) {
              console.log("Confirmed Transaction Id:", tx);
              props.setFetching(true);
              props.setPropertiesProps(null);
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={"2"}
            stroke="red"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </button>
      </div>
      <div className="md:flex flex-row space-x-4">
        <div className="flex flex-col md:w-1/3">
          {props.propertiesProps && (
            <>
              <Image
                height={100}
                width={100}
                src={props.propertiesProps.url}
                alt={props.propertiesProps.name}
                className="inset-0 h-full w-full object-contain object-center rounded hover:opacity-100"
              />
              <div className="text-center text-black">
                {props.propertiesProps.name}
              </div>
            </>
          )}
        </div>
        {currentProperties != null ? (
          <div className="md:w-2/3 text-black text-xs whitespace-normal break-all">
            {currentProperties}
          </div>
        ) : (
          <SetNftDataPanel
            propertiesProps={props.propertiesProps}
            wallet={props.wallet}
            connection={props.connection}
            callback={setLoading}
          />
        )}
      </div>
    </div>
  );
}

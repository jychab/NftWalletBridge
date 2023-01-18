import { useState } from "react";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import addOrUpdateDataInLinkedNft from "../../helpers/addOrUpdateDataInLinkedNft";

export default function SetNftDataPanel(props: {
  propertiesProps: { url: string; name: string; address: PublicKey };
  wallet: AnchorWallet;
  connection: Connection;
  callback: (arg0: boolean) => void;
}) {
  const [name, setName] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  return (
    <div className="w-full max-w-xs">
      <div className="md:flex md:items-center mb-6">
        <div className="md:w-1/3">
          <label
            className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            htmlFor="first"
          >
            Name:
          </label>
        </div>
        <div className="md:w-2/3">
          <input
            className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
            type="text"
            id="first"
            name="first"
            value={name}
            required
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
        </div>
      </div>
      <div className="md:flex md:items-center mb-6">
        <div className="md:w-1/3">
          <label
            className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            htmlFor="last"
          >
            URL:
          </label>
        </div>
        <div className="md:w-2/3">
          <input
            className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
            type="text"
            id="url"
            name="url"
            value={url}
            required
            onChange={(event) => {
              setUrl(event.target.value);
            }}
          />
        </div>
      </div>
      <div className="md:flex md:items-center">
        <div className="md:w-1/3"></div>
        <div className="md:w-2/3">
          <button
            className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
            type="submit"
            onClick={async () => {
              const tx = await addOrUpdateDataInLinkedNft(
                name,
                url,
                props.wallet,
                props.connection,
                props.propertiesProps.address
              );
              if (tx) {
                console.log("Data is linked to nft:", tx);
                props.callback(true);
              }
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

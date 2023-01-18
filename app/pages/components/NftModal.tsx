import { useRef, useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Nft } from "@metaplex-foundation/js";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import useMetaplex from "../../useMetaplex";
import fetchLinkedNftsInWallet from "../../helpers/fetchLinkedNftsInWallet";
import NFTItem from "./NFTItem";
import PlaceHolder from "./PlaceHolder";
import fetchAllNftsInWallet from "../../helpers/fetchAllNftsInWallet";
import PropertiesPanel from "./PropertiesPanel";
import NFTItemMain from "./NFTItemMain";

interface ModalProps {
  open: boolean;
  setOpen: (arg0: boolean) => void;
}

export default function NftModal({
  open = false,
  setOpen,
}: ModalProps): JSX.Element {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { metaplex } = useMetaplex();
  const [nfts, setNfts] = useState<Array<Nft | null>>([]);
  const [nftsInWallet, setNftsInWallet] = useState<Array<Nft>>([]);
  const [fetching, setFetching] = useState<boolean>(true);
  const [propertiesProps, setPropertiesProps] = useState<{
    url: string;
    name: string;
    address: PublicKey;
  } | null>(null);
  useEffect(() => {
    if (open && wallet && fetching) {
      fetchLinkedNftsInWallet(setNfts, wallet, connection, metaplex);
      fetchAllNftsInWallet(setNftsInWallet, metaplex);
      setFetching(false);
    }
  }, [open, fetching]);

  const cancelButtonRef = useRef(null);
  return (
    <Dialog
      as="div"
      className="relative z-9"
      initialFocus={cancelButtonRef}
      open={open}
      onClose={() => setOpen(false)}
    >
      <div className="fixed inset-0 z-9 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <Dialog.Panel className="relative transform overflow-visible rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="rounded bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              {propertiesProps != null && wallet != null ? (
                <PropertiesPanel
                  setPropertiesProps={setPropertiesProps}
                  propertiesProps={propertiesProps}
                  wallet={wallet}
                  connection={connection}
                  setFetching={setFetching}
                />
              ) : (
                <>
                  <button
                    key={"create-nft-btn"}
                    className="container bg-black py-2 my-2"
                    onClick={async () => {
                      const tx = await (metaplex as any).nfts().create({
                        uri: "https://bafybeih6iktwyxklbuqsbxpvuxq7okhh3zkmvkdza2fbxug4hpfepz42cu.ipfs.nftstorage.link/11523.json",
                        name: "Bonk NFT",
                        sellerFeeBasisPoints: 500, // Represents 5.00%.
                      });
                      if (tx != null) {
                        setFetching(true);
                      }
                    }}
                  >
                    Create NFT
                  </button>
                  <div className="grid grid-cols-2 grid-rows-5 gap-4">
                    {nfts.map((value, index) => {
                      return index == 0 ? (
                        <div
                          className="row-span-5 self-center"
                          key={`grid-pos-${index}`}
                        >
                          {value != null &&
                          value.json != null &&
                          value.json.image ? (
                            <NFTItemMain
                              index={index}
                              image={value.json.image}
                              name={value.name}
                              onClick={() => {
                                if (value.json != null && value.json.image) {
                                  setPropertiesProps({
                                    url: value.json.image,
                                    name: value.name,
                                    address: value.address,
                                  });
                                }
                              }}
                            />
                          ) : (
                            <PlaceHolder
                              nftsInWallet={nftsInWallet}
                              wallet={wallet}
                              connection={connection}
                              callback={setFetching}
                            />
                          )}
                        </div>
                      ) : (
                        <div key={`grid-pos-${index}`}>
                          {value != null && value.json?.image ? (
                            <NFTItem
                              index={index}
                              image={value.json.image}
                              name={value.name}
                              onClick={async () => {
                                if (value.json != null && value.json.image) {
                                  setPropertiesProps({
                                    url: value.json.image,
                                    name: value.name,
                                    address: value.address,
                                  });
                                }
                              }}
                            />
                          ) : (
                            <PlaceHolder
                              nftsInWallet={nftsInWallet}
                              wallet={wallet}
                              connection={connection}
                              callback={setFetching}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}

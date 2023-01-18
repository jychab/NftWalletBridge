import Image from "next/image";
import React from "react";

function NFTItemMain(props: {
  index: number;
  image: string;
  name: string;
  onClick: () => void;
}) {
  return (
    <button
      key={`item-button ${props.index}`}
      className="container flex gap-5 items-center bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white mx-auto px-4 py-2 border border-blue-500 hover:border-transparent rounded"
      onClick={props.onClick}
    >
      <div className="rounded">
        <Image
          key={`item-image ${props.index}`}
          height={80}
          width={80}
          src={props.image}
          alt={props.name}
          className="inset-0 object-contain object-center rounded hover:opacity-100"
        />
      </div>
      <div key={`item-label ${props.index}`}>{props.name}</div>
    </button>
  );
}

export default NFTItemMain;

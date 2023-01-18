import Image from "next/image";
import React from "react";

function NFTItem(props: {
  index: number;
  image: string;
  name: string;
  onClick: () => void;
}) {
  return (
    <button
      key={`item-button ${props.index}`}
      className="container flex items-center gap-5 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white mx-auto px-4 py-2 border border-blue-500 hover:border-transparent rounded"
      onClick={props.onClick}
    >
      <div className="rounded">
        <Image
          key={`item-image ${props.index}`}
          height={40}
          width={40}
          src={props.image}
          alt={props.name}
          className="inset-0 object-contain object-center rounded hover:opacity-100"
        />
      </div>
      <div className="text-center" key={`item-label ${props.index}`}>
        {props.name}
      </div>
    </button>
  );
}

export default NFTItem;

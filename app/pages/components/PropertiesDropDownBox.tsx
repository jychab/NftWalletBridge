import React from "react";
import { useEffect } from "react";
import { type Connection } from "@solana/web3.js";

export default function PropertiesDropDownBox(props: {
  data: Array<{ name: string; url: string }>;
  wallet: any;
  connection: Connection;
  callback: (arg0: string) => void;
}) {
  useEffect(() => {
    if (props.data.length > 0) {
      fetchJSONData(props.data[0].url);
    }
  }, [props.data]);
  async function fetchJSONData(currentProperties: string) {
    try {
      const response = await fetch(currentProperties);
      const jsonData = await response.json();
      props.callback(JSON.stringify(jsonData));
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <div>
      <div className="inline-block relative w-64">
        <select
          onChange={(event) => {
            fetchJSONData(event.target.value);
          }}
          placeholder={"No data added yet!"}
          className="block appearance-none w-full text-black bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
        >
          {props.data &&
            props.data.map((value) => {
              return (
                <option key={value.name} value={value.url}>
                  {value.name}
                </option>
              );
            })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

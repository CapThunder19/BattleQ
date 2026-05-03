"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";

const BTQ_ABI = [
  "function buy() external payable",
  "function rate() view returns (uint256)",
  "function decimals() view returns (uint8)",
];

export function BuyBTQ() {
  const [btqAmount, setBtqAmount] = useState<number>(10);
  const [status, setStatus] = useState<string | null>(null);

  const contractAddress = process.env.NEXT_PUBLIC_BTQ_ADDRESS || "";
  const nativePerBTQ = Number(process.env.NEXT_PUBLIC_BTQ_RATE_NATIVE_PER_BTQ || 0.001); // default 0.001 native = 1 BTQ

  // compute native value required (in ETH-like units): native = btqAmount * nativePerBTQ
  const requiredNative = (btqAmount || 0) * nativePerBTQ;
  const valueHex = ethers.utils.parseEther(requiredNative.toString()).toString();

  const { config } = usePrepareContractWrite({
    address: contractAddress as any,
    abi: BTQ_ABI,
    functionName: "buy",
    overrides: { value: valueHex },
    enabled: Boolean(contractAddress) && btqAmount > 0,
  });

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({ hash: data?.hash });

  return (
    <div className="p-4 border border-white/10 bg-black/40 rounded-md">
      <h3 className="text-sm font-black uppercase">Buy BTQ</h3>
      <p className="text-xs text-white/60">Rate: 1 BTQ = {nativePerBTQ} native</p>

      <div className="mt-3 flex gap-2">
        <input
          type="number"
          min={1}
          value={btqAmount}
          onChange={(e) => setBtqAmount(Number(e.target.value))}
          className="bg-transparent border border-white/10 px-3 py-2 w-28"
        />
        <button
          className="px-3 py-2 bg-primary text-black font-bold"
          onClick={() => {
            if (!write) {
              setStatus("Wallet not connected or contract not configured.");
              return;
            }
            setStatus("Sending transaction...");
            try {
              write();
            } catch (err: any) {
              setStatus(err?.message || String(err));
            }
          }}
        >
          Buy
        </button>
      </div>

      <p className="text-xs text-white/60 mt-2">Will send ~{requiredNative} native</p>

      {isLoading && <p className="text-xs text-white/80 mt-2">Waiting for confirmation...</p>}
      {isSuccess && <p className="text-xs text-emerald-300 mt-2">Purchase successful!</p>}
      {status && <p className="text-xs text-red-400 mt-2">{status}</p>}
    </div>
  );
}

export default BuyBTQ;

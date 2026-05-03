"use client";

import React, { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";

const BTQ_ABI = [
  "function withdraw() external",
];

export function WithdrawBTQ() {
  const [status, setStatus] = useState<string | null>(null);
  const contractAddress = process.env.NEXT_PUBLIC_BTQ_ADDRESS || "";

  const { writeContract, isPending, data: hash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleWithdraw = () => {
    if (!contractAddress) {
      setStatus("Contract not configured.");
      return;
    }
    setStatus("Confirming transaction...");
    try {
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: BTQ_ABI,
        functionName: "withdraw",
      });
    } catch (err: any) {
      setStatus(err?.message || String(err));
    }
  };

  return (
    <div className="p-4 border border-white/10 bg-black/40 rounded-md mt-3">
      <h3 className="text-sm font-black uppercase">Withdraw BTQ</h3>
      <p className="text-xs text-white/60">Withdraw BTQ back to native testnet currency.</p>

      <div className="mt-3 flex gap-2">
        <button
          className="px-3 py-2 bg-primary text-black font-bold disabled:opacity-50"
          onClick={handleWithdraw}
          disabled={isLoading || isPending}
        >
          {isLoading || isPending ? "Processing..." : "Withdraw"}
        </button>
      </div>

      {(isLoading || isPending) && <p className="text-xs text-white/80 mt-2">Waiting for confirmation...</p>}
      {isSuccess && <p className="text-xs text-emerald-300 mt-2">Withdraw successful!</p>}
      {status && <p className="text-xs text-red-400 mt-2">{status}</p>}
    </div>
  );
}

export default WithdrawBTQ;

"use client";

import React, { useState, useEffect } from "react";
import { parseEther, formatEther, BrowserProvider, Contract } from "ethers";
import { useAccount, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Wallet, LogOut, Send, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BTQ_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function buy() external payable",
  "function withdraw() external",
  "function rate() view returns (uint256)",
];

export function WalletPanel() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [buyAmount, setBuyAmount] = useState<number>(10);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [buyStatus, setBuyStatus] = useState<string | null>(null);
  const [withdrawStatus, setWithdrawStatus] = useState<string | null>(null);

  const contractAddress = process.env.NEXT_PUBLIC_BTQ_ADDRESS || "";
  const nativePerBTQ = Number(process.env.NEXT_PUBLIC_BTQ_RATE_NATIVE_PER_BTQ || 0.001);
  const expectedChainId = Number(process.env.NEXT_PUBLIC_ROBINHOOD_CHAIN_ID || 0);
  const [currentChainId, setCurrentChainId] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Read chain id from injected provider (MetaMask / WalletConnect) if available
    const readChain = async () => {
      try {
        const provider = (window as any).ethereum;
        if (provider && provider.request) {
          const hex = await provider.request({ method: "eth_chainId" });
          const id = typeof hex === "string" ? parseInt(hex, 16) : Number(hex);
          setCurrentChainId(Number(id));
        }
      } catch (e) {
        // ignore
      }
    };

    readChain();

    const handleChainChanged = (hex: string) => {
      try {
        setCurrentChainId(parseInt(hex, 16));
      } catch (e) {
        setCurrentChainId(null);
      }
    };

    const provider = (window as any).ethereum;
    if (provider && provider.on) provider.on("chainChanged", handleChainChanged);
    return () => { if (provider && provider.removeListener) provider.removeListener("chainChanged", handleChainChanged); };
  }, []);

  // Read BTQ balance
  const { data: balanceRaw } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: BTQ_ABI,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: isConnected && !!contractAddress && !!address },
  });

  const btqBalance = balanceRaw ? Number(formatEther(balanceRaw as any)) : 0;
  const requiredNative = (buyAmount || 0) * nativePerBTQ;

  // Single writeContract hook for both operations
  const { writeContract, isPending } = useWriteContract();
  const [txHash, setTxHash] = React.useState<string | undefined>(undefined);
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Track which operation is in progress
  const [operation, setOperation] = useState<"buy" | "withdraw" | null>(null);

  // Update statuses based on operation
  useEffect(() => {
    if (isPending || isTxLoading) {
      if (operation === "buy") {
        setBuyStatus("Transaction pending...");
      } else if (operation === "withdraw") {
        setWithdrawStatus("Transaction pending...");
      }
    }
    if (isTxSuccess) {
      if (operation === "buy") {
        setBuyStatus("✓ Purchase successful!");
        setTimeout(() => { setShowBuyModal(false); setBuyStatus(null); }, 1500);
      } else if (operation === "withdraw") {
        setWithdrawStatus("✓ Withdraw successful!");
        setTimeout(() => { setShowWithdrawModal(false); setWithdrawStatus(null); }, 1500);
      }
      setOperation(null);
    }
  }, [isPending, isTxLoading, isTxSuccess, operation]);

  const handleBuy = async () => {
    if (!contractAddress) {
      setBuyStatus("Contract address not configured.");
      return;
    }
    if (!buyAmount || buyAmount <= 0) {
      setBuyStatus("Please enter a valid amount.");
      return;
    }
    if (expectedChainId && currentChainId && currentChainId !== expectedChainId) {
      setBuyStatus(`Switch wallet to chain ${expectedChainId} (current: ${currentChainId}).`);
      return;
    }
    
    try {
      const valueWei = parseEther(requiredNative.toString());
      // Verify contract code exists at address on current chain to avoid calling non-contract
      try {
        const providerRaw = (window as any).ethereum;
        if (providerRaw) {
          const bpCheck = new BrowserProvider(providerRaw);
          const code = await bpCheck.getCode(contractAddress as `0x${string}`);
          if (!code || code === "0x" || code === "0x0") {
            setBuyStatus("No contract found at NEXT_PUBLIC_BTQ_ADDRESS on the connected chain. Deploy contract and update .env.");
            setOperation(null);
            return;
          }
        }
      } catch (codeErr) {
        console.warn("Failed to verify contract code:", codeErr);
      }
      setBuyStatus("Sending transaction...");
      setOperation("buy");

      const tx = await writeContract({
        address: contractAddress as `0x${string}`,
        abi: BTQ_ABI,
        functionName: "buy",
        value: valueWei as any,
      } as any);

      // writeContract may return the transaction response when awaited
      if (tx && (tx as any).hash) {
        setTxHash((tx as any).hash);
        setBuyStatus(`Transaction sent: ${(tx as any).hash}`);
        console.log("buy tx:", tx);
      } else {
        console.log("writeContract returned (no hash):", tx);
        // fallback to signer-based send to obtain a tx hash
        try {
          const provider = (window as any).ethereum;
          if (provider) {
            const bp = new BrowserProvider(provider);
            const signer2 = await bp.getSigner();
            const contractWithSigner = new Contract(contractAddress as `0x${string}`, BTQ_ABI, signer2);
            const tx2 = await contractWithSigner.buy({ value: valueWei as any });
            setTxHash(tx2.hash);
            setBuyStatus(`Transaction sent via signer: ${tx2.hash}`);
            console.log("buy tx (signer):", tx2);
          } else {
            setBuyStatus("Transaction submitted (no hash returned) and no injected provider available for fallback.");
          }
        } catch (err2) {
          console.error("signer fallback buy error:", err2);
          setBuyStatus(`Signer fallback error: ${err2?.message || String(err2)}`);
          setOperation(null);
        }
      }
    } catch (err: any) {
      setBuyStatus(`Error: ${err?.message || String(err)}`);
      setOperation(null);
      console.error("buy error:", err);
    }
  };

  const handleWithdraw = async () => {
    if (!contractAddress) {
      setWithdrawStatus("Contract address not configured.");
      return;
    }
    if (btqBalance <= 0) {
      setWithdrawStatus("Insufficient BTQ balance.");
      return;
    }
    if (expectedChainId && currentChainId && currentChainId !== expectedChainId) {
      setWithdrawStatus(`Switch wallet to chain ${expectedChainId} (current: ${currentChainId}).`);
      return;
    }
    
    try {
      // Verify contract code exists before attempting withdraw
      try {
        const providerRaw = (window as any).ethereum;
        if (providerRaw) {
          const bpCheck = new BrowserProvider(providerRaw);
          const code = await bpCheck.getCode(contractAddress as `0x${string}`);
          if (!code || code === "0x" || code === "0x0") {
            setWithdrawStatus("No contract found at NEXT_PUBLIC_BTQ_ADDRESS on the connected chain. Deploy contract and update .env.");
            setOperation(null);
            return;
          }
        }
      } catch (codeErr) {
        console.warn("Failed to verify contract code:", codeErr);
      }
      setWithdrawStatus("Sending withdraw transaction...");
      setOperation("withdraw");

      const tx = await writeContract({
        address: contractAddress as `0x${string}`,
        abi: BTQ_ABI,
        functionName: "withdraw",
      } as any);

      if (tx && (tx as any).hash) {
        setTxHash((tx as any).hash);
        setWithdrawStatus(`Transaction sent: ${(tx as any).hash}`);
        console.log("withdraw tx:", tx);
      } else {
        console.log("writeContract returned (no hash):", tx);
        try {
          const provider = (window as any).ethereum;
          if (provider) {
            const bp = new BrowserProvider(provider);
            const signer2 = await bp.getSigner();
            const contractWithSigner = new Contract(contractAddress as `0x${string}`, BTQ_ABI, signer2);
            const tx2 = await contractWithSigner.withdraw();
            setTxHash(tx2.hash);
            setWithdrawStatus(`Transaction sent via signer: ${tx2.hash}`);
            console.log("withdraw tx (signer):", tx2);
          } else {
            setWithdrawStatus("Transaction submitted (no hash returned) and no injected provider available for fallback.");
          }
        } catch (err2) {
          console.error("signer fallback withdraw error:", err2);
          setWithdrawStatus(`Signer fallback error: ${err2?.message || String(err2)}`);
          setOperation(null);
        }
      }
    } catch (err: any) {
      setWithdrawStatus(`Error: ${err?.message || String(err)}`);
      setOperation(null);
      console.error("withdraw error:", err);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 p-6 bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 rounded-lg">
      {/* Header with Balance */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet className="w-5 h-5 text-primary" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">BTQ Balance</span>
            <span className="text-2xl font-black text-white italic tracking-tighter">{btqBalance.toFixed(2)}</span>
          </div>
        </div>
        <button
          onClick={() => disconnect()}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-600/30 text-red-500 font-black uppercase text-[10px] tracking-widest hover:bg-red-600/30 transition-all rounded-lg"
        >
          <LogOut className="w-4 h-4" />
          LOGOUT
        </button>
      </div>

      {/* Address Display */}
      <div className="text-[11px] text-white/50 font-mono bg-black/20 px-3 py-2 rounded border border-white/5">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowBuyModal(!showBuyModal)}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-primary/20 border border-primary/40 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/30 transition-all rounded-lg"
        >
          <Plus className="w-4 h-4" />
          BUY BTQ
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowWithdrawModal(!showWithdrawModal)}
          disabled={btqBalance <= 0}
          className={`flex items-center justify-center gap-2 px-4 py-3 border font-black uppercase text-[10px] tracking-widest rounded-lg transition-all ${
            btqBalance > 0
              ? "bg-secondary/20 border-secondary/40 text-secondary hover:bg-secondary/30"
              : "bg-white/5 border-white/10 text-white/30 cursor-not-allowed"
          }`}
        >
          <Send className="w-4 h-4" />
          SELL BTQ
        </motion.button>
      </div>

      {/* Buy Modal */}
      <AnimatePresence>
        {showBuyModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black/40 border border-primary/20 rounded-lg p-4 space-y-3"
          >
            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Buy BTQ</h4>
            <p className="text-[9px] text-white/60">Rate: 1 BTQ = {nativePerBTQ} native</p>

            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={buyAmount}
                onChange={(e) => setBuyAmount(Number(e.target.value))}
                className="bg-black/60 border border-white/10 px-3 py-2 text-white rounded flex-1 text-[10px]"
                placeholder="Amount"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBuy}
                disabled={isPending || isTxLoading || operation === "buy"}
                className="px-4 py-2 bg-primary text-black font-bold rounded hover:bg-white transition-all disabled:opacity-50"
              >
                {(isPending || isTxLoading) && operation === "buy" ? "..." : "BUY"}
              </motion.button>
            </div>

            <p className="text-[9px] text-white/60">Will send ~{requiredNative.toFixed(4)} native</p>

            {(isPending || isTxLoading) && operation === "buy" && <p className="text-[9px] text-white/80">Waiting for confirmation...</p>}
            {isTxSuccess && operation === null && <p className="text-[9px] text-emerald-300">Purchase successful!</p>}
            {buyStatus && <p className="text-[9px] text-red-400">{buyStatus}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black/40 border border-secondary/20 rounded-lg p-4 space-y-3"
          >
            <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest">Sell BTQ</h4>
            <p className="text-[9px] text-white/60">Withdraw {btqBalance.toFixed(2)} BTQ to native currency</p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWithdraw}
              disabled={isTxLoading || isPending || operation === "withdraw" || btqBalance <= 0}
              className="w-full px-4 py-2 bg-secondary text-white font-bold rounded hover:bg-secondary/90 transition-all disabled:opacity-50"
            >
              {(isTxLoading || isPending) && operation === "withdraw" ? "Processing..." : "WITHDRAW ALL"}
            </motion.button>

            {(isTxLoading || isPending) && operation === "withdraw" && <p className="text-[9px] text-white/80">Waiting for confirmation...</p>}
            {isTxSuccess && operation === null && <p className="text-[9px] text-emerald-300">Withdraw successful!</p>}
            {withdrawStatus && <p className="text-[9px] text-red-400">{withdrawStatus}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WalletPanel;

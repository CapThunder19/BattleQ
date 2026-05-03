export function getWalletUser(): string {
  if (typeof window === "undefined") return "Wallet_User";
  return localStorage.getItem("battleq_user") || "Wallet_User";
}

export function clearWalletUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("battleq_user");
  }
}

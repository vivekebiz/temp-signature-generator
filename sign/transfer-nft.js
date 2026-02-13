const { ethers } = require("ethers");
require("dotenv").config();

// Minimal ERC721 ABI for transfer
const ERC721_ABI = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
];

async function main() {
  const CONFIG = {
    RPC_URL:
      "https://polygon-amoy.g.alchemy.com/v2/TcxcqkL6NvplS05IkAEEPc3Z2OSTnAih",

    PRIVATE_KEY:
      "b74bc63c8f14c0b063ca8965dcdbdc9cf8d90ade385bcdfa9532ad4f4f9616a9",

    CONTRACT_ADDRESS: "0xD78d771120Df73C359b30aA64785148FC3B154b5",

    FROM: "0xECAA0aE4dFa973D39A3c19fC9bCED27D67bdea02",
    TO: "0xE29EB15BBD534D8116B4d4d4683ae772AD03b077",
    TOKEN_ID: 13,
  };

  const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
  const wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);

  console.log("Signer:", wallet.address);

  const contract = new ethers.Contract(
    CONFIG.CONTRACT_ADDRESS,
    ERC721_ABI,
    wallet,
  );

  // 1️⃣ Verify owner
  const owner = await contract.ownerOf(CONFIG.TOKEN_ID);
  console.log("Current owner:", owner);

  if (owner.toLowerCase() !== CONFIG.FROM.toLowerCase()) {
    throw new Error("❌ Provided FROM address is not current owner");
  }

  if (wallet.address.toLowerCase() !== owner.toLowerCase()) {
    throw new Error("❌ Private key does not belong to token owner");
  }

  // 2️⃣ Send transaction
  console.log("Transferring token...");

  const tx = await contract.safeTransferFrom(
    CONFIG.FROM,
    CONFIG.TO,
    CONFIG.TOKEN_ID,
  );

  console.log("Transaction sent:", tx.hash);

  const receipt = await tx.wait();

  console.log("✅ Transfer confirmed in block:", receipt.blockNumber);
}

main().catch(console.error);

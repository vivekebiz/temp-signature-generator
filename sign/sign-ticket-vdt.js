const { ethers } = require("ethers");
const dotenv = require("dotenv");
dotenv.config();

// Minimal ABI for ticketNonces(uint256) and ownerOf(uint256)
const TICKET_VDT_ABI = [
  "function ticketNonces(uint256) view returns (uint256)",
  "function ownerOf(uint256) view returns (address)",
];

// Fetch nonce for the tokenId (new logic)
async function getTicketNonce(ticketVdtAddress, tokenId, provider) {
  const nftContract = new ethers.Contract(
    ticketVdtAddress,
    TICKET_VDT_ABI,
    provider,
  );
  const nonce = await nftContract.ticketNonces(tokenId);
  return Number(nonce);
}

// Fetch token owner
async function getTokenOwner(ticketVdtAddress, tokenId, provider) {
  const nftContract = new ethers.Contract(
    ticketVdtAddress,
    TICKET_VDT_ABI,
    provider,
  );
  return await nftContract.ownerOf(tokenId);
}

async function main() {
  const CONFIG = {
    ESCROW_ADDRESS: "0xECAA0aE4dFa973D39A3c19fC9bCED27D67bdea02",

    // ⚠️ MUST be token owner private key
    PRIVATE_KEY:
      "c6cbcf5eaf03d0f9deccfca379338269aee54696739a8273beca5ae4e500a161",

    DOMAIN: {
      name: "TicketVDT",
      version: "1",
      chainId: 80002, // Polygon Amoy
      verifyingContract: "0xD78d771120Df73C359b30aA64785148FC3B154b5",
    },

    TYPES: {
      TransferWithSig: [
        { name: "tokenId", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
        { name: "from", type: "address" },
        { name: "to", type: "address" },
      ],
    },

    PROVIDER_URL:
      process.env.RPC_URL ||
      "https://polygon-amoy.g.alchemy.com/v2/TcxcqkL6NvplS05IkAEEPc3Z2OSTnAih",

    TOKEN_ID: "13",
    DEADLINE: "1771846853",
  };

  const provider = new ethers.JsonRpcProvider(CONFIG.PROVIDER_URL);
  const wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);

  console.log("Signer address:", wallet.address);

  // 1️⃣ Fetch actual token owner
  const owner = await getTokenOwner(
    CONFIG.DOMAIN.verifyingContract,
    CONFIG.TOKEN_ID,
    provider,
  );

  console.log(`Owner of tokenId ${CONFIG.TOKEN_ID}:`, owner);

  // 🔒 Hard safety check
  if (wallet.address.toLowerCase() !== owner.toLowerCase()) {
    throw new Error("❌ Signer wallet is NOT the token owner");
  }

  // 2️⃣ Fetch nonce for tokenId (new logic)
  const nonce = await getTicketNonce(
    CONFIG.DOMAIN.verifyingContract,
    CONFIG.TOKEN_ID,
    provider,
  );

  console.log("Fetched nonce:", nonce);

  // 3️⃣ Build EXACT struct expected by contract
  const value = {
    tokenId: BigInt(CONFIG.TOKEN_ID),
    nonce: BigInt(nonce),
    deadline: BigInt(CONFIG.DEADLINE),
    from: owner, // ✅ MUST be owner
    to: CONFIG.ESCROW_ADDRESS,
  };

  // 4️⃣ Sign EIP-712 typed data
  const signature = await wallet.signTypedData(
    CONFIG.DOMAIN,
    CONFIG.TYPES,
    value,
  );

  console.log("\nGenerated Signature:");
  console.log(signature);

  // 5️⃣ Local verification (matches Solidity recover)
  const digest = ethers.TypedDataEncoder.hash(
    CONFIG.DOMAIN,
    CONFIG.TYPES,
    value,
  );

  const recovered = ethers.recoverAddress(digest, signature);
  console.log("\nRecovered signer:", recovered);

  if (recovered.toLowerCase() !== owner.toLowerCase()) {
    throw new Error("❌ Signature recovery mismatch");
  }

  console.log("\n✅ Signature is VALID for TicketVDT.transferWithSig");
}

main().catch(console.error);

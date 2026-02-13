// Function to fetch and log the nonce for a given address
async function logNonce(address) {
  const { ethers } = require("ethers");
  // Set up a provider (replace with your RPC URL or use default)
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_URL || "https://rpc-mumbai.maticvigil.com",
  );
  const contractAddress = "0xD78d771120Df73C359b30aA64785148FC3B154b5";
  const abi = ["function nonces(address) view returns (uint256)"];
  const contract = new ethers.Contract(contractAddress, abi, provider);
  try {
    const nonce = await contract.nonces(address);
    console.log(`Nonce for ${address}:`, nonce.toString());
  } catch (err) {
    console.error("Error fetching nonce:", err);
  }
}
const { ethers } = require("ethers");
const dotenv = require("dotenv");
dotenv.config();

async function main() {
  // REPLACE THIS WITH THE PRIVATE KEY FOR: 0x3c542EAE00e9F861f267117bA172EDd655B43cD3
  const privateKey =
    "c6cbcf5eaf03d0f9deccfca379338269aee54696739a8273beca5ae4e500a161";

  const wallet = new ethers.Wallet(privateKey);
  console.log(`Signing with address: ${wallet.address}`);

  const expectedFrom = "0xE29EB15BBD534D8116B4d4d4683ae772AD03b077";

  if (wallet.address.toLowerCase() !== expectedFrom.toLowerCase()) {
    console.warn(
      `WARNING: Wallet address (${wallet.address}) does not match the 'from' address in the payload (${expectedFrom})!`,
    );
  }

  const domain = {
    name: "TicketVDT",
    version: "1",
    chainId: 80002,
    verifyingContract: "0xD78d771120Df73C359b30aA64785148FC3B154b5",
  };

  const types = {
    TransferWithSig: [
      { name: "tokenId", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "from", type: "address" },
      { name: "to", type: "address" },
    ],
  };

  const value = {
    tokenId: "13",
    nonce: 20,
    deadline: "1771846853",
    from: expectedFrom,
    to: "0xECAA0aE4dFa973D39A3c19fC9bCED27D67bdea02",
  };

  try {
    const signature = await wallet.signTypedData(domain, types, value);
    console.log("\nGenerated Signature:");
    console.log(signature);
  } catch (error) {
    console.error("Error signing message:", error);
  }
}

main();

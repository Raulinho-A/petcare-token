const ethers = (await import("ethers")).ethers;

import pctArtifact from "../artifacts/contracts/PetCareToken.sol/PetCareToken.json";

// RPC local (red miRedLocal)
const RPC_URL = "http://127.0.0.1:8545";

// Direccion del contrato
const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

const provider = new ethers.JsonRpcProvider(RPC_URL);

const signer = await provider.getSigner(0);
const signerAddress = await signer.getAddress();

console.log("El signerAddress #0 es:" , signerAddress);

const pct = new ethers.Contract(
    CONTRACT_ADDRESS,
    pctArtifact.abi,
    signer
);

console.log("Conectado al contrato PCT");
console.log("-------------------------------------------");

const name = await pct.name();
const symbol = await pct.symbol();
const totalSupply = await pct.totalSupply();
const balance = await pct.balanceOf(signerAddress);

console.log(" Name:", name);
console.log(" Symbol:", symbol);
console.log(" Total Supply:", totalSupply.toString());
console.log(` Balance de ${signerAddress}:`, balance.toString());

console.log("-------------------------------------------");
console.log("\nEnviando 1 token a mí misma…");

const tx = await pct.transfer(signerAddress, ethers.parseEther("1"));
await tx.wait();

console.log("Transferencia realizada");

const newBalance = await pct.balanceOf(signerAddress);
console.log("Nuevo balance: ", newBalance.toString());


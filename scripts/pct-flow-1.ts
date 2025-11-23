const ethers = (await import("ethers")).ethers;

import pctArtifact from "../artifacts/contracts/PetCareToken.sol/PetCareToken.json";

const RPC_URL = "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

const provider = new ethers.JsonRpcProvider(RPC_URL);

const owner = await provider.getSigner(0);     // Tú
const donor = await provider.getSigner(1);     // Donante
const platform = await provider.getSigner(2);  // Dirección PetCare Platform
const shelter = await provider.getSigner(3);   // Refugio

const ownerAddr = await owner.getAddress();
const donorAddr = await donor.getAddress();
const platformAddr = await platform.getAddress();
const shelterAddr = await shelter.getAddress();

const pct = new ethers.Contract(
    CONTRACT_ADDRESS,
    pctArtifact.abi,
    owner
);

console.log("\n==============================================");
console.log("PCT PLATFORM FLOW — BEGIN SIMULATION");
console.log("==============================================");

// 1. Leer datos del contrato
console.log("\n Leyendo información básica del token...");
console.log("Name:", await pct.name());
console.log("Symbol:", await pct.symbol());
console.log("Total Supply:", ethers.formatEther(await pct.totalSupply()), "PCT");

// 2. Owner transfiere tokens al Donante
console.log("\n Owner → Donor (100 PCT)");

const tx1 = await pct.transfer(donorAddr, ethers.parseEther("100"));
await tx1.wait();

console.log("Transferencia realizada");

// 3. Donor envía tokens a la plataforma
console.log("\n Donor → Plataforma (25 PCT)")

const pctDonorView = new ethers.Contract(CONTRACT_ADDRESS, pctArtifact.abi, donor);

const tx2 = await pctDonorView.transfer(platformAddr, ethers.parseEther("25"));
await tx2.wait();

console.log("Donación registrada ✔");

// 4. Plataforma envía tokens al Refugio (flujo real de tu MVP)
console.log("\n Plataforma → Refugio (10 PCT)");

const pctPlataformView = new ethers.Contract(CONTRACT_ADDRESS, pctArtifact.abi, platform);

const tx3 = await pctPlataformView.transfer(shelterAddr, ethers.parseEther("10"));
await tx3.wait();

console.log("Fondos entregados al refugio ✔");

// 5. Mostrar balances finales
console.log("\n----------------------------------------------");
console.log(" BALANCES FINALES");
console.log("----------------------------------------------");

console.log("Owner: ", ethers.formatEther(await pct.balanceOf(ownerAddr)), "PCT");
console.log("Donor: ", ethers.formatEther(await pct.balanceOf(donorAddr)), "PCT");
console.log("Platform: ", ethers.formatEther(await pct.balanceOf(platformAddr)), "PCT");
console.log("Shelter: ", ethers.formatEther(await pct.balanceOf(shelterAddr)), "PCT");

console.log("\n FIN DE LA SIMULACIÓN ● PCT PLATFORM FLOW COMPLETO\n");
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PetCareModule = buildModule("PetCareModule", (m) => {
    const token = m.contract("PetCareToken");
    return { token };
})

export default PetCareModule;
import { BlockTag, ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import pctArtifact from "../artifacts/contracts/PetCareToken.sol/PetCareToken.json";

const DEFAULT_RPC = process.env.RPC_URL ?? "http://127.0.0.1:8545";
const provider = new ethers.JsonRpcProvider(DEFAULT_RPC);

function readIgnitionAddress(): string | null {
    try {
        const p = path.join(
            __dirname,
            "..",
            "ignition",
            "deployments",
            "chain-31337",
            "deployed_addresses.json"
        );
        const j = JSON.parse(fs.readFileSync(p, "utf8"));

        for (const k of Object.keys(j)) {
            const v = j[k];
            if (typeof v === "string" && v.startsWith("0x") && v.length === 42) {
                return v;
            }
        }
        return null;
    } catch {
        return null;
    }
}

const FROM_IGNITION = readIgnitionAddress();
export const CONTRACT_ADDRESS = 
    process.env.PCT_CONTRACT_ADDRESS ??
    FROM_IGNITION ??
    "0x5fbdb2315678afecb367f032d93f642f64180aa3";

export const parsePCT = (s: string) => ethers.parseEther(s);
export const formatPCT = (v: bigint) => ethers.formatEther(v);

export function getContract(signer?: ethers.Signer) {
    return new ethers.Contract(CONTRACT_ADDRESS, pctArtifact.abi, signer ?? provider);
}

export async function getSigners() {
    const owner = await provider.getSigner(0);
    const donor = await provider.getSigner(1);
    const platform = await provider.getSigner(2);
    const shelter = await provider.getSigner(3);
    return { owner, donor, platform, shelter };
}

export function toBlockTag(input: string | undefined, fallback: BlockTag) : BlockTag {
    if (!input) return fallback;
    const v = input.toLowerCase();
    if (v === "latest" || v === "earliest" || v === "pending" || v === "safe" || v === "finalized") {
        return v;
    }
    if (/^0x[0-9a-f]+$/i.test(input)) {
        return BigInt(input); // hex -> bigint
    }
    if (/^\d+$/.test(input)) {
        return Number(input); // decimal -> number
    }
    throw new Error(`Invalid blockTag: ${input}`);
}

export { provider, pctArtifact };
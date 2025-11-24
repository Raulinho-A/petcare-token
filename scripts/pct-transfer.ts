import { getContract, getSigners, parsePCT, formatPCT } from "./_config.js";

const args = process.argv.slice(2);

type Role = "owner" | "donor" | "platform" | "shelter";

async function pick(role: Role) {
  const s = await getSigners();
  return s[role];
}

(async () => {
  const [fromRole, toRole, amountStr] = args as [Role, Role, string];
  if (!fromRole || !toRole || !amountStr) {
    console.log("Uso: npx ts-node scripts/pct-transfer.ts <fromRole> <toRole> <amountPCT>");
    process.exit(1);
  }

  const from = await pick(fromRole);
  const to = await pick(toRole);
  const toAddr = await to.getAddress();

  const pct = getContract(from);
  const tx = await pct.transfer(toAddr, parsePCT(amountStr));
  const r = await tx.wait();

  console.log(`Hash: ${tx.hash} (block ${r?.blockNumber})`);
  console.log(`OK: ${fromRole} → ${toRole} ${amountStr} PCT`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
// scripts/pct-sim-approve-flow.ts
import { getContract, getSigners, parsePCT, formatPCT } from "./_config.js";

// Uso:
//   npx tsx scripts/pct-sim-approve-flow.ts            # approve 25 / pull 10
//   npx tsx scripts/pct-sim-approve-flow.ts 50 20      # approve 50 / pull 20
const approveAmt = process.argv[2] ?? "25";
const pullAmt = process.argv[3] ?? "10";

(async () => {
  const { donor, platform, shelter } = await getSigners();
  const donorAddr = await donor.getAddress();
  const platformAddr = await platform.getAddress();
  const shelterAddr = await shelter.getAddress();

  const pctAsDonor    = getContract(donor);
  const pctAsPlatform = getContract(platform);

  console.log("\n=== Donor approve → Platform ===");
  const txA = await pctAsDonor.approve(platformAddr, parsePCT(approveAmt));
  await txA.wait();
  console.log("approve hash:", txA.hash);

  const allowance = (await pctAsDonor.allowance(donorAddr, platformAddr)) as bigint;
  console.log("allowance now:", formatPCT(allowance), "PCT");

  console.log("\n=== Platform pulls → Shelter ===");
  const txP = await pctAsPlatform.transferFrom(donorAddr, shelterAddr, parsePCT(pullAmt));
  await txP.wait();
  console.log("pull  hash:", txP.hash);

  console.log("\n=== Balances ===");
  const pct = getContract();
  const [bd, bp, bs] = await Promise.all([
    pct.balanceOf(donorAddr),
    pct.balanceOf(platformAddr),
    pct.balanceOf(shelterAddr),
  ]);
  console.log("Donor   :", formatPCT(bd), "PCT");
  console.log("Platform:", formatPCT(bp), "PCT");
  console.log("Shelter :", formatPCT(bs), "PCT");
  console.log("\nOK ");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

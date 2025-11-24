import { getContract, formatPCT, toBlockTag, getSigners } from "./_config.js";
import type { BlockTag, EventLog } from "ethers";

type Role = "owner" | "donor" | "platform" | "shelter";

async function pick(role: Role) {
    const s = await getSigners();
    return s[role];
}

const argv = process.argv.slice(2);
const actorRole = argv[0] as Role | undefined;
const peerRole = (argv[1] && ["owner","donor","platform","shelter"].includes(argv[1])) ? (argv[1] as Role) : undefined;

// Si hay peerRole, los bloques (si se pasan) están en argv[2], argv[3]. Si no hay peerRole, en argv[1], argv[2]
const fromIdx = peerRole ? 2 : 1;
const toIdx = peerRole ? 3 : 2;

const fromBlock: BlockTag = toBlockTag(argv[fromIdx], 0);
const toBlock: BlockTag = toBlockTag(argv[toIdx], "latest");

(async () => {
  if (!actorRole) {
    console.log("Uso: npx tsx scripts/pct-actor-history.ts <actorRole> [peerRole] [fromBlock] [toBlock]");
    process.exit(1);
  }

  const actor = await pick(actorRole);
  const actorAddr = await actor.getAddress();
  const peerAddr = peerRole ? await (await pick(peerRole)).getAddress() : null;

  const pct = getContract();

  // --------- TRANSFERS ---------
  // Salidas del actor (from = actor, to opcionalmente peer)
  const outputs = (await pct.queryFilter(
    pct.filters.Transfer(actorAddr, peerAddr ?? null), fromBlock, toBlock
  )) as EventLog[];

  // Entradas al actor (to = actor, from opcionalmente peer)
  const inputs = (await pct.queryFilter(
    pct.filters.Transfer(peerAddr ?? null, actorAddr), fromBlock, toBlock
  )) as EventLog[];

  // --------- APPROVALS ---------
  // Actor como OWNER (autoriza a peer o a cualquiera si no hay peer)
  const approvalsAsOwner = (await pct.queryFilter(
    pct.filters.Approval(actorAddr, peerAddr ?? null), fromBlock, toBlock
  )) as EventLog[];

  // Actor como SPENDER (recibe allowance del peer o de cualquiera si no hay peer)
  const approvalsAsSpender = (await pct.queryFilter(
    pct.filters.Approval(peerAddr ?? null, actorAddr), fromBlock, toBlock
  )) as EventLog[];

  console.log(`Actor: ${actorRole} (${actorAddr})${peerRole ? ` | Peer: ${peerRole} (${peerAddr})` : ""}`);
  console.log(`Rango: ${String(fromBlock)} → ${String(toBlock)}`);
  console.log(`Totals => outputs:${outputs.length} | inputs:${inputs.length} | approvals(owner):${approvalsAsOwner.length} | approvals(spender):${approvalsAsSpender.length}`);

  // ----- PRINT HELPERS -----
  const printTransfer = (ev: EventLog) => {
    const { from, to, value } = ev.args as unknown as { from: string; to: string; value: bigint };
    console.log(`  #${ev.blockNumber} ${ev.transactionHash} ${from} -> ${to} ${formatPCT(value)} PCT`);
  };
  const printApproval = (ev: EventLog) => {
    const { owner, spender, value } = ev.args as unknown as { owner: string; spender: string; value: bigint };
    console.log(`  #${ev.blockNumber} ${ev.transactionHash} ${owner} => ${spender} ${formatPCT(value)} PCT`);
  };

  console.log("\n----- TRANSFERS: OUTPUTS (from actor) -----");
  outputs.forEach(printTransfer);

  console.log("\n----- TRANSFERS: INPUTS (to actor) -----");
  inputs.forEach(printTransfer);

  console.log("\n----- APPROVALS: ACTOR as OWNER -----");
  approvalsAsOwner.forEach(printApproval);

  console.log("\n----- APPROVALS: ACTOR as SPENDER -----");
  approvalsAsSpender.forEach(printApproval);

  console.log("\nOK ");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
import { getContract, formatPCT, toBlockTag } from "./_config.js";
import type { BlockTag, EventLog } from "ethers";

// Ej: npx ts-node scripts/pct-events-history.ts 0 latest
const fromBlock: BlockTag = toBlockTag(process.argv[2], 0);
const toBlock: BlockTag = toBlockTag(process.argv[3], "latest");

(async () => {
  const pct = getContract();

  // Transfers
  const tfEvents = (await pct.queryFilter(
    pct.filters.Transfer(),
    fromBlock,
    toBlock
  )) as EventLog[];

  console.log(`Transfers (${tfEvents.length})`);
  
  for (const ev of tfEvents) {
    const { args, blockNumber, transactionHash } = ev;
    const from = (args?.from ?? args?.[0]) as string;
    const to = (args?.to ?? args?.[1]) as string;
    const value = (args?.value ?? args?.[2]) as bigint;
    
    console.log(
        `  #${blockNumber} ${transactionHash} ${from} -> ${to} ${formatPCT(value)} PCT`
    );
  }

  // Approvals
  const apEvents = (await pct.queryFilter(
    pct.filters.Approval(),
    fromBlock,
    toBlock
  )) as EventLog[];

  console.log(`Approvals (${apEvents.length})`);

  for (const ev of apEvents) {
    const { args, blockNumber, transactionHash } = ev;
    const owner = (args?.from ?? args?.[0]) as string;
    const spender = (args?.to ?? args?.[1]) as string;
    const value = (args?.value ?? args?.[2]) as bigint;

    console.log(
      `  #${blockNumber} ${transactionHash} ${owner} => ${spender} ${formatPCT(value)} PCT`
    );
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
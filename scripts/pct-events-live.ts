import { getContract, provider, formatPCT } from "./_config.js";

// Uso:
//   npx tsx scripts/pct-events-live.ts               # ambos eventos, sin límite
//   npx tsx scripts/pct-events-live.ts 5             # ambos, detener tras 5
//   npx tsx scripts/pct-events-live.ts 10 transfer   # solo Transfer, detener tras 10
//   npx tsx scripts/pct-events-live.ts 0 approval    # solo Approval, infinito
const limit = Number(process.argv[2] ?? "0");
const kind  = (process.argv[3] ?? "both") as "both" | "transfer" | "approval";

(async () => {
    const pct = getContract();

    console.log(` Escuchando eventos (${kind}); límite=${limit || "∞"}. Ctrl+C para salir.\n`);

    // Transfer
    const transferEv = pct.interface.getEvent("Transfer");
    if (!transferEv) throw new Error("Event Transfer not found");
    const transferTopic = transferEv.topicHash;

    provider.on(
        { address: pct.target, topics: [transferTopic] },
        (log) => {
            const parsed = pct.interface.parseLog(log);
            if (!parsed) return; // should never happen
            if (!parsed.args) return;

            const { from, to, value } = parsed.args;

            console.log(`[Transfer] #${log.blockNumber} ${log.transactionHash} ${from} -> ${to} ${formatPCT(value)} PCT`);
        }
    );

    // Approval
    const approvalEv = pct.interface.getEvent("Approval");
    if (!approvalEv) throw new Error("Event Approval not found");
    const approvalTopic = approvalEv.topicHash;

    provider.on(
        { address: pct.target, topics: [approvalTopic] },
        (log) => {
            const parsed = pct.interface.parseLog(log);
            if (!parsed || !parsed.args) return;

            const { owner, spender, value } = parsed.args;

            console.log(`[Approval] #${log.blockNumber} ${log.transactionHash} ${owner} => ${spender} ${formatPCT(value)} PCT`);
        }
    );

    process.on("SIGINT", () => {
        provider.removeAllListeners();
        process.exit(0);
    });

})();

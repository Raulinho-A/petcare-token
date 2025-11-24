import { provider, getContract, formatPCT, CONTRACT_ADDRESS } from "./_config.js";

(async () => {
    const pct = getContract();
    const [name, symbol, decimals, totalSupply, maxSupply, net] = await Promise.all([
        pct.name(),
        pct.symbol(),
        pct.decimals(),
        pct.totalSupply(),
        pct.maxSupply(),
        provider.getNetwork(),
    ]);

    console.log("RPC        :", (await provider._detectNetwork()).name);
    console.log("Network   :", net.name, `(#${net.chainId})`);
    console.log("Contract  :", CONTRACT_ADDRESS);
    console.log("Name      :", name);
    console.log("Symbol    :", symbol);
    console.log("Decimals  :", Number(decimals));
    console.log("Total     :", formatPCT(totalSupply), "PCT");
    console.log("MaxSupply :", formatPCT(maxSupply), "PCT");
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
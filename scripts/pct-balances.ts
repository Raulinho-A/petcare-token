import { getContract, getSigners, formatPCT } from "./_config.js";

(async () => {
    const pct = getContract();
    const { owner, donor, platform, shelter } = await getSigners();

    const [o, d, p, s] = await Promise.all([
        pct.balanceOf(await owner.getAddress()),
        pct.balanceOf(await donor.getAddress()),
        pct.balanceOf(await platform.getAddress()),
        pct.balanceOf(await shelter.getAddress()),
    ]);
    
    console.log("Owner   :", formatPCT(o), "PCT");
    console.log("Donor   :", formatPCT(d), "PCT");
    console.log("Platform:", formatPCT(p), "PCT");
    console.log("Shelter :", formatPCT(s), "PCT");

})().catch((e) => {
    console.error(e);
    process.exit(1);
});
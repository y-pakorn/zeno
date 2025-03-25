import { client, contract } from "./constants";

(async () => {
  const market = await client.getObject({
    id: `${contract.markets.longTermWal}`,
    options: {
      showDisplay: true,
      showType: true,
      showContent: true,
    },
  });

  console.log((market.data?.content as any).fields);
})();

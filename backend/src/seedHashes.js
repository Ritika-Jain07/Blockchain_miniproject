const { contract } = require("./web3");
const { loadDataset, getRow, hashRow } = require("./dataset");
require("dotenv").config();

(async () => {
  const count = await loadDataset(process.env.DATASET_PATH);
  const admin = process.env.ADMIN_ACCOUNT;

  console.log("Dataset rows:", count);

  for (let i = 0; i < count; i++) {
    const row = getRow(i);
    const h = hashRow(row);

    await contract.methods.storeRecordHash(i, h).send({ from: admin, gas: 300000 });

    if (i % 100 === 0) console.log("Seeded recordId:", i);
  }

  console.log("✅ All hashes stored on blockchain");
  process.exit(0);
})();
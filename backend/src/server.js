const express = require("express");
const cors = require("cors");
const { loadDataset } = require("./dataset");
const accessRoutes = require("./accessRoutes");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api", accessRoutes);

(async () => {
  const n = await loadDataset(process.env.DATASET_PATH);
  console.log("✅ Dataset loaded rows:", n);

  app.listen(process.env.PORT || 5000, () => {
    console.log(`✅ Backend running on http://localhost:${process.env.PORT || 5000}`);
  });
})();
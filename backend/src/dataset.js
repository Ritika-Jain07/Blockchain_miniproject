const fs = require("fs");
const csv = require("csv-parser");
const crypto = require("crypto");

let rows = [];

function loadDataset(path) {
  return new Promise((resolve, reject) => {
    const temp = [];
    fs.createReadStream(path)
      .pipe(csv())
      .on("data", (data) => temp.push(data))
      .on("end", () => {
        rows = temp;
        resolve(rows.length);
      })
      .on("error", reject);
  });
}

function getRow(recordId) {
  if (recordId < 0 || recordId >= rows.length) return null;
  return rows[recordId];
}

function hashRow(row) {
  const fields = ["Gender","AGE","Urea","Cr","HbA1c","Chol","TG","HDL","LDL","VLDL","BMI","CLASS"];
  const canonical = fields.map(k => String(row[k]).trim()).join(",");
  return "0x" + crypto.createHash("sha256").update(canonical).digest("hex");
}

module.exports = { loadDataset, getRow, hashRow };
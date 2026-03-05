const express = require("express");
const { contract } = require("./web3");
const { getRow, hashRow } = require("./dataset");

const router = express.Router();

// purpose: 1=TREATMENT, 2=RESEARCH, 3=EMERGENCY
router.get("/record/:id", async (req, res) => {
  const recordId = Number(req.params.id);
  const purpose = Number(req.query.purpose);
  const from = (req.query.from || "").trim();

  if (!from) return res.status(400).json({ error: "Missing from address" });
  if (![1, 2, 3].includes(purpose)) return res.status(400).json({ error: "Invalid purpose (use 1/2/3)" });

  const row = getRow(recordId);
  if (!row) return res.status(404).json({ error: "Invalid recordId" });

  const h = hashRow(row);

  try {
    // 1) Decide first (read-only)
    const granted = await contract.methods.canAccess(from, recordId, purpose).call();

    // 2) Log the attempt on-chain (granted or denied)
    //    (Your contract decides what it records; this still creates the immutable trail.)
    await contract.methods.logAccess(recordId, purpose, h).send({ from, gas: 300000 });

    // 3) Enforce decision at API layer
    if (!granted) {
      return res.status(403).json({ granted: false, message: "Access denied (logged on-chain)", hash: h });
    }

    // Researchers get limited fields
    if (purpose === 2) {
      const limited = {
        Gender: row.Gender,
        AGE: row.AGE,
        HbA1c: row.HbA1c,
        BMI: row.BMI,
        Chol: row.Chol
      };
      return res.json({ granted: true, recordId, data: limited, hash: h });
    }

    // Doctors get full record
    return res.json({ granted: true, recordId, data: row, hash: h });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// audit stats (count + last entry) - formatted nicely
router.get("/audit/stats", async (req, res) => {
  try {
    const count = await contract.methods.auditCount().call();

    let last = null;
    if (Number(count) > 0) {
      const a = await contract.methods.getAudit(Number(count) - 1).call();

      // web3 can return array-like structs; map to readable keys
      last = {
        time: a.time ?? a[0],
        user: a.user ?? a[1],
        role: String(a.role ?? a[2]),
        recordId: String(a.recordId ?? a[3]),
        purpose: String(a.purpose ?? a[4]),
        granted: Boolean(a.granted ?? a[5]),
        recordHash: a.recordHash ?? a[6]
      };
    }

    res.json({ count: String(count), last });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
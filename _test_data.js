// was forced to make this because of the way schema works

const db = require("./db");

async function createData() {
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");
  await db.query("SELECT setval('invoices_id_seq', 1, false)");

  await db.query(`INSERT INTO companies (code, name, description)
                    VALUES ('test', 'test co', 'a test company'),
                           ('othertest', 'other test co', 'another stinkin test company')`);

  const inv = await db.query(
        `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
           VALUES ('test', 100, false, '2022-08-28', null),
                  ('othertest', 200, false, '2022-08-28', null) 
           RETURNING id`);
}


module.exports = { createData };

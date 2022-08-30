const express = require("express");
const router = new express.Router();
const db = require("../db")
const ExpressError = require("../expressError")

//GET ALL INVOICES
router.get("/", async function(req, res, next) {
    try {
      const results = await db.query("SELECT * FROM invoices");
      return res.json({ invoices: results.rows});
    } catch(err){
      return next(err);
    }
  });


//GET INVOICE THAT MATCHES ID
router.get("/:id", async function(req, res, next){
    try {
        const result = await db.query(
            `SELECT i.id,
             i.comp_code,
             i.amt,
             i.paid,
             i.paid_date,
             c.name,
             c.description
             FROM invoices AS i JOIN companies AS c ON (i.comp_code = c.code) WHERE id = $1`,[req.params.id]);
        
        if (result.rows.length === 0) {
            const notFound = new Error(`There is no invoice with that id: ${req.params.id}`);
            notFound.status = 404;
            throw notFound;
          }

          const inv = result.rows[0];

          const invoice = {
            
            id: inv.id,
            amt: inv.amt,
            paid: inv.paid,
            add_date: inv.add_date,
            paid_date: inv.paid_date,

            company: {
                code: inv.comp_code,
                name: inv.name,
                description: inv.description,
            },
          };

          return res.json({"invoice": invoice});

    } catch(err){
        return next(err)
    }
});

//POST - ADD NEW INVOICE
router.post("/", async function(req, res, next){
    try {
        
        const newInvoice = await db.query("INSERT INTO invoices (comp_code, amt) VALUES($1, $2) RETURNING id, comp_code, amt, add_date, paid_date", [req.body.comp_code, req.body.amt]);
        
        return res.status(201).json({invoice: newInvoice.rows[0]});

    } catch(err) {
        return next(err)
    }
});

//PUT - UPDATE INVOICE THAT MATCHES ID
router.put("/:id", async function(req, res, next){
    try {
        
        if ("id" in req.body) {
            throw new ExpressError("Not allowed", 400);
          }

          const amt = req.body.amt;
          const paid = req.body.paid;
          let paid_date = null;
      
          const result = await db.query(
            "UPDATE invoices SET amt=$1 WHERE id = $2 RETURNING id, comp_code, amt, paid, add_date, paid_date",
            [req.body.amt, req.params.id]);

          const exist_paid_date = result.rows[0].paid_date;
          
          if (!exist_paid_date && paid === true) {
            paid_date = new Date();
          } else if (paid === false) {
            paid_date = null;
          } else {
            paid_date = exist_paid_date;
          }
      
          const newResult = await db.query(
                `UPDATE invoices
                 SET amt=$1, paid=$2, paid_date=$3
                 WHERE id=$4
                 RETURNING id, comp_code, amt, paid, add_date, paid_date`,
              [amt, paid, paid_date, req.params.id]);
      
          if (result.rows.length === 0) {
            throw new ExpressError(`There is no invoice with that id: ${req.params.id}`, 404);
          }
      
          return res.json({ invoice: newResult.rows[0]});

    } catch(err) {
        return next(err)
    }
});

// DELETE INVOICE THAT MATCHES ID
router.delete("/:id", async function(req, res, next){
    try {
        const result = await db.query("DELETE FROM invoices WHERE id=$1 RETURNING id", [req.params.id]);
        
        if (result.rows.length === 0) {
            throw new ExpressError(`There is no invoice with that id: ${req.params.id}`, 404);
          }
      
          return res.json({ status: "deleted"});

    } catch(err){
        return next(err);
    }
})

  module.exports = router;
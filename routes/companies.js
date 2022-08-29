const express = require("express");
const router = new express.Router();
const slugify = require("slugify")
const db = require("../db")
const ExpressError = require("../expressError")

//GET LIST OF ALL COMPANIES
router.get("/", async function(req, res, next) {
  try {
    const results = await db.query("SELECT * FROM companies");
    return res.json({ companies: results.rows});
  } catch(err){
    return next(err);
  }
});

//GET COMPANY THAT MATCHES GIVEN CODE
router.get("/:code", async function(req, res, next){
    try {
        
        const results = await db.query("SELECT * FROM companies WHERE code = $1", [req.params.code]);

        const invData = await db.query("SELECT id FROM invoices WHERE comp_code = $1", [req.params.code]);

        if (results.rows.length === 0) {
            const notFound = new Error(`There is no company with that code: ${req.params.code}`);
            notFound.status = 404;
            throw notFound;
          }

        const company = results.rows[0];
        const invoices = invData.rows;

        company.invoices = invoices.map(inv => inv.id);

        return res.json({"company": company});
    
    } catch(err){
        return next(err);
    }
});

//POST - ADD A COMPANY
router.post("/", async function(req, res, next){
    try {
        const code = slugify(req.body.code, '_')
        const newCompany = await db.query("INSERT INTO companies VALUES($1, $2, $3) RETURNING code, name, description", [code, req.body.name, req.body.description]);
        
        return res.status(201).json({company: newCompany.rows[0]});

    } catch(err){
        return next(err)
    }
})

//PUT - UPDATE EXISTING COMPANY THAT MATCHES CODE
router.put("/:code", async function(req, res, next){
    try {
        if ("code" in req.body) {
            throw new ExpressError("Not allowed", 400);
          }
      
          const result = await db.query(
            "UPDATE companies SET name=$1, description=$2 WHERE code = $3 RETURNING code, name, description",
            [req.body.name, req.body.description, req.params.code]);
      
          if (result.rows.length === 0) {
            throw new ExpressError(`There is no company with that code: ${req.params.code}`, 404);
          }
      
          return res.json({ company: result.rows[0]});
    } catch(err){
        return next(err);
    }
})

// DELETE COMPANY THAT MATCHES CODE
router.delete("/:code", async function(req, res, next){
    try {
        const result = await db.query("DELETE FROM companies WHERE code=$1 RETURNING code", [req.params.code]);
        
        if (result.rows.length === 0) {
            throw new ExpressError(`There is no company with that code: ${req.params.code}`, 404);
          }
      
          return res.json({ status: "deleted"});

    } catch(err){
        return next(err);
    }
})

module.exports = router;
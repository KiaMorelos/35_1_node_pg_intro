const { Router } = require("express");
const express = require("express");
const router = new express.Router();
const slugify = require("slugify")
const db = require("../db")
const ExpressError = require("../expressError")

//GET LIST OF ALL INDUSTRIES
router.get("/", async function(req, res, next) {
    try {
      const results = await db.query("SELECT * FROM industries");
      return res.json({ industries: results.rows, });
    } catch(err){
      return next(err);
    }
  });

//GET DETAILS ON SPECIFIC INDUSTRY
router.get("/:code", async function(req, res, next) {
    try {
        const results = await db.query("SELECT * FROM industries WHERE code = $1", [req.params.code]);
        
        const compCodeData = await db.query(`
            SELECT c.code FROM companies c
                JOIN industry_companies ic
                    ON c.code = ic.company_code
                JOIN industries i
                    ON i.code = ic.industry_code
                WHERE i.code = $1;
            `, [req.params.code])
        
            if (results.rows.length === 0) {
             const notFound = new Error(`There is no industry with that code: ${req.params.code}`);
             notFound.status = 404;
             throw notFound;
            }
    
            const industry = results.rows[0];
            const compCodes = compCodeData.rows;
    
            industry.companyCodes = compCodes.map(code => code.code);
    
            return res.json({"industry": industry });

    } catch(err){
        next(err)
    }
})

//POST - ADD AN INDUSTRY
router.post("/", async function(req, res, next){
    try {
        const code = slugify(req.body.code, '_')
        const newIndustry = await db.query("INSERT INTO industries VALUES($1, $2) RETURNING code, industry", [code, req.body.industry]);
        
        return res.status(201).json({industry: newIndustry.rows[0]});

    } catch(err){
        return next(err)
    }
})

//POST - ASSOCIATE INDUSTRY TO COMPANY
router.post("/:code", async function(req, res, next){
    try {
        const industryCode = req.params.code;
        const compCode = req.body.company_code;
        const result = await db.query(`
            INSERT INTO industry_companies (industry_code, company_code)
                VALUES ($1, $2) returning industry_code, company_code;
        `, [industryCode, compCode]);

        if(result.rows.length === 0){
            const notFound = new Error(`There is no industry with that code: ${req.params.code}`);
             notFound.status = 404;
             throw notFound;
        }

        return res.json({msg: "created association", association: result.rows[0]})
    } catch(err) {

    }
})

  module.exports = router;
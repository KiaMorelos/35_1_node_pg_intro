process.env.NODE_ENV = "test";

const request = require("supertest");
const { createData } = require("../_test_data");
const app = require("../app");
const db = require("../db");

beforeEach(createData);

afterAll(async function(){
    await db.end()
})

describe("GET /companies", function(){
    test("List of all companies", async function(){
        const response = await request(app).get('/companies');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ "companies": [
        {code: "test", name: "test co", description: "a test company"},
        {code: "othertest", name: "other test co", description: "another stinkin test company"},
] });
    });
});

describe("GET /companies/:code", function(){
    test("Get specific company by code", async function(){
        const response = await request(app).get(`/companies/test`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({"company": {
            code: "test",
            name: "test co",
            description: "a test company",
            invoices: [1,],
          }});
    });

    test("Responds with 404 if can't find company", async function() {
        const response = await request(app).get(`/companies/NOTREAL`);
        expect(response.statusCode).toEqual(404);
      });
});

describe("POST /companies", function (){
    test("Add a new company, post route", async function(){
        const response = await request(app).post('/companies').send({
            code: "cowchick", name: "cow and chicken", description: "cow and chickens business"});
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            company: {
                code: "cowchick", name: "cow and chicken", description: "cow and chickens business"
            }
        })
    })
})


describe("PUT /company/:code", function(){
    test("Update a company", async function(){
        const response = await request(app).put('/companies/test').send({ name: "TestCo", description: "a test company updated" });
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            company: {
                code: "test", name: "TestCo", description: "a test company updated"
            }
        })
    })
})

describe("DELETE /company/:code", function(){
    test("Delete company by code", async function(){
        const response = await request(app).delete('/companies/test');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ status: "deleted" })
    })
})
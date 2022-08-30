process.env.NODE_ENV = "test";

const request = require("supertest");
const { createData } = require("../_test_data");
const app = require("../app");
const db = require("../db");

beforeEach(createData);

afterAll(async function(){
    await db.end()
})

describe("GET /invoices", function(){
    test("List of all invoices", async function(){
        const response = await request(app).get('/invoices');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            "invoices": [
              {
            id: 1,
            add_date: "2022-08-28T06:00:00.000Z",
            amt: 100,
            comp_code: "test",
            paid: false,
            paid_date: null,
        },
              {
            id: 2,
            add_date: "2022-08-28T06:00:00.000Z",
            amt: 200,
            comp_code: "othertest",
            paid: false,
            paid_date: null,
              },
            ]
          });
    });
});

describe("GET /invoices/:id", function () {
    test("GET invoice by id", async function () {
      const response = await request(app).get("/invoices/1");
      expect(response.body).toEqual(
          {
            "invoice": {
                id: 1,
                amt: 100,
                paid: false,
                paid_date: null,
              company: {
                code: 'test',
                name: 'test co',
                description: 'a test company',
              }
            }
          }
      );
    });
});

describe("POST /invoices", function () {
    test("add invoice, post route", async function () {
      const response = await request(app).post("/invoices").send({amt: 20, comp_code: 'othertest'});
      expect(response.body).toEqual(
          {
            "invoice": {
              id: 3,
              comp_code: "othertest",
              amt: 20,
              add_date: expect.any(String),
              paid_date: null,
            }
          }
      );
    });
  });

describe("PUT /invoices/:id", function () {
  test("update an invoice, PUT route", async function () {
    const response = await request(app).put("/invoices/1").send({amt: 150, paid: false});
    expect(response.body).toEqual(
        {
          "invoice": {
            id: 1,
            comp_code: 'test',
            amt: 150,
            add_date: expect.any(String),
            paid_date: null,
          }
        }
    );
  });
});

describe("DELETE /invoices/:id", function () {
    test("delete invoice with given id", async function () {
      const response = await request(app).delete("/invoices/1");
      expect(response.body).toEqual({"status": "deleted"});
    });
});
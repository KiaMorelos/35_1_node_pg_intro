\c biztime

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS industry_companies;


CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
  code text PRIMARY KEY,
  industry text NOT NULL UNIQUE
);

CREATE TABLE industry_companies (
  industry_code text NOT NULL REFERENCES industries ON DELETE CASCADE,
  company_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
  PRIMARY KEY (industry_code, company_code)
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'),
         ('qbp', 'QBP', 'Quality Bicycle Products');

INSERT INTO invoices (comp_code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

INSERT INTO industries (code, industry) 
  VALUES ('outath', 'Outdoor and Athletics'),
         ('med', 'Medicine'),
         ('gdsn', 'Graphic Design'),
         ('tech', 'Technology');

INSERT INTO industry_companies (company_code, industry_code) 
  VALUES ('qbp', 'outath'),
         ('ibm', 'tech'),
         ('apple', 'gdsn'),
         ('apple', 'tech');

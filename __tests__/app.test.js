const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed.js");
const app = require("../app.js");
const testData = require("../db/data/test-data/index");

afterAll(() => {
  db.end();
});

beforeEach(() => seed(testData));

describe("GET /api/topics", () => {
  test("returns an array", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.rows)).toBe(true);
      });
  });
  test("returns an array of length 3", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.rows.length).toBe(3);
      });
  });
  test("returned array contains objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const rows = body.rows;
        expect(rows.length).toBe(3);
        rows.forEach((row) => {
          expect(row).toBeInstanceOf(Object);
          expect(Array.isArray(row)).not.toBe(true);
        });
      });
  });
});

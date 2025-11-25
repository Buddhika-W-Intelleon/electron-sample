// test-db.ts
import knex from "knex";

const db = knex({
  client: "sqlite3",
  connection: { filename: "./test.sqlite" },
  useNullAsDefault: true,
});

(async () => {
  await db.schema.createTable("test", (t) => {
    t.increments("id").primary();
    t.string("name");
  });
  console.log("Table created!");
})();

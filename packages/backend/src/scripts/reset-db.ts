/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config();
const pg = require("pg");

const { Client } = pg;
const client = new Client({
    user: process.env.TW_DB_USERNAME,
    password: process.env.TW_DB_PASSWORD,
    host: process.env.TW_DB_HOST,
    port: process.env.TW_DB_PORT,
    database: process.env.TW_DB_NAME,
    ssl: process.env.TW_DB_ENABLE_SSL === "true" ? true : false,
});

async function getTables(client): Promise<string[]> {
    const queryResult = await client.query(
        `SELECT table_name FROM "information_schema"."tables" WHERE "table_schema" = 'public'`
    );

    return queryResult.rows.map(({ table_name }) => table_name);
}
function dropTables(tables: string[]) {
    return Promise.all(
        tables.map((table) =>
            client.query(`DROP TABLE public.${table} CASCADE;`)
        )
    );
}

async function resetDB() {
    await client.connect();

    try {
        console.error("Initiating database reset...");
        const tables = await getTables(client);
        await dropTables(tables);
        console.error("Database reset successful...");
    } catch (err) {
        console.error("Failed to reset database: ", err);
    } finally {
        await client.end();
    }
}

resetDB();

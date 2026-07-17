import "dotenv/config";
import { executeQuery, initializeDB } from "@tigo/postgres-connector";

const createTableIfNotExists = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS clients (
        client_id       VARCHAR(100) PRIMARY KEY,
        client_secret   VARCHAR(255) NOT NULL,
        name            VARCHAR(200),
        active          BOOLEAN DEFAULT TRUE,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
    await executeQuery(query);
    console.log('Tabla "clients" verificada/creada.');
};

const clients = [
    {
        clientId: "geo-app-prod",
        clientSecret: "sk-prod-abc123def",
        name: "Geo App Producción",
    },
    {
        clientId: "geo-app-staging",
        clientSecret: "sk-staging-xyz789ghi",
        name: "Geo App Staging",
    },
];

const upsertClient = async ({ clientId, clientSecret, name }) => {
    const query = `
    INSERT INTO clients (client_id, client_secret, name, active)
    VALUES ($1, $2, $3, TRUE)
    ON CONFLICT (client_id)
    DO UPDATE SET client_secret = $2, name = $3, active = TRUE;
  `;
    await executeQuery(query, [clientId, clientSecret, name]);
    console.log(`Cliente "${clientId}" insertado/actualizado.`);
};

try {
    await initializeDB("default");
    await createTableIfNotExists();
    for (const client of clients) {
        await upsertClient(client);
    }
    console.log("Seed completado exitosamente.");
    process.exit(0);
} catch (error) {
    console.error("Error ejecutando seed:", error.message);
    process.exit(1);
}

import "dotenv/config";
import bcrypt from "bcrypt";
import { executeQuery, initializeDB } from "@tigo/postgres-connector";

const SALT_ROUNDS = 12;

const createTableIfNotExists = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS application_client (
        id                 SERIAL PRIMARY KEY,
        name               VARCHAR(200) NOT NULL,
        client_key         VARCHAR(100) UNIQUE NOT NULL,
        client_secret_hash VARCHAR(255) NOT NULL,
        status             VARCHAR(20) DEFAULT 'ACTIVE',
        created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
    await executeQuery(query);
    console.log('Tabla "application_client" verificada/creada.');
};

const clients = [
    { clientKey: "envio-app", clientSecret: "123456789ABC", name: "Servicio de Envíos" },
    { clientKey: "geo-app-prod", clientSecret: "sk-prod-abc123def", name: "Geo App Producción" },
];

const upsertClient = async ({ clientKey, clientSecret, name }) => {
    const hash = await bcrypt.hash(clientSecret, SALT_ROUNDS);
    const query = `
    INSERT INTO application_client (name, client_key, client_secret_hash, status)
    VALUES ($1, $2, $3, 'ACTIVE')
    ON CONFLICT (client_key)
    DO UPDATE SET name = $1, client_secret_hash = $3, status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP;
  `;
    await executeQuery(query, [name, clientKey, hash]);
    console.log(`Cliente "${clientKey}" insertado/actualizado.`);
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

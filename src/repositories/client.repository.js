import { executeQuery } from '@tigo/postgres-connector';

const TABLE = 'application_client';

export const findClientByKey = async (clientKey) => {
    const query = `
    SELECT id, name, client_key, client_secret_hash, status
    FROM ${TABLE}
    WHERE client_key = $1 AND status = 'ACTIVE';
  `;
    const rows = await executeQuery(query, [clientKey]);
    return rows[0] || null;
};

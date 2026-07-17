import { executeQuery } from '@tigo/postgres-connector';

const TABLE = 'clients';

export const findClientById = async (clientId) => {
    const query = `
    SELECT client_id, client_secret, name, active
    FROM ${TABLE}
    WHERE client_id = $1 AND active = TRUE;
  `;
    const rows = await executeQuery(query, [clientId]);
    return rows[0] || null;
};

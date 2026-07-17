export class Cliente {
    constructor(clientId, clientSecret) {
        Cliente.validar(clientId, clientSecret);
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    static validar(clientId, clientSecret) {
        const esValido =
            typeof clientId === 'string' &&
            clientId.trim().length > 0 &&
            clientId.length <= 100 &&
            typeof clientSecret === 'string' &&
            clientSecret.length >= 8;

        if (!esValido) {
            throw new Error(
                `Credenciales de cliente inválidas: clientId=${clientId}`,
            );
        }
    }

    esValido() {
        return (
            typeof this.clientId === 'string' &&
            this.clientId.trim().length > 0 &&
            this.clientId.length <= 100 &&
            typeof this.clientSecret === 'string' &&
            this.clientSecret.length >= 8
        );
    }
}

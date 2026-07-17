export class Cliente {
    constructor(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;

        if (!this.esValido()) {
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

export class Punto {
    constructor(latitude, longitude) {
        // Convertimos a número. Si falla, el resultado será exactamente NaN.
        this.latitude = Number(latitude);
        this.longitude = Number(longitude);

        if (!this.esValido()) {
            throw new Error(
                `Coordenadas fuera de rango válido (-90 a 90, -180 a 180): lat=${latitude}, lng=${longitude}`,
            );
        }
    }

    esValido() {
        return (
            // Usamos Number.isNaN porque es más estricto y seguro
            !Number.isNaN(this.latitude) &&
            !Number.isNaN(this.longitude) &&
            this.latitude >= -90 &&
            this.latitude <= 90 &&
            this.longitude >= -180 &&
            this.longitude <= 180
        );
    }
}

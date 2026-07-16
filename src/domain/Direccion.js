export class Direccion {
  constructor(address, coordenadas = null) {
    this.address = address;
    this.coordenadas = coordenadas;

    if (this.esVacia()) {
      throw new Error("Address is required.");
    }
  }

  esVacia() {
    return !this.address || this.address.trim().length === 0;
  }
}

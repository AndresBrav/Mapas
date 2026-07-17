export class Direccion {
  constructor(address, coordenadas = null) {
    Direccion.validar(address);
    this.address = address;
    this.coordenadas = coordenadas;
  }

  static validar(address) {
    if (!address || address.trim().length === 0) {
      throw new Error("Address is required.");
    }
  }

  esVacia() {
    return !this.address || this.address.trim().length === 0;
  }
}

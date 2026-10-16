/* Desde este modulo gestionamos la lectura y traducción de los motivos de baja */ 

export const MOTIVOS_BAJA = {
    "1": "Se realiza la prueba",
    "2": "Voluntaria del paciente",
    "3": "Exitus",
  };

  /** Convierte el código de prueba (blockchain) en literal legible */
export function literalMotivosBaja(codigo) {
    if (codigo == null || codigo === "" || codigo === "0") {
      return "—";
    }
    // Por si en algún momento llega como número o BigNumber
    const key = String(codigo);
    return MOTIVOS_BAJA[key] ?? `Código desconocido (${key})`;
  }

  /** Lista lista para pintar options del <select> */
 export function opcionesMotivosBaja() {
    // Transformamos el objeto MOTIVOS_BAJA en un array de objetos con value y label para pintarlo en el frontend.
    return Object.entries(MOTIVOS_BAJA).map(([value, label]) => ({
      value,
      label,
    }));
  }
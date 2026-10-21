/* Desde este modulo gestionamos la lectura y traducción de pruebas diagnósticas*/ 

export const PRIORIDADES = {
    "30": "Urgente",
    "90": "Preferente",
  };

  /** Convierte el código de prueba (blockchain) en literal legible */
export function literalPrioridad(codigo) {
    if (codigo == null || codigo === "" || codigo === "0") {
      return "—";
    }
    // Por si en algún momento llega como número o BigNumber
    const key = String(codigo);
    return PRIORIDADES[key] ?? `Código desconocido (${key})`;
  }

  /** Lista lista para pintar options del <select> */
 export function opcionesPrioridades() {
    // Transformamos el objeto Prioridadesen un array de objetos con value y label para pintarlo en el frontend.
    return Object.entries(PRIORIDADES).map(([value, label]) => ({
      value,
      label,
    }));
  }
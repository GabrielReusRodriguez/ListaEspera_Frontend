/* Desde este modulo gestionamos la lectura y traducción de los diagnosticos */ 

export const DIAGNOSTICOS = {
    "S93.401": "Esguince de tobillo derecho",
    "S93.402": "Esguince de tobillo izquierdo",
    "J18.9": "Neumonia",
    "U07.1": "COVID-19",
    "K46.9": "Hernia inguinal",
  };

  /** Convierte el código de prueba (blockchain) en literal legible */
export function literalDiagnosticos(codigo) {
    if (codigo == null || codigo === "" || codigo === "0") {
      return "—";
    }
    // Por si en algún momento llega como número o BigNumber
    const key = String(codigo);
    return DIAGNOSTICOS[key] ?? `Código desconocido (${key})`;
  }

  /** Lista lista para pintar options del <select> */
 export function opcionesDiagnosticos() {
    // Transformamos el objeto DIAGNOSTICOS en un array de objetos con value y label para pintarlo en el frontend.
    return Object.entries(DIAGNOSTICOS).map(([value, label]) => ({
      value,
      label,
    }));
  }
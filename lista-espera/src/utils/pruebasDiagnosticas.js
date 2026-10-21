/* Desde este modulo gestionamos la lectura y traducción de pruebas diagnósticas*/

export const PRUEBAS_DIAGNOSTICAS = {
    "241634005": "RM de brazo",
    "6007000": "RM de torax",
    "2690005": "RM de pelvis",
    "241621009": "RM de abdomen",
    "58713006": "RM de musculos",
    "241649002": "RM de articulaciones",
    "241645008": "RM de columna",
    "445946004": "RM de espina",
    "1343370001": "RM de nervios",
    "241663008": "RM de vasos",
    "241611001": "RM de glandulas",
    "425559005": "RM de huesos",
  };

  /** Convierte el código de prueba (blockchain) en literal legible */
export function literalPrueba(codigo) {
    if (codigo == null || codigo === "" || codigo === "0") {
      return "—";
    }
    // Por si en algún momento llega como número o BigNumber
    const key = String(codigo);
    return PRUEBAS_DIAGNOSTICAS[key] ?? `Código desconocido (${key})`;
  }

  /** Lista lista para pintar options del <select> */
 export function opcionesPrueba() {
    // Transformamos el objeto PRuebas en un array de objetos con value y label para pintarlo en el frontend.
    return Object.entries(PRUEBAS_DIAGNOSTICAS).map(([value, label]) => ({
      value,
      label,
    }));
  }

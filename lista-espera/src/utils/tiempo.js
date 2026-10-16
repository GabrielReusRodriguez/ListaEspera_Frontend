/* GEstion de tiempo y fechas */

/* Aqui usamos export funcion en vez de la deficnion asincrona porque */
// Timestamp actual en segundos → compatible con uint256
export function hoy() {
    return Math.floor(Date.now() / 1000);
}

export function literalFecha(timestamp) {
    return new Date(timestamp * 1000).toLocaleDateString();
}

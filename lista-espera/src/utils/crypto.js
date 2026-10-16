//Ponemos export para que exista fuera del modulo y pueda ser usado en otros archivos.

export function hashea(texto) {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(texto.trim().toUpperCase()));
}
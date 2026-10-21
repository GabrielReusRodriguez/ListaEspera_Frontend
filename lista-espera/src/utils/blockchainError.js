/* Funciones para gestionar errores de la blockchain */
import { decodeError } from "@ubiquity-os/ethers-decode-error";



//       const decodedError = decodeError(error);

export function decodeBlockchainError(userMsg, error) {
    let errorMesg = "Unknown";

    console.log("decodeBlockchainError error: " + JSON.stringify(error));
    if (error.data && error.data.message) {
        errorMesg = error.data.message;
    }else {
        const _error = decodeError(error);  
        console.log("decodeBlockchainError _error: " + JSON.stringify(_error));
        errorMesg = _error.error;
    }
 
    // El  mensaje que devuelve decodeError tiene un  hexadecimal que no quiero que lo vea el usuario. Lo eliminamos.
    const cleanMsg = String(errorMesg).replace(/\s*:\s*0x[0-9a-fA-F]+$/, "");
    return (userMsg + ": " + cleanMsg);
}


/* export function decodeBlockchainError(userMsg, error) {
    
    const errorMesg = error.data && error.message ? error.data.message : "Unknown";
    // El  mensaje que devuelve decodeError tiene un  hexadecimal que no quiero que lo vea el usuario. Lo eliminamos.
    const cleanMsg = String(errorMesg).replace(/\s*:\s*0x[0-9a-fA-F]+$/, "");
    return (userMsg + ": " + cleanMsg);
}
*/
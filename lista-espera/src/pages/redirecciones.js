import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers, Contract } from "ethers";
import { decodeBlockchainError } from "../utils/blockchainError";
import ListaEsperaManifest from "../contracts/ListaEspera.json";
import { literalPrueba } from "../utils/pruebasDiagnosticas";
import { literalPrioridad } from "../utils/prioridades";
import { literalFecha } from "../utils/tiempo";

export default function Redirecciones() {

  const contractAddress = "0xEe0331C3645b4140ce8720031c5c15423e042304";

  const contract = useRef(null);
  const [listaRedirecciones, setListaRedirecciones] = useState([]);

  const mapearPrueba = (prueba) => ({
    idPrueba: prueba.idPrueba.toNumber(),
    idPaciente: prueba.idPaciente,
    diagnostico: prueba.diagnostico,
    codigoPrueba: prueba.codigoPrueba,
    centroRealizador: prueba.centroRealizador,
    timestampAlta: prueba.timestampAlta.toNumber(),
    timestampBaja: prueba.timestampBaja.toNumber(),
    maximoDiasDemora: Number(prueba.maximoDiasDemora),
    activa: prueba.activa,
    motivoDeBaja: Number(prueba.motivoDeBaja),
    centroDestinoRedireccion: prueba.centroDestinoRedireccion,
    propuestaRedireccion: prueba.propuestaRedireccion,
  });

  const configurarBlockchain = async () => {

    const provider = await detectEthereumProvider();
    if (provider) {
        await provider.request({method:"eth_requestAccounts"})

        let networkId = await provider.request({ method: "net_version" });
        console.log("Network ID:", networkId);

        console.log("Ethereum provider detected:", provider);
        let providerEthers = new ethers.providers.Web3Provider(provider);
        let signer = providerEthers.getSigner();
        // Hay que poner la address del contrato
        contract.current = new Contract(
          contractAddress,
          ListaEsperaManifest.abi,
            signer
        );
        console.log("Contract loaded:", contract.current);

    } else {
        console.error("No Ethereum provider found. Please install MetaMask or another Ethereum wallet");
    }
  };

  const getRedirecciones = async () => {
    if (!contract.current) {
      alert("Contrato no disponible. No se ha podido conectar a la blockchain.");
      return;
    }
    const listaIds = [];
    try {
      const ids = await contract.current.listaRedireccionesPendientes();
      console.log("Redirecciones pendientes:", ids);
      for (const id of ids) {
        listaIds.push(id.toNumber());
      }
    } catch (error) {
      alert(decodeBlockchainError("Error getting redirecciones", error));
      setListaRedirecciones([]);
      return;
    }

    const listaConsultadas = [];
    for (const idPrueba of listaIds) {
      try {
        const prueba = await contract.current.obtenerPruebaPorId(idPrueba);
        console.log("Prueba encontrada:", prueba);
        listaConsultadas.push(mapearPrueba(prueba));
      } catch (error) {
        alert(decodeBlockchainError("Error consultando datos de prueba", error));
        return;
      }
    }
    setListaRedirecciones(listaConsultadas);
  };

  const aceptar = async (idPrueba) => {
    if (!contract.current) {
      alert("Contrato no disponible. No se ha podido conectar a la blockchain.");
      return;
    }
    try {
      const tx = await contract.current.aceptaRedireccion(idPrueba);
      await tx.wait();
      alert("Redirección aceptada correctamente");
      await getRedirecciones();
    } catch (error) {
      alert(decodeBlockchainError("Error al aceptar la redirección", error));
    }
  };

  const rechazar = async (idPrueba) => {
    if (!contract.current) {
      alert("Contrato no disponible. No se ha podido conectar a la blockchain.");
      return;
    }
    try {
      const tx = await contract.current.rechazaRedireccion(idPrueba);
      await tx.wait();
      alert("Redirección rechazada correctamente");
      await getRedirecciones();
    } catch (error) {
      alert(decodeBlockchainError("Error al rechazar la redirección", error));
    }
  };

  useEffect(() => {
    let init = async () => {
      await configurarBlockchain();
      await getRedirecciones();
    }
    init();
  },[]);

  return (
    <main>
      <h1 className="titulo">Gestión de Redirecciones recibidas</h1>
      <Link href="/" className="nav-link">← Volver al inicio</Link>
      {listaRedirecciones.length === 0 ? (
        <p>No hay redirecciones pendientes.</p>
      ) : (
        <table className="tabla-centros">
          <thead>
            <tr>
              <th>CIP</th>
              <th>Prueba</th>
              <th>Prioridad</th>
              <th>Fecha de alta</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {listaRedirecciones.map((prueba) => (
              <tr key={prueba.idPrueba}>
                <td className="celda-address">{prueba.idPaciente}</td>
                <td>{literalPrueba(prueba.codigoPrueba)}</td>
                <td>{literalPrioridad(prueba.maximoDiasDemora)}</td>
                <td>{literalFecha(prueba.timestampAlta)}</td>
                <td className="celda-acciones">
                  <button
                    type="button"
                    className="boton"
                    onClick={() => { aceptar(prueba.idPrueba); }}
                  >
                    Aceptar
                  </button>
                  <button
                    type="button"
                    className="boton"
                    onClick={() => { rechazar(prueba.idPrueba); }}
                  >
                    Rechazar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

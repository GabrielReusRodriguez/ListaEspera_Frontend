import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers, Contract } from "ethers";
import { decodeError } from "@ubiquity-os/ethers-decode-error";
import  ListaEsperaManifest from "../contracts/ListaEspera.json";

export default function Centros() {

  const contractAddress = "0xEe0331C3645b4140ce8720031c5c15423e042304";

  const contract = useRef(null);
  const [NombreCentro, setNombreCentro] = useState("");
  const [AddressCentro, setAddressCentro] = useState("");

  //Pintaremos la lista de centros en el estado por eso ha de ser un useState
  const [centros, setCentros] = useState([]);

  const listaCentros = async () => {
      try{
        const result = await contract.current.listaCentros();
        // Convertimos el Result de ethers a un array plano para React
        //RECUERDA: ... es el operador spread ( expansion ) copia los elementos de result en un nuevo array.
        setCentros([...result]);
        console.log("Centros:", result);

      } catch (error) {
        const decodedError = decodeError(error);
        alert("Error getting centros:" + decodedError.error);
      }
    }
    

    const anyadeCentro = async () => {

      try{
        //Falta check que no esté en blanco el nombre o la address...
        if(NombreCentro === "" || AddressCentro === ""){
          alert("El nombre y la address del centro no pueden estar en blanco");
          return;
        }
        //Procedemos con las transaccion blockchain para añadir el centro
        const tx = await contract.current.creaCentro(AddressCentro, NombreCentro);
        await tx.wait();
        console.log("Centro añadido:", tx);
        //Actualizamos la lista de centros
        await listaCentros();
      } catch (error) {
        const decodedError = decodeError(error);
        alert("Error adding centro:" + decodedError.error);
      }
    };

    useEffect(() => {
        let init = async () => {
          //Cargamos el acceso a la blockchain
          await configurarBlockchain();
          listaCentros();
        }
        init();
      },[]);
    
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


  return (
    <main>
      <h1 className="titulo">Gestión de centros</h1>
      <Link href="/" className="nav-link">← Volver al inicio</Link>
        <div>
            <h2>Listado actual de centros</h2>
            <div>
                {centros.length === 0 ? (
                  <p>No hay centros registrados.</p>
                ) : (
                  <table className="tabla-centros">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Dirección</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {centros.map((centro) => (
                        <tr key={centro.direccion}>
                          <td>{centro.nombre}</td>
                          <td className="celda-address">{centro.direccion}</td>
                          <td>{centro.activo ? "Activo" : "Inactivo"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
            </div>
            <br/><br/>
            <div>
                <h2>Tambien puedes añadir un centro</h2>
                <br/>
                <div>
                    <div>Nombre del centro: <input type="text" value={NombreCentro} onChange={(e) =>setNombreCentro(e.target.value)} /></div>
                    <div>Address del centro: <input type="text" value={AddressCentro} onChange={(e) =>setAddressCentro(e.target.value)} /></div>
                    <button className="boton" onClick={() => {
                        anyadeCentro();
                        }}>Añadir centro</button>
                </div>
            </div>
        </div>
      
    </main>
  );
}
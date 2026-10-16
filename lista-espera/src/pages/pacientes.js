import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers, Contract } from "ethers";
import { decodeError } from "@ubiquity-os/ethers-decode-error";

import  ListaEsperaManifest from "../contracts/ListaEspera.json";

import { opcionesPrueba, literalPrueba } from "../utils/pruebasDiagnosticas";
import { opcionesPrioridades, literalPrioridad } from "../utils/prioridades";
import { opcionesDiagnosticos, literalDiagnosticos } from "../utils/diagnosticos";
import { hoy, literalFecha } from "../utils/tiempo";
import { hashea } from "../utils/crypto";
import { opcionesMotivosBaja, literalMotivosBaja } from "../utils/motivosBaja";

export default function Pacientes() {

  const contractAddress = "0x9Ed20A9432F1b4E80AAD77C2e0cd64DE7007293e";


  const contract = useRef(null);
  const [CIPBusqueda, setCIPBusqueda] = useState("");
  const [motivoBaja, setMotivoBaja] = useState("");
  const [centroDestino, setCentroDestino] = useState("");
  const [Alta_CIP, setAlta_CIP] = useState("");
  const [Alta_Prueba, setAlta_Prueba] = useState(""); 
  const [Alta_Diagnostico, setAlta_Diagnostico] = useState("");
  const [Alta_Prioridad, setAlta_Prioridad] = useState("");
  const [Alta_CentroRealizador, setAlta_CentroRealizador] = useState("");


    //Pintaremos la lista de centros en el estado por eso ha de ser un useState
    const [centros, setCentros] = useState([]);

    const listarCentros = async () => {
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




  const buscarPruebasPorPaciente = async ()=>{
    try{
      const CIP = hashea(CIPBusqueda);

      const pruebasPaciente = await contract.current.listaPruebasPorPaciente(CIP);
      //await tx.wait();
      console.log("Pruebas de paciente encontradas:", pruebasPaciente);
    } catch (error) {
      const decodedError = decodeError(error);
      alert("Error buscando pruebas de paciente:" + decodedError.error);
    }
  };

  const altarPrueba = async () =>{
    try{
      const CIP = hashea(CIPBusqueda);
      /*
      const tx = await contract.current.alta(
        CIP, 
        Alta_Prueba, 
        Alta_Diagnostico, 
        Alta_Prioridad, 
        Alta_CentroRealizador);
      await tx.wait();
      console.log("Prueba altaada correctamente:", tx);
      */
     console.log("Prueba altaada correctamente: " + CIP + " " + Alta_Prueba + " " + Alta_Diagnostico + " " + Alta_Prioridad + " " + Alta_CentroRealizador);
      alert("Prueba altaada correctamente: " + CIP + " " + Alta_Prueba + " " + Alta_Diagnostico + " " + Alta_Prioridad + " " + Alta_CentroRealizador);
    } catch (error) {
      const decodedError = decodeError(error);
      alert("Error alta de prueba:" + decodedError.error);
    }
  };

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

  const consultarHistorialPrueba = async (idPrueba) => {

  };

  const redireccionar = async () => {

  };

  const darDeBaja = async () => {

  };


  useEffect(() => {
    let init = async () => {
      await configurarBlockchain();
      listarCentros();
    }
    init();
  },[]);

  return (
    <main>
      <h1 className="titulo">Gestión de pacientes</h1>
      <Link href="/" className="nav-link">← Volver al inicio</Link>
      <div>
        <br/>
            <div>
              <h2>Dar de Alta paciente en la lista de espera</h2>
              <br/>
              <div className="formulario-campos">
                <div className="campo-formulario">
                  <label htmlFor="altaCIP">idPaciente:</label>
                  <input id="altaCIP" type="text" value={Alta_CIP} onChange={(e) =>setAlta_CIP(e.target.value)} />
                </div>
                <div className="campo-formulario">
                  <label htmlFor="altaPrueba">prueba:</label>
                  <select id="altaPrueba" value={Alta_Prueba} onChange={(e) => setAlta_Prueba(e.target.value)}>
                      <option value="0">Selecciona una prueba</option>
                      {opcionesPrueba().map((prueba) => (
                        <option value={prueba.value} key={prueba.value}>{prueba.label}</option>
                      ))}
                    </select>
                </div>
                <div className="campo-formulario">
                  <label htmlFor="altaDiagnostico">diagnostico:</label>
                  <select id="altaDiagnostico" value={Alta_Diagnostico} onChange={(e) => setAlta_Diagnostico(e.target.value)}>
                      <option value="0">Selecciona un diagnostico</option>
                      {
                        opcionesDiagnosticos().map((diagnostico) => (
                          <option value={diagnostico.value} key={diagnostico.value}>{diagnostico.label}</option>
                        ))
                      }
                    </select>
                </div>
                <div className="campo-formulario">
                  <label htmlFor="altaPrioridad">prioridad:</label>
                  <select id="altaPrioridad" value={Alta_Prioridad} onChange={(e) => setAlta_Prioridad(e.target.value)}>
                      <option value="0">Selecciona una prioridad</option>
                      {
                        opcionesPrioridades().map((prioridad) => (
                          <option value={prioridad.value} key={prioridad.value}>{prioridad.label}</option>
                        ))
                      }
                    </select>
                </div>
                <div className="campo-formulario">
                  <label htmlFor="altaCentroRealizador">centro realizador:</label>
                  <select id="altaCentroRealizador" value={Alta_CentroRealizador} onChange={(e) => setAlta_CentroRealizador(e.target.value)}>
                        <option value="0">Selecciona un centro realizador</option>
                        {
                          //Filtramos los centros y dejamos SOLO los que constan como activos.
                          centros.filter((centro) => centro.activo).map((centro) => (
                          <option value={centro.direccion} key={centro.direccion}>{centro.nombre}</option>
                        ))}
                    </select>
                </div>
                <button className="boton" onClick={() => {altarPrueba();}}>Dar de Alta paciente</button>
              </div>
            </div>
            <br/><br/><br/>
            <div>
              <h2>Busca paciente por CIP</h2>
              Cip : <input type="text" value={CIPBusqueda} onChange={(e) =>setCIPBusqueda(e.target.value)} />
              <button className="boton" onClick={() => {
                    alert("CIP: " + CIPBusqueda);
              }}>Buscar Paciente</button>
            </div>
            <div>
              <div>
              <h3>Paciente encontrado  ___CIP__</h3>
              <p>idPrueba: ___idPrueba__</p>
              <p>prueba: ___prueba__</p>
              <p>diagnostico: ___diagnostico__</p>
              <p>prioridad: ___prioridad__</p>
              <p>centro realizador: ___centro realizador__</p>
              <p>fecha de alta: ___fecha de alta__</p>
              <p>fecha de baja: ___fecha de baja__</p>
              <p>motivo de baja: ___motivo de baja__</p>
              <p>Se ha solicitado redireccion al centor: </p>
              </div>
              <br/>
              <div><h3>Historico de cambios</h3>
                <ul>
                  <li>Alta de paciente - 22/02/1982 a las 14:50</li>
                  <li>Redireccion a centro - 22/02/1982 a las 14:51</li>
                  <li>Baja de la lista  - 22/02/1982 a las 14:51 - Motivo: se realiza la operacion</li>
                </ul>
              </div>
              <br/>
              <div>
                <h3>Acciones</h3>
                <br/>
                <div>
                  Dar de baja<br/>
                  Motivo: <select id="motivoBaja" value={motivoBaja} onChange={(e) => setMotivoBaja(e.target.value)}>
                   <option value="0">Selecciona un motivo de baja</option>
                    {
                      opcionesMotivosBaja().map((motivo) => (
                        <option value={motivo.value} key={motivo.value}>{motivo.label}</option>
                      ))
                    }
                  </select>
                  <button className="boton" onClick={() => { darDeBaja();}}>Dar de Baja paciente</button>
                </div>
                <br/><br/>
                <div>Redireccionar a centro__<br/>
                Nuevo centro destino: <select id="centroDestino" value={centroDestino} onChange={(e) => setCentroDestino(e.target.value)}>
                      <option value="0">Selecciona un centro destino</option>
                      {
                        //Filtramos los centros y dejamos SOLO los que constan como activos.
                        centros.filter((centro) => centro.activo).map((centro) => (
                        <option value={centro.direccion} key={centro.direccion}>{centro.nombre}</option>
                      ))}
                  </select>
                  <button className="boton" onClick={() => {redireccionar();}}>Redireccionar a centro</button>
                </div>
              </div>
            </div>

      </div>
    </main>
  );
}
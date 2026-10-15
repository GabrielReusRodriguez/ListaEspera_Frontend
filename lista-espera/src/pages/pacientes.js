import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers, Contract } from "ethers";
import { decodeError } from "@ubiquity-os/ethers-decode-error";


export default function Pacientes() {

  /*
  <input type="text" value={addressTo} onChange={(e) => setAddressTo(e.target.value)} />
  */

/*
//Ejemplo apuntes
    const myContractApplication = useRef(null);
    const myContractToken = useRef(null);

  useEffect(() => {
    let init = async () => {
       await configurarBlockchain();
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
        // Hay que poner la address del contrato voteToken
        myContractToken.current = new Contract(
            "0x40b33f5q31dasfasda67b",
            lotteryTicketManifest.abi,
            signer
        );
        console.log("Contract Token loaded:", myContractToken.current);

        // Hay que poner la address del contrato voteToken
        myContractApplication.current = new Contract(
            "0x60b33f5q31dasfasda67b",
            lotetryAppManifest.abi,
            signer
        );
        console.log("Contract Applciation loaded:", myContractApplication.current);
        

    } else {
        console.error("No Ethereum provider found. Please install MetaMask or another Ethereum wallet");
    }
}
*/

const [CIPBusqueda, setCIPBusqueda] = useState("");
const [motivoBaja, setMotivoBaja] = useState("");
const [centroDestino, setCentroDestino] = useState("");
const [Alta_CIP, setAlta_CIP] = useState("");
const [Alta_Prueba, setAlta_Prueba] = useState(""); 
const [Alta_Diagnostico, setAlta_Diagnostico] = useState("");
const [Alta_Prioridad, setAlta_Prioridad] = useState("");
const [Alta_CentroRealizador, setAlta_CentroRealizador] = useState("");

  useEffect(() => {
    let init = async () => {
      await configurarBlockchain();
    }
    init();
  },[]);

  const configurarBlockchain = async () => {};

  return (
    <main>
      <h1 className="titulo">Gestión de pacientes</h1>
      <Link href="/" className="nav-link">← Volver al inicio</Link>
      <div>
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
                    <option value="1">Se realiza la operacion</option>
                    <option value="2">Exitus</option>
                  </select>
                  <button className="boton" onClick={() => {alert("Dar de Baja");}}>Dar de Baja paciente</button>
                </div>
                <br/><br/>
                <div>Redireccionar a centro__<br/>
                Motivo: <select id="centroDestino" value={centroDestino} onChange={(e) => setCentroDestino(e.target.value)}>
                    <option value="1">Hospital Dos de Mayo</option>
                    <option value="2">Hospital de Bellvitge</option>
                  </select>
                  <button className="boton" onClick={() => {alert("Redireccionar a centro");}}>Redireccionar a centro</button>
                </div>
              </div>
            </div>

      </div>
      <br/>
      <div>
            <h2>Dar de Alta paciente en la lista de espera</h2>
            <div>
              <div>idPaciente: <input type="text" value={Alta_CIP} onChange={(e) =>setAlta_CIP(e.target.value)} /></div>
              <div>prueba: <select id="altaPrueba" value={Alta_Prueba} onChange={(e) => setAlta_Prueba(e.target.value)}>
                    <option value="1">RM de brazo</option>
                    <option value="2">RM de torax</option>
                    <option value="3">RM de pelvis</option>
                    <option value="4">RM de abdomen</option>
                    <option value="5">RM de musculos</option>
                    <option value="6">RM de articulaciones</option>
                    <option value="7">RM de columna</option>
                    <option value="8">RM de espina</option>
                    <option value="9">RM de nervios</option>
                    <option value="10">RM de vasos</option>
                    <option value="11">RM de glandulas</option>
                    <option value="12">RM de tejidos blandos</option>
                    <option value="13">RM de huesos</option>
                    <option value="14">RM de cartilago</option>
                    <option value="15">RM de ligamentos</option>
                    <option value="16">RM de discos</option>
                  </select>
              </div>
              <div>diagnostico: <select id="altaDiagnostico" value={Alta_Diagnostico} onChange={(e) => setAlta_Diagnostico(e.target.value)}>
                    <option value="S93.401">Esguince de tobillo derecho</option>
                    <option value="S93.402">Esguince de tobillo izquierdo</option>
                    <option value="J18.9">Neumonia</option>
                    <option value="U07.1">COVID-19</option>
                    <option value="K46.9">Hernia inguinal</option>
                  </select>
              </div>
              <div>prioridad: <select id="altaPrioridad" value={Alta_Prioridad} onChange={(e) => setAlta_Prioridad(e.target.value)}>
                    <option value="30">Urgente</option>
                    <option value="90">Preferente</option>
                  </select>
              </div>
              <div>centro realizador: <select id="altaCentroRealizador" value={Alta_CentroRealizador} onChange={(e) => setAlta_CentroRealizador(e.target.value)}>
                    <option value="1">Hospital Dos de Mayo</option>
                    <option value="2">Hospital de Bellvitge</option>
                  </select></div>
              <button className="boton" onClick={() => {alert("Dar de Alta paciente");}}>Dar de Alta paciente</button>
            </div>
      </div>
    </main>
  );
}
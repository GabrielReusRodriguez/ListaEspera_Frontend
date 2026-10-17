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
  // Pintaremos la lista de centros en el estado por eso ha de ser un useState
  const [centros, setCentros] = useState([]);
   
  // Lista de PruebaDiagnostica (misma forma que el struct de Solidity) para pintar y refrescar
  const [listaPruebas, setListaPruebas] = useState([]);

  // Prueba seleccionada para mostrar en el modal (pop up)
  const [pruebaSeleccionada, setPruebaSeleccionada] = useState(null);

  // Prueba cuyo histórico se muestra en el modal de histórico
  // Estado para la prueba seleccionada para mostrar en el modal (pop up)
  const [pruebaHistorial, setPruebaHistorial] = useState(null);
  // Estado para el historial de la prueba seleccionada
  const [historial, setHistorial] = useState([]);
  // Estado para indicar si se está cargando el historial
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Flag: true solo tras una búsqueda correcta (si es false, no mostramos resultados ni el mensaje vacío)
  const [busquedaValida, setBusquedaValida] = useState(false);

  /* FUNCIONES AUXILIARES ****************************************************************
  */
  //Funcion para mapear la struct de Solidity a un objeto JS plano para React
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

  // Funcion para obtener el nombre de un centro a partir de su address
  const nombreCentro = (address) => {
    if (!address || address === ethers.constants.AddressZero) return "—";
    const centro = centros.find(
      (c) => c.direccion.toLowerCase() === address.toLowerCase()
    );
    return centro ? centro.nombre : address;
  };

  // Funcion para listar los centros de salud
  const listarCentros = async () => {
    try {
      const result = await contract.current.listaCentros();
      // Convertimos el Result de ethers a un array plano para React
      // RECUERDA: ... es el operador spread (expansion) copia los elementos de result en un nuevo array.
      setCentros([...result]);
      console.log("Centros:", result);
    } catch (error) {
      const decodedError = decodeError(error);
      alert("Error getting centros:" + decodedError.error);
    }
  };

  const buscarPruebasPorPaciente = async () => {
    // Busco los ids de pruebas de ese paciente.
    const listaIdsPruebas = [];
    try {
      if (CIPBusqueda == "") {
        alert("El campo CIP es obligatorio");
        setBusquedaValida(false);
        setListaPruebas([]);
        return;
      }

      const CIP = hashea(CIPBusqueda);
      const pruebasPaciente = await contract.current.listaPruebasPorPaciente(CIP);
      console.log("Pruebas de paciente encontradas:", pruebasPaciente);
      for (const id of pruebasPaciente) {
        listaIdsPruebas.push(id.toNumber());
      }
    } catch (error) {
      const decodedError = decodeError(error);
      alert("Error buscando pruebas de paciente:" + decodedError.error);
      setBusquedaValida(false);
      setListaPruebas([]);
      return;
    }
    // Para cada id, consulto la struct completa y la guardo en estado
    const listaPruebasConsultadas = [];
    for (const idPrueba of listaIdsPruebas) {
      try {
        const prueba = await contract.current.obtenerPruebaPorId(idPrueba);
        console.log("Prueba encontrada:", prueba);
        listaPruebasConsultadas.push(mapearPrueba(prueba));
      } catch (error) {
        const decodedError = decodeError(error);
        alert("Error consultando datos de prueba:" + decodedError.error);
      }
    }
    //Consideramos que la busqueda es valida.
    setBusquedaValida(true);
    setListaPruebas(listaPruebasConsultadas);
  };


  const checkAltaData = () => {
    if (Alta_CIP == "") {
      alert("El campo CIP es obligatorio");
      return false;
    }
    if (Alta_Prueba == "0") {
      alert("El campo prueba es obligatorio");
      return false;
    }
    if (Alta_Diagnostico == "0") {
      alert("El campo diagnostico es obligatorio");
      return false;
    }
    if (Alta_Prioridad == "0") {
      alert("El campo prioridad es obligatorio");
      return false;
    }
    if (Alta_CentroRealizador == "0") {
      alert("El campo centro realizador es obligatorio");
      return false;
    }
    return true;
  };

  const resetAltaData = () => {
    setAlta_CIP("");
    setAlta_Prueba("0");
    setAlta_Diagnostico("0");
    setAlta_Prioridad("0");
    setAlta_CentroRealizador("0");
  };

  const altarPrueba = async () =>{
    try{
      if (!checkAltaData()) {
        return;
      }
      const CIP = hashea(Alta_CIP);
      const tx = await contract.current.alta(
        CIP, 
        Alta_Prueba, 
        Alta_Diagnostico, 
        Alta_Prioridad, 
        hoy());
      await tx.wait();
      
      //console.log("Prueba altaada correctamente:", tx);
      console.log("Prueba altaada correctamente: " + CIP + " " + literalPrueba(Alta_Prueba) + " " + literalDiagnosticos(Alta_Diagnostico) + " " + literalPrioridad(Alta_Prioridad) + " " + Alta_CentroRealizador);
      alert("Prueba altaada correctamente: " + CIP + " " + Alta_Prueba + " " + Alta_Diagnostico + " " + Alta_Prioridad + " " + Alta_CentroRealizador);
      resetAltaData();
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

  /* FUNCIONES PARA EL MODAL DE HISTORIAL ****************************************************************
  */
  // Funcion para cerrar el modal de histórico
  const consultarHistorialPrueba = async (idPrueba) => {
      //Creamos un nuevo array de eventos pero con los datos formateados para visualizarse.
  };

  const redireccionar = async () => {

  };

  const darDeBaja = async () => {

  };

  /* useEffect para configurar la blockchain y listar los centros ********************************
  */
  useEffect(() => {
    let init = async () => {
      await configurarBlockchain();
      listarCentros();
    }
    init();
  },[]);

  /* Renderizado del componente ****************************************************************
  */
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
                  <label htmlFor="altaCIP">CIP:</label>
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
                    buscarPruebasPorPaciente()
              }}>Buscar Paciente</button>
            </div>

            <div>
                
                {
                // Si no se ha hecho una busqueda correcta, no mostramos nada.
                //En caso que se haya hecho... miramos la longitud de la lista de pruebas.
                //Usamos un fragment <> para no añadir un div extra.
                !busquedaValida ? null : listaPruebas.length === 0 ? (
                  <p>No hay pruebas para este CIP.</p>
                ) : (
                  <>  
                  <h3>Pruebas del paciente</h3>
                  <table className="tabla-centros">
                    <thead>
                      <tr>
                        <th>Prueba</th>
                        <th>Diagnóstico</th>
                        <th>Prioridad</th>
                        <th>Centro realizador</th>
                        <th>Fecha de alta</th>
                        <th>Fecha de baja</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...listaPruebas]
                        .sort((a, b) => a.timestampAlta - b.timestampAlta)
                        .map((prueba) => (
                          <tr key={prueba.idPrueba}>
                            <td>{literalPrueba(prueba.codigoPrueba)}</td>
                            <td>{literalDiagnosticos(prueba.diagnostico)}</td>
                            <td>{literalPrioridad(prueba.maximoDiasDemora)}</td>
                            <td>{nombreCentro(prueba.centroRealizador)}</td>
                            <td>{literalFecha(prueba.timestampAlta)}</td>
                            <td>
                              {prueba.timestampBaja
                                ? literalFecha(prueba.timestampBaja)
                                : "—"}
                            </td>
                            <td className="celda-acciones">
                              <button type="button" className="boton" onClick={() => { setPruebaSeleccionada(prueba); }}>Gestionar</button>
                              <button type="button" className="boton" onClick={() => { setPruebaSeleccionada(prueba); }}>Historico</button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  </>
                )}
            </div>

            {
              /* Modal para mostrar los datos de la prueba ****************************************************************
              */
              pruebaSeleccionada && (
              <div
                className="modal-overlay"
                onClick={() => setPruebaSeleccionada(null)}  // clic fuera → cierra
              >
                <div
                  className="modal-contenido"
                  onClick={(e) => e.stopPropagation()}       // clic dentro → no cierra
                >
                  <div className="modal-cerrar">
                    <button
                      type="button"
                      className="boton"
                      onClick={() => setPruebaSeleccionada(null)}
                    >
                      Cerrar
                    </button>
                  </div>
                  {/* Aquí mueves el bloque que ya tienes abajo:
                      datos de la prueba + histórico + baja + redirección */}
                  <h3>Detalle de la prueba</h3>
                  <p>idPrueba: {pruebaSeleccionada.idPrueba}</p>
                  <p>CIP: {CIPBusqueda}</p>
                  <p>Prueba: {literalPrueba(pruebaSeleccionada.codigoPrueba)}</p>
                  <p>Diagnostico: {literalDiagnosticos(pruebaSeleccionada.diagnostico)}</p>
                  <p>Prioridad: {literalPrioridad(pruebaSeleccionada.maximoDiasDemora)}</p>
                  <p>Centro realizador: {nombreCentro(pruebaSeleccionada.centroRealizador)}</p>
                  <p>Fecha de alta: {literalFecha(pruebaSeleccionada.timestampAlta)}</p>
                  {
                    //Bloque de las bajas
                    pruebaSeleccionada.timestampBaja != 0 && (
                      <>
                        <p>Fecha de baja: {literalFecha(pruebaSeleccionada.timestampBaja)}</p>
                        <p>Motivo de baja: {literalMotivosBaja(pruebaSeleccionada.motivoDeBaja)}</p>
                      </>
                    )
                  }
                  {
                    //Bloque de la redireccion
                    pruebaSeleccionada.propuestaRedireccion && (
                      <>
                        <p>Propuesta de redireccion al centro: {nombreCentro(pruebaSeleccionada.propuestaRedireccion)}</p>
                      </>
                    )
                  }
                  <br/>
                  <div>
                    <h3>Dar de baja</h3>
                    <p>Motivo de baja: <select id="motivoBaja" value={motivoBaja} onChange={(e) => setMotivoBaja(e.target.value)}>
                      <option value="0">Selecciona un motivo de baja</option>
                      {
                        opcionesMotivosBaja().map((motivo) => (
                          <option value={motivo.value} key={motivo.value}>{motivo.label}</option>
                        ))
                      }
                    </select>
                    <button className="boton" onClick={darDeBaja()}>Dar de baja</button>
                    </p>
                  </div>
                  <div>
                    <h3>Redireccionar</h3>
                    <p>Centro destino: <select id="centroDestino" value={centroDestino} onChange={(e) => setCentroDestino(e.target.value)}>
                      <option value="0">Selecciona un centro destino</option>
                      {
                        centros.filter((centro) => centro.activo).map((centro) => (
                          <option value={centro.direccion} key={centro.direccion}>{centro.nombre}</option>
                        ))
                      }
                    </select>
                    <button className="boton" onClick={redireccionar()}>Redireccionar</button>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal para mostrar EL HISTORIAL de la prueba ****************************************************************
              */}
      </div>
    </main>
  );
}
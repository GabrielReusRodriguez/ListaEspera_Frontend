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
import { decodeBlockchainError } from "../utils/blockchainError";

export default function Pacientes() {

//  const contractAddress = "0x9Ed20A9432F1b4E80AAD77C2e0cd64DE7007293e";
  const contractAddress = "0xEe0331C3645b4140ce8720031c5c15423e042304";


  const contract = useRef(null);
  const contractRead = useRef(null);
  const [CIPBusqueda, setCIPBusqueda] = useState("");
  const [motivoBaja, setMotivoBaja] = useState("0");
  const [centroDestino, setCentroDestino] = useState("");
  const [Alta_CIP, setAlta_CIP] = useState("");
  const [Alta_Prueba, setAlta_Prueba] = useState("0"); 
  const [Alta_Diagnostico, setAlta_Diagnostico] = useState("0");
  const [Alta_Prioridad, setAlta_Prioridad] = useState("0");
  const [Alta_CentroRealizador, setAlta_CentroRealizador] = useState("0");
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
  // Porcentaje de bloques leídos al consultar el histórico (0–100)
  const [progresoHistorial, setProgresoHistorial] = useState(0);

  // Flag: true solo tras una búsqueda correcta (si es false, no mostramos resultados ni el mensaje vacío)
  const [busquedaValida, setBusquedaValida] = useState(false);

  // Address de la cartera MetaMask conectada
  const [cuentaConectada, setCuentaConectada] = useState("");

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

  // Comprueba si la wallet conectada es el centro realizador de la prueba
  const esCentroRealizador = (prueba) => {
    if (!cuentaConectada || !prueba?.centroRealizador) return false;
    return (
      cuentaConectada.toLowerCase() === prueba.centroRealizador.toLowerCase()
    );
  };

  // Funcion para listar los centros de salud
  const listarCentros = async () => {
    if (!contract.current) {
      alert("Contrato no disponible. No se ha podido conectar a la blockchain.");
      return;
    }
    try {
      const result = await contract.current.listaCentros();
      // Convertimos el Result de ethers a un array plano para React
      // RECUERDA: ... es el operador spread (expansion) copia los elementos de result en un nuevo array.
      setCentros([...result]);
      console.log("Centros:", result);
    } catch (error) {
      alert(decodeBlockchainError("Error getting centros ", error));
      return;
    }
  };

  const buscarPruebasPorPaciente = async () => {
    if (!contract.current) {
      alert("Contrato no disponible. No se ha podido conectar a la blockchain.");
      return;
    }
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
      alert(decodeBlockchainError("Error buscando pruebas de paciente", error));
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
        alert(decodeBlockchainError("Error consultando datos de prueba", error));
        return;
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
    if (!contract.current) {
      alert("Contrato no disponible. No se ha podido conectar a la blockchain.");
      return;
    }
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
      console.log("Prueba dada de alta correctamente: " + CIP + " " + literalPrueba(Alta_Prueba) + " " + literalDiagnosticos(Alta_Diagnostico) + " " + literalPrioridad(Alta_Prioridad) + " " + Alta_CentroRealizador);
      alert("Prueba dada de alta correctamente: " + CIP + " " + Alta_Prueba + " " + Alta_Diagnostico + " " + Alta_Prioridad + " " + Alta_CentroRealizador);
      resetAltaData();
    } catch (error) {
      /*
      const decodedError = decodeError(error);
      const errMsg  =  error.data.message ? error.data.message : "Unknown";
      alert("Error alta de prueba:" + decodedError.error + " " + errMsg);
      */
      console.log(decodeBlockchainError("Error alta de prueba", error));
      alert(decodeBlockchainError("Error alta de prueba", error));
      return;
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

        const address = await signer.getAddress();
        setCuentaConectada(address);
        console.log("Cuenta conectada:", address);

        /* Actualizar address si el usuario cambia de cuenta en MetaMask
          Usamos un listener (on) para que cuando el usuario cambie de cuenta en MetaMask, se actualice la address de la cuenta conectada.
        */
        provider.removeAllListeners?.("accountsChanged");
        provider.on("accountsChanged", (accounts) => {
          setCuentaConectada(accounts[0] || "");
          console.log("Cuenta cambiada:", accounts[0]);
        });

        // Hay que poner la address del contrato
        contract.current = new Contract(
          contractAddress,
          ListaEsperaManifest.abi,
            signer
        );
        console.log("Contract loaded:", contract.current);

        //Cargamos el contrato de lectura
        // 2. NUEVO: Proveedor RPC dedicado (Alchemy/Infura) SOLO para LEER eventos
        // Esto evita por completo el error -32603 en el queryFilter
        //https://bnb-mainnet.g.alchemy.com/v2/alch_NrZ2l0TpAOtqtc2JNShmA
        //https://rpc.ankr.com/bsc_testnet_chapel/1ae99a4e043e9b1c9a8f9ade307676bbd6b08e4097083a791fddb3e640e6240f
        let readProvider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/bsc_testnet_chapel/1ae99a4e043e9b1c9a8f9ade307676bbd6b08e4097083a791fddb3e640e6240f");

        // 3. Contrato para LEER eventos y datos
        contractRead.current = new ethers.Contract(
            contractAddress,
            ListaEsperaManifest.abi,
            readProvider
        );

    } else {
        console.error("No Ethereum provider found. Please install MetaMask or another Ethereum wallet");
    }
  };

  /* FUNCIONES PARA EL MODAL DE HISTORIAL ****************************************************************
  */
  const cerrarHistorial = () => {
    setPruebaHistorial(null);
    setHistorial([]);
    setCargandoHistorial(false);
    setProgresoHistorial(0);
  };

  // Consulta los logs de la blockchain de una prueba y los formatea para el modal
  const consultarHistorialPrueba = async (prueba) => {
    // URL de consula manual: https://testnet.bscscan.com
    setCargandoHistorial(true);
    setProgresoHistorial(0);
    setHistorial([]);
    try {
      if (!contractRead.current) {
        alert("Contrato no disponible. Espera a que MetaMask conecte.");
        setCargandoHistorial(false);
        return;
      }

      const provider = contractRead.current.provider;
      const idPrueba = prueba.idPrueba;

      // El RPC (BSC/MetaMask) no permite barrer ~137M bloques desde 0.
      // Acotamos desde un poco antes del timestamp de alta de la prueba.
      const TAMANO_SEGMENTO = 3000;
      // Espera entre cada queryFilter (ms) para no saturar el RPC
      const DELAY_ENTRE_QUERIES_MS = 1000;
      const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      const toBlock = await provider.getBlockNumber();
      // 137548856
      /*
        Truco para acelerar, partimos del bloque 137760932 que es el bloque que consta en https://testnet.bscsc donde se registro el deploy del contrato.
      */
      const fromBlock = 137760932;
      //const fromBlock = 137548855;
      console.log("Histórico bloques:", { fromBlock, toBlock, idPrueba });

      // Todos los eventos tienen pruebaID como 1.er indexed → basta filtrar por ese topic.
      // topics[0] = null (cualquier firma de evento); topics[1] = pruebaID.
      const iface = contractRead.current.interface;
      const topicPruebaId = ethers.utils.hexZeroPad(
        ethers.BigNumber.from(idPrueba).toHexString(),
        32
      );

      const totalBloques = Math.max(1, toBlock - fromBlock + 1);
      const todos = [];
      let primeraQuery = true;
      for (let desde = fromBlock; desde <= toBlock; desde += TAMANO_SEGMENTO) {
        const hasta = Math.min(desde + TAMANO_SEGMENTO - 1, toBlock);
        if (!primeraQuery) {
          await esperar(DELAY_ENTRE_QUERIES_MS);
        }
        primeraQuery = false;

        const logs = await provider.getLogs({
          address: contractAddress,
          fromBlock: desde,
          toBlock: hasta,
          topics: [null, topicPruebaId],
        });
        console.log("Logs encontrados:", logs);
        const evs = logs.map((log) => {
          const parsed = iface.parseLog(log);
          return {
            event: parsed.name,
            args: parsed.args,
            blockNumber: log.blockNumber,
            logIndex: log.logIndex,
            transactionHash: log.transactionHash,
          };
        });
        console.log(
          "Eventos encontrados:",
          evs.length,
          " desde el bloque: ",
          desde,
          " hasta el bloque: ",
          hasta
        );
        todos.push(...evs);

        const bloquesLeidos = hasta - fromBlock + 1;
        setProgresoHistorial(
          Math.min(100, Math.round((bloquesLeidos / totalBloques) * 100))
        );
      }

      // Más antiguo → más reciente (blockNumber, y logIndex como desempate)
      todos.sort((a, b) => {
        if (a.blockNumber !== b.blockNumber) return a.blockNumber - b.blockNumber;
        return a.logIndex - b.logIndex;
      });

      // Timestamps de bloque solo para eventos que no los traen en el log
      const bloquesCache = {};
      /* Hacemos un diccionario clave, valor ( numero bloque, fecha formateda) ya que los eventos no llevan la fecha.
        Los  eventos no llevan la fecha, solo el numero de bloque por lo que hay que pedirla al bloque.
      */
      const timestampDeBloque = async (blockNumber) => {
        if (bloquesCache[blockNumber] != null) return bloquesCache[blockNumber];
        const block = await contractRead.current.provider.getBlock(blockNumber);
        bloquesCache[blockNumber] = block.timestamp;
        return block.timestamp;
      };

      const eventosFormateados = await Promise.all(
        todos.map(async (ev) => {
          const tipo = ev.event;
          const args = ev.args;
          let timestamp = null;
          let detalle = "";

          timestamp = await timestampDeBloque(ev.blockNumber);
          if (tipo === "Alta") {
            detalle = [
              `Centro realizador: ${nombreCentro(args[2])}`,
              `Fecha de Alta: ${literalFecha(args[3].toNumber())}`
            ].join(" · ");
          } else if (tipo === "Baja") {
            console.log("Baja: " + args + "args[1]: " + args[1]);
            detalle = [
              `Motivo: ${literalMotivosBaja(args[3])}, 
               Fecha de Baja: ${literalFecha(args[2].toNumber())}`
              ].join(" · ");
          } else if (
            tipo === "CreaRedireccion" ||
            tipo === "AceptaRedireccion" ||
            tipo === "RechazaRedireccion"
          ) {
            console.log("CreaRedireccion: " + args );
            detalle = `Centro destino: ${nombreCentro(args[2])}`;
          }

          return {
            tipo,
            timestamp,
            detalle,
            blockNumber: ev.blockNumber,
            logIndex: ev.logIndex,
            txHash: ev.transactionHash,
          };
        })
      );

      setHistorial(eventosFormateados);
    } catch (error) {
      alert(decodeBlockchainError("Error consultando histórico", error));
      console.log(decodeBlockchainError("Error consultando histórico", error));
      setHistorial([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const tituloEvento = (tipo) => {
    switch (tipo) {
      case "Alta":
        return "Alta en lista de espera";
      case "Baja":
        return "Baja de la prueba";
      case "CreaRedireccion":
        return "Propuesta de redirección";
      case "AceptaRedireccion":
        return "Redirección aceptada";
      case "RechazaRedireccion":
        return "Redirección rechazada";
      default:
        return tipo;
    }
  };

  /* FUNCION PARA REDIRECCIONAR UNA PRUEBA ****************************************************************
  */
  const redireccionar = async (idPrueba) => {
    if (!contract.current) {
      alert("Contrato no disponible. No se ha podido conectar a la blockchain.");
      return;
    }
    if (centroDestino == "0") {
      alert("El campo centro destino es obligatorio");
      return;
    }
    try{
      const tx = await contract.current.creaRedireccion(
        idPrueba,
        centroDestino
      );
      await tx.wait();
      alert("Prueba redirecionada correctamente");
    } catch (error) {
      alert(decodeBlockchainError("Error al redirecionar la prueba", error));
    }
    finally {
      setCentroDestino("0");
    }
  };


  /* FUNCION PARA DAR DE BAJA UNA PRUEBA ****************************************************************
  */
  const darDeBaja = async (idPrueba) => {
    if (!contract.current) {
      alert("Contrato no disponible. No se ha podido conectar a la blockchain.");
      return;
    }
    if (motivoBaja == "0") {
      alert("El campo motivo de baja es obligatorio");
      return false;
    }

    try{

      /*
        uint256 _idPrueba,
        uint256 _timestampBaja, 
        uint16 _motivoDeBaja

      */
      const tx = await contract.current.baja(
        idPrueba,
        hoy(),
        motivoBaja
      );
      await tx.wait();
      alert("Prueba dada de baja correctamente: " + CIPBusqueda + " " + motivoBaja);
      //Reseteamos los datos del formulario
      resetBajaData();
      // Acualizamos la lista de pruebas del paciente
      await buscarPruebasPorPaciente();
      // Cerramos el modal de la prueba seleccionada.
      setPruebaSeleccionada(null);
    } catch (error) {
      alert(decodeBlockchainError("Error al dar de baja a la prueba ", error));
      return;
    }

  };

  /* Funcion para resetear los datos de la baja */
  const resetBajaData = () => {
    setMotivoBaja("0");
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
                              { prueba.activa&& (
                                <button type="button" className="boton" onClick={() => { setPruebaSeleccionada(prueba); }}>Gestionar</button>
                              )}
                              <button
                                type="button"
                                className="boton"
                                onClick={() => {
                                  setPruebaHistorial(prueba);
                                  consultarHistorialPrueba(prueba);
                                }}
                              >
                                Historico
                              </button>
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
                        <p>Propuesta de redireccion al centro: {nombreCentro(pruebaSeleccionada.centroDestinoRedireccion)}</p>
                      </>
                    )
                  }
                  <br/>
                  {
                  // Solo mostramos las opciones en caso que seas el centro realizador.
                  esCentroRealizador(pruebaSeleccionada) ? (
                    <>
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
                        <button className="boton" onClick={() => {darDeBaja(pruebaSeleccionada.idPrueba)}}>Dar de baja</button>
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
                        <button className="boton" onClick={() => {redireccionar(pruebaSeleccionada.idPrueba)}}>Redireccionar</button>
                        </p>
                      </div>
                    </>
                  ) : (
                    <p>Solo el centro realizador puede gestionar esta prueba.</p>
                  )}
                </div>
              </div>
            )}

            {/* Modal para mostrar EL HISTORIAL de la prueba ****************************************************************
              */}
            {pruebaHistorial && (
              <div className="modal-overlay" onClick={cerrarHistorial}>
                <div
                  className="modal-contenido modal-historial"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-cerrar">
                    <button type="button" className="boton" onClick={cerrarHistorial}>
                      Cerrar
                    </button>
                  </div>
                  <h3>Histórico de la prueba</h3>
                  <p>
                    {literalPrueba(pruebaHistorial.codigoPrueba)} · {literalDiagnosticos(pruebaHistorial.diagnostico)} · {literalPrioridad(pruebaHistorial.maximoDiasDemora)} · id{" "}
                    {pruebaHistorial.idPrueba}
                  </p>
                  {cargandoHistorial ? (
                    <p>
                      Leyendo bloques de la blockchain… {progresoHistorial}%
                    </p>
                  ) : historial.length === 0 ? (
                    <p>No hay eventos registrados para esta prueba.</p>
                  ) : (
                    <ol className="lista-historial">
                      {historial.map((evento) => (
                        <li
                          key={`${evento.txHash}-${evento.logIndex}`}
                          className="item-historial"
                        >
                          <div className="item-historial-cabecera">
                            <strong>{tituloEvento(evento.tipo)}</strong>
                            <span>
                              {evento.timestamp
                                ?  literalFecha(evento.timestamp)
                                : "—"}
                            </span>
                          </div>
                          {evento.detalle && <p>{evento.detalle}</p>}
                          <p className="item-historial-meta">
                            Bloque {evento.blockNumber}
                          </p>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            )}
      </div>
    </main>
  );
}
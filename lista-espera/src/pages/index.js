//import { useState } from "react";
import Link from "next/link";

export default function App() {
    //la variable es contador y el metodo para actualizarlo es setContador.
    //el parametro de useState 0 es el valor inicial.
    // a partir de ahora no hay q ue hace contador = 1 si no setContador(1) para que react se de cuenta y actualice la interface
  /*const [contador, setContador] = useState(0);

  const incrementar = () => {
    setContador(contador + 1)
  };

  return (
    <div>
      <p>Has hecho clic {contador} veces</p>
      <button onClick={incrementar}>Sumar</button>
    </div>
  );
  */
  /*
    NOTAS: main es el tag html que define el contenido principal de la pagina.
    Para generar los enlaces usamos Link del framework next.js
  
  */

/*
  NOTAS: 
  npm run dev para ejecutar en modo debv ( se actualiza al grabar)
  npm run build  para compilar
  npm run start para arrancar el compilado.
*/


  return (

    <main>
      <h1 className="titulo">Lista de espera</h1>
      <aside className="disclaimer" role="note">
        <strong>DISCLAIMER:</strong> Esto es una prueba de concepto para la gestión de la lista de espera de pacientes en un centro de salud. No es una aplicación oficial y no debe ser usada para fines sanitarios.
        <br />
        <strong>ESTA APLICACION NO CONECTA CON NINGUN REPOSITORIO DE DATOS DE ENTIDADES SANITARIAS.</strong> Todos los datos son inventados para la prueba de concepto.
      </aside>
      <div>
        <Link href="/centros" className="nav-link">Gestion de Centros</Link><br />
        <Link href="/pacientes" className="nav-link">Gestion de Pacientes</Link> <br />
        <Link href="/redirecciones" className="nav-link">Gestion de Redirecciones recibidas</Link><br />
      </div>
      <br/>
      <footer>Autor: Gabriel Reus Rodriguez (uo316719) para el proyecto final de la Microcredencial Universitaria: Tecnologías Blockchain, Contratos Inteligentes, Aplicaciones Descentralizadas y la Web 3.0 (MICROCREDENCIAL) de la Universidad de Oviedo </footer>
    </main>
    
  );
}
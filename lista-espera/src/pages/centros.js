import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers, Contract } from "ethers";
import { decodeError } from "@ubiquity-os/ethers-decode-error";


export default function Centros() {

    useEffect(() => {
        let init = async () => {
          await configurarBlockchain();
        }
        init();
      },[]);
    
      const configurarBlockchain = async () => {};



  return (
    <main>
      <h1 className="titulo">Gestión de centros</h1>
      <Link href="/" className="nav-link">← Volver al inicio</Link>
      {
        <div>
            <h2>Listado actual de centros</h2>
            <div>
                <ul></ul>
            </div>
            <div>
                <h2>Tambien puedes añadir un centro</h2>
                <button onClick={() => {
                    setMostrarFormulario(true);
                    }}>Añadir centro</button>
            </div>
        </div>
      }
      
    </main>
  );
}
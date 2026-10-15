import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers, Contract } from "ethers";
import { decodeError } from "@ubiquity-os/ethers-decode-error";


export default function Redirecciones() {

  useEffect(() => {
    let init = async () => {
      await configurarBlockchain();
    }
    init();
  },[]);

  const configurarBlockchain = async () => {};


  return (
    <main>
      <h1 className="titulo">Gestión de Redirecciones recibidas</h1>
      <Link href="/" className="nav-link">← Volver al inicio</Link>
      {/* Aquí el contenido de la página */}
    </main>
  );
}
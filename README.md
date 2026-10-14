# ListaEspera_Frontend
Prueba de concepto del frontend de una lista de espera en blockchain.

## Entorno de desarrollo

El proyecto se ejecuta dentro de un Dev Container con Node.js 22. La imagen instala `create-next-app`. El contenedor monta la **raíz del repositorio**; ahí vive la app Next.js.

No hace falta instalar Node ni dependencias en el host: todo ocurre en el contenedor.

1. Abre esta carpeta en Cursor o VS Code.
2. Ejecuta **Dev Containers: Reopen in Container**.
3. Cuando termine la creación, arranca la app:

```bash
npm run dev
```

Next.js sirve la aplicación en el puerto 3000 (reenviado desde el contenedor).

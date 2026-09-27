// Simula una escritura de log "lenta" (ej. a un archivo, servicio externo, etc.)
export async function registrarLog(mensaje) {
  await new Promise((resolve) => setTimeout(resolve, 50));
  console.log(`[LOG] ${new Date().toISOString()} - ${mensaje}`);
}

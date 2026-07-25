/**
 * HTTP Inspector CLI
 *
 * Tarea de la Sesión 1: Fundamentos de la Web
 *
 * Esta tarea NO usa la red, ni async/await, ni librerías externas.
 * Solo la biblioteca estándar de Node + tipos básicos de TypeScript.
 *
 * Idea: aplicar lo que aprendiste sobre HTTP (URLs, métodos, códigos
 * de estado y cabeceras) implementando pequeñas funciones puras.
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Resultado de analizar una URL. */
export interface UrlParts {
  /** Protocolo tal como lo devuelve la WHATWG URL, p. ej. "https:". */
  protocol: string;
  /** Host (puede incluir puerto), p. ej. "api.ejemplo.com:443". */
  host: string;
  /** Ruta, p. ej. "/users". */
  pathname: string;
  /** Query string con el "?" inicial, p. ej. "?id=1&name=Ana". */
  search: string;
  /** Lista de pares [clave, valor] de los query params. */
  query: Array<[string, string]>;
}

/** Categoría de un código de estado HTTP. */
export type StatusCategory =
  | "1xx Informativo"
  | "2xx Éxito"
  | "3xx Redirección"
  | "4xx Error del cliente"
  | "5xx Error del servidor"
  | "Desconocido";

/** Mapa de cabeceras HTTP. */
export type Headers = Record<string, string>;

// ---------------------------------------------------------------------------
// Funciones a implementar
// ---------------------------------------------------------------------------

/**
 * Analiza una URL y devuelve sus partes principales.
 *
 * @param url - La URL completa a analizar, p. ej. "https://api.ejemplo.com/users?id=1"
 * @returns Un objeto UrlParts con protocolo, host, ruta y query params.
 * @throws Error si la URL no tiene un formato válido.
 */
export function parseUrl(url: string): UrlParts {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`URL inválida: ${url}`);
  }

  const query: [string, string][] = Array.from(
    parsed.searchParams.entries()
  );

  return {
    protocol: parsed.protocol,
    host: parsed.host,
    pathname: parsed.pathname,
    search: parsed.search,
    query,
  };
}

/**
 * Clasifica un código de estado HTTP en su categoría correspondiente.
 *
 * @param code - Código de estado HTTP, p. ej. 404.
 * @returns La categoría del código (1xx a 5xx, o "Desconocido").
 */

export function classifyStatus(code: number): StatusCategory {
   if (code >= 100 && code <= 199) {
    return "1xx Informativo";
  } else if (code >= 200 && code <= 299) {
    return "2xx Éxito";
  } else if (code >= 300 && code <= 399) {
    return "3xx Redirección";
  } else if (code >= 400 && code <= 499) {
    return "4xx Error del cliente";
  } else if (code >= 500 && code <= 599) {
    return "5xx Error del servidor";
  } else {
    return "Desconocido";
  }
}

/**
 * Parsea un texto con líneas "Nombre: valor" a un objeto de cabeceras.
 *
 * @param text - Texto con una cabecera HTTP por línea.
 * @returns Objeto con cada nombre de cabecera como clave.
 */


export function parseHeaders(text: string): Headers {
 const headers: Headers = {};
  const lines = text.split("\n");

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine === "" || !trimmedLine.includes(":")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf(":");
    const name = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    headers[name] = value;
  }

  return headers;
}


/**
 * Genera un resumen legible de una petición HTTP combinando URL,
 * estado y cabeceras.
 *
 * @param url - URL de la petición.
 * @param status - Código de estado HTTP.
 * @param headersText - Texto crudo de las cabeceras.
 * @returns Un string con el resumen formateado.
 */


export function summarizeRequest(
   url: string,
  status: number,
  headersText: string,
): string {
  const category = classifyStatus(status);
  const headers = parseHeaders(headersText);

  const headerLines = Object.entries(headers)
    .map(([name, value]) => `  • ${name}: ${value}`)
    .join("\n");

  return [
    "Resumen de la petición",
    "──────────────────────",
    `URL:     ${url}`,
    `Status:  ${status} (${category})`,
    "Headers:",
    headerLines,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// CLI (opcional, pero recomendado para probar manualmente)
// ---------------------------------------------------------------------------

if (require.main === module) {
  const [, , cmd, ...args] = process.argv;
  try {
    if (cmd === "parse-url" && args[0]) {
      const parts = parseUrl(args[0]);
      console.log(JSON.stringify(parts, null, 2));
    } else if (cmd === "status" && args[0]) {
      const cat = classifyStatus(Number(args[0]));
      console.log(cat);
    } else if (cmd === "headers" && args.length > 0) {
      const h = parseHeaders(args.join(" "));
      console.log(JSON.stringify(h, null, 2));
    } else if (cmd === "summary" && args.length >= 2) {
      const [url, status, ...rest] = args;
      console.log(summarizeRequest(url, Number(status), rest.join(" ")));
    } else {
      console.log("Uso:");
      console.log('  npm start parse-url "https://ejemplo.com/path?a=1"');
      console.log("  npm start status 404");
      console.log('  npm start headers "Content-Type: application/json"');
      console.log('  npm start summary "https://x.com" 200 "Content-Type: application/json"');
    }
  } catch (e) {
    console.error("Error:", (e as Error).message);
    process.exit(1);
  }
}

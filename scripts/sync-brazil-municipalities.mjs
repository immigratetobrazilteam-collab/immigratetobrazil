import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const endpoint = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios";
const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
if (!response.ok) throw new Error(`IBGE municipality request failed: ${response.status}`);
const municipalities = (await response.json()).map((item) => {
  const state = item.microrregiao?.mesorregiao?.UF || item["regiao-imediata"]?.["regiao-intermediaria"]?.UF || {};
  return { id: item.id, name: item.nome, state: state.sigla || "", stateName: state.nome || "" };
}).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
await fs.writeFile(path.join(ROOT, "data", "brazil-municipalities.json"), JSON.stringify({ source: endpoint, retrievedAt: new Date().toISOString(), count: municipalities.length, municipalities }, null, 2) + "\n");
console.log(`Synced ${municipalities.length} official IBGE municipalities.`);

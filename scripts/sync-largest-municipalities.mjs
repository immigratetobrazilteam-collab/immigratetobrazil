import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const municipalities = JSON.parse(await fs.readFile(path.join(ROOT, "data", "brazil-municipalities.json"), "utf8")).municipalities;
const populationEndpoint = "https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/2024/variaveis/9324?localidades=N6%5Ball%5D";
const response = await fetch(populationEndpoint, { headers: { Accept: "application/json" } });
if (!response.ok) throw new Error(`IBGE population request failed: ${response.status}`);
const payload = await response.json();
const populationById = new Map(payload[0].resultados[0].series.map((entry) => [Number(entry.localidade.id), Number(entry.serie["2024"] || 0)]));
const byState = new Map();
for (const municipality of municipalities) {
  const population = populationById.get(municipality.id) || 0;
  const list = byState.get(municipality.state) || [];
  list.push({ ...municipality, population });
  byState.set(municipality.state, list);
}
const states = [...byState.entries()].map(([state, list]) => ({
  state,
  stateName: list[0]?.stateName || state,
  municipalities: list.sort((a, b) => b.population - a.population).slice(0, 5)
})).sort((a, b) => a.stateName.localeCompare(b.stateName, "pt-BR"));
await fs.writeFile(path.join(ROOT, "data", "largest-municipalities-by-state.json"), JSON.stringify({
  source: "IBGE population estimates, 2024 (table 6579, variable 9324)",
  sourceUrl: populationEndpoint,
  year: 2024,
  states
}, null, 2) + "\n");
console.log(`Synced the five largest municipalities for ${states.length} states and the Federal District.`);

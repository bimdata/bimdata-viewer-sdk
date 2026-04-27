/**
 * Web Worker : exécute toute la pipeline COBie hors du thread principal.
 *
 * Pourquoi : sur un gros modèle, la dénormalisation de ``/element/raw``,
 * la construction du ``SpatialIndex`` et l'écriture xlsx (exceljs) peuvent
 * mobiliser le thread plusieurs secondes — pendant ce temps le rendu 3D du
 * viewer freeze. Tout passe ici dans un worker, le main thread reste
 * réactif et reçoit uniquement des messages de progression + le résultat
 * final (ArrayBuffer transféré, zéro copie).
 *
 * Protocole :
 *   ◀ main → worker : { cmd: "extract", payload: { cloudId, projectId, modelId, accessToken, ifcFile?, structure?, baseUrl? } }
 *   ▶ worker → main : { type: "progress", message }
 *   ▶ worker → main : { type: "done", buffer (ArrayBuffer transferable), modelName }
 *   ▶ worker → main : { type: "error", message }
 */
import { BIMDataClient } from "./bimdataClient.js";
import { extractCobie } from "./extractor.js";
import { buildXlsxBlob } from "./exporter.js";

self.addEventListener("message", async (ev) => {
  const data = ev.data || {};
  if (data.cmd !== "extract") return;

  const post = (msg) => self.postMessage(msg);

  try {
    const { cloudId, projectId, modelId, accessToken, ifcFile, structure, baseUrl } = data.payload || {};
    const client = new BIMDataClient({ cloudId, projectId, modelId, accessToken, baseUrl });

    const { sheets, modelName } = await extractCobie(client, (message) => {
      post({ type: "progress", message });
    }, { ifcFile, structure });

    post({ type: "progress", message: "Generating xlsx..." });
    const blob = await buildXlsxBlob(sheets);
    const buffer = await blob.arrayBuffer();

    // Transfer du ArrayBuffer pour éviter une copie (le worker n'en a plus besoin).
    post({ type: "done", buffer, modelName }, [buffer]);
  } catch (err) {
    post({ type: "error", message: err && err.message ? err.message : String(err) });
  }
});



import CobieExtractorWorker from "./lib/extractor.worker.js?worker&inline";

function toConsoleSafe(value) {
  const text = String(value ?? "");
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u2026/g, "...");
}

async function downloadArrayBuffer(buffer, filename) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // delayed cleanup to ensure the download has been triggered before revoking the URL

  return new Promise((resolve) => {
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(`[cobie-export] Export completed: ${filename}`);

      resolve();
    }, 200);
  });
}

function safeName(value) {
  return (value || "export").replace(/[\\/:*?"<>|]+/g, "_");
}

export default {
  render() {
    return null;
  },
  beforeUnmount() {
    if (this._cobieWorker) {
      this._cobieWorker.terminate();
      this._cobieWorker = null;
    }
  },
  async onOpen() {
    const $viewer = this.$viewer;

    const model = $viewer.localContext.loadedModels[0];

    if (!model) return;

    const ifcFile = model.document.file;
    const structure = model.structure;
    const modelId = model.id;

    const { cloudId, projectId, accessToken, apiUrl } = $viewer.api;

    if (this._cobieWorker) {
      this._cobieWorker.terminate();
      this._cobieWorker = null;
    }

    const worker = new CobieExtractorWorker();
    this._cobieWorker = worker;

    $viewer.localContext.loadingProcessStart();

    try {
      const { buffer, modelName } = await new Promise((resolve, reject) => {
        worker.addEventListener("message", (ev) => {
          const msg = ev.data || {};
          if (msg.type === "progress") {
            console.info("[cobie-export]", toConsoleSafe(msg.message));
          } else if (msg.type === "done") {
            resolve({ buffer: msg.buffer, modelName: msg.modelName });
          } else if (msg.type === "error") {
            reject(new Error(toConsoleSafe(msg.message || "Worker error")));
          }
        });
        worker.addEventListener("error", (ev) => {
          reject(new Error(ev.message || "Worker error"));
        });

        worker.postMessage({
          cmd: "extract",
          payload: {
            cloudId,
            projectId,
            modelId,
            accessToken,
            baseUrl: apiUrl,
            ifcFile,
            structure,
          },
        });
      });

      const ts = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 15);
      await downloadArrayBuffer(buffer, `COBie_${safeName(modelName)}_${ts}.xlsx`);
    } catch (err) {
      console.error("[cobie-export]", err);
    } finally {
      if (this._cobieWorker === worker) {
        this._cobieWorker.terminate();
        this._cobieWorker = null;
      }

      $viewer.localContext.loadingProcessEnd();

      setTimeout(() => this.$close(), 0);
    }
  },
};

const SERVICE_URL = "https://statics.bimdata.io/js/syctom/VChNAE4Ria8aZGpcA2U2PJBHT5jxCeyW";
const NB_SAMPLES = 1000;

const maintenanceDataFile = "syctom-maintenance-data.json";
const processDataFile = key => `syctom-process-data-${key}.json`;

const fetchFile = file => fetch(`${SERVICE_URL}/${file}`).then(res => res.json());

// ---

export default class SyctomService {
  fetchMaintenanceData() {
    return fetchFile(maintenanceDataFile);
  }

  fetchProcessData(keys) {
    return Promise.all(
      keys.map(
        key => fetchFile(processDataFile(key)).then(res => res.slice(-NB_SAMPLES))
      )
    );
  }
}

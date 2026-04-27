/** Feuille COBie : Facility (IfcBuilding / IfcProject). */
import { nowISO } from "./_helpers.js";

export const HEADERS = [
  "Name", "CreatedBy", "CreatedOn", "Category", "ProjectName",
  "SiteName", "LinearUnits", "AreaUnits", "VolumeUnits", "CurrencyUnit",
  "AreaMeasurement", "ExtSystem", "ExtObject", "ExtIdentifier", "Description",
  "ProjectDescription", "SiteDescription", "Phase",
  "Address", "PostalBox", "Town", "Region", "PostalCode", "Country",
  "Latitude", "Longitude",
];

const ADDRESS_PSET_NAMES = new Set(["pset_address", "ifcpostaladdress", "adresse", "address"]);
const ADDRESS_FIELD_MAP = {
  addresslines: "Address", address_lines: "Address", address: "Address", adresse: "Address",
  postalbox: "PostalBox", postal_box: "PostalBox",
  town: "Town", ville: "Town",
  region: "Region",
  postalcode: "PostalCode", postal_code: "PostalCode", codepostal: "PostalCode", code_postal: "PostalCode",
  country: "Country", pays: "Country",
};

function extractPostalAddress(building) {
  let addr = {};
  const raw = building.building_address || building.postal_address;
  if (raw) {
    const lines = raw.address_lines || raw.AddressLines || [];
    addr = {
      Address: Array.isArray(lines) ? lines.join(", ") : String(lines || ""),
      PostalBox: raw.postal_box || raw.PostalBox || "",
      Town: raw.town || raw.Town || "",
      Region: raw.region || raw.Region || "",
      PostalCode: raw.postal_code || raw.PostalCode || "",
      Country: raw.country || raw.Country || "",
    };
  }
  const empty = Object.values(addr).every((v) => !v);
  if (empty) {
    for (const pset of building.property_sets || []) {
      const psetName = (pset.name || "").toLowerCase().replace(/\s+/g, "");
      if (!ADDRESS_PSET_NAMES.has(psetName)) continue;
      for (const prop of pset.properties || []) {
        const key = (prop.name || "").toLowerCase().replace(/[\s_]/g, "");
        const cob = ADDRESS_FIELD_MAP[key];
        if (cob && !addr[cob]) {
          let val = prop.value || "";
          if (Array.isArray(val)) val = val.map(String).join(", ");
          addr[cob] = String(val);
        }
      }
    }
  }
  return {
    Address: addr.Address || "",
    PostalBox: addr.PostalBox || "",
    Town: addr.Town || "",
    Region: addr.Region || "",
    PostalCode: addr.PostalCode || "",
    Country: addr.Country || "",
  };
}

function compoundAngleToDecimal(parts) {
  if (parts === null || parts === undefined) return null;
  if (typeof parts === "number") return Math.round(parts * 1e8) / 1e8;
  if (!parts.length) return null;
  let nums;
  try {
    nums = parts.map((p) => Number(p));
    if (nums.some((n) => Number.isNaN(n))) return null;
  } catch {
    return null;
  }
  const sign = nums[0] < 0 ? -1 : 1;
  const deg = Math.abs(nums[0]);
  const minutes = nums.length > 1 ? Math.abs(nums[1]) : 0;
  const seconds = nums.length > 2 ? Math.abs(nums[2]) : 0;
  const micro = nums.length > 3 ? Math.abs(nums[3]) : 0;
  const decimal = deg + minutes / 60 + seconds / 3600 + micro / 3_600_000_000;
  return Math.round(sign * decimal * 1e8) / 1e8;
}

const LAT_DEFS = new Set(["reflatitude", "reflat", "latitude", "lat"]);
const LON_DEFS = new Set(["reflongitude", "reflong", "longitude", "lon", "long"]);
const GEO_PSETS = new Set(["psetsitecommon", "georef", "coordinates", "geolocation",
  "géolocalisation", "coordonnees", "coordonnées"]);

function extractCoordinates(sites) {
  for (const site of sites || []) {
    let lat = null, lon = null;

    const attrs = site.attributes || {};
    for (const prop of attrs.properties || []) {
      const defname = (((prop.definition || {}).name) || "").toLowerCase().replace(/_/g, "");
      const val = prop.value;
      if (val === null || val === undefined || val === "" || (Array.isArray(val) && !val.length)) continue;
      if (LAT_DEFS.has(defname)) lat = Array.isArray(val) ? compoundAngleToDecimal(val) : val;
      if (LON_DEFS.has(defname)) lon = Array.isArray(val) ? compoundAngleToDecimal(val) : val;
    }

    if (lat === null && lon === null) {
      for (const [key, val] of Object.entries(site)) {
        const k = key.toLowerCase().replace(/[_-]/g, "");
        if (val === null || val === undefined || val === "" || (Array.isArray(val) && !val.length)) continue;
        if (LAT_DEFS.has(k)) lat = Array.isArray(val) ? compoundAngleToDecimal(val) : val;
        if (LON_DEFS.has(k)) lon = Array.isArray(val) ? compoundAngleToDecimal(val) : val;
      }
    }

    if (lat === null && lon === null) {
      for (const pset of site.property_sets || []) {
        const pname = (pset.name || "").toLowerCase().replace(/[\s_]/g, "");
        if (!GEO_PSETS.has(pname)) continue;
        for (const prop of pset.properties || []) {
          const pk = (prop.name || "").toLowerCase().replace(/[\s_]/g, "");
          const val = prop.value;
          if (val === null || val === undefined || val === "") continue;
          if (LAT_DEFS.has(pk)) lat = Array.isArray(val) ? compoundAngleToDecimal(val) : val;
          if (LON_DEFS.has(pk)) lon = Array.isArray(val) ? compoundAngleToDecimal(val) : val;
        }
      }
    }

    if (lat !== null || lon !== null) {
      return { Latitude: lat ?? "", Longitude: lon ?? "" };
    }
  }
  return { Latitude: "", Longitude: "" };
}

export function build(buildings, project, model, sites) {
  const proj = project || {};
  const mod = model || {};
  const createdOn = nowISO();
  const coords = extractCoordinates(sites || []);
  const rows = [];

  if (buildings && buildings.length) {
    for (const b of buildings) {
      const postal = extractPostalAddress(b);
      rows.push({
        Name: b.name || b.longname || "Facility",
        CreatedBy: "n/a",
        CreatedOn: createdOn,
        Category: "Facility",
        ProjectName: proj.name || "",
        SiteName: "",
        LinearUnits: "meters",
        AreaUnits: "squaremeters",
        VolumeUnits: "cubicmeters",
        CurrencyUnit: "EUR",
        AreaMeasurement: "GrossFloorArea",
        ExtSystem: "BIMData",
        ExtObject: "IfcBuilding",
        ExtIdentifier: b.uuid || "",
        Description: b.description || "",
        ProjectDescription: proj.description || "",
        SiteDescription: "",
        Phase: b.phase || "",
        ...postal,
        ...coords,
      });
    }
  } else {
    rows.push({
      Name: proj.name || "Facility",
      CreatedBy: "n/a",
      CreatedOn: createdOn,
      Category: "Facility",
      ProjectName: proj.name || "",
      SiteName: "",
      LinearUnits: "meters",
      AreaUnits: "squaremeters",
      VolumeUnits: "cubicmeters",
      CurrencyUnit: "EUR",
      AreaMeasurement: "GrossFloorArea",
      ExtSystem: "BIMData",
      ExtObject: "IfcProject",
      ExtIdentifier: String(mod.id ?? ""),
      Description: "",
      ProjectDescription: proj.description || "",
      SiteDescription: "",
      Phase: "",
      Address: "", PostalBox: "", Town: "", Region: "", PostalCode: "", Country: "",
      ...coords,
    });
  }
  return rows;
}

/** Feuille COBie : Type (IfcTypeObject) — fallback déduit des composants. */
import {
  nowISO, psetValue, attrValue, formatClassifications,
  formatLayers, formatBaseQuantities, isComponent,
} from "./_helpers.js";

export const HEADERS = [
  "Name", "CreatedBy", "CreatedOn", "Category", "Description",
  "AssetType", "Manufacturer", "ModelNumber",
  "WarrantyGuarantorParts", "WarrantyDurationParts",
  "WarrantyGuarantorLabor", "WarrantyDurationLabor", "WarrantyDurationUnit",
  "ExtSystem", "ExtObject", "ExtIdentifier",
  "ReplacementCost", "ExpectedLife", "DurationUnit",
  "NominalLength", "NominalWidth", "NominalHeight",
  "ModelReference", "Shape", "Color", "Finish", "Grade", "Material",
  "SustainabilityPerformance",
  "Classifications", "Layers", "BaseQuantities",
];

const PSET_MFR = "Pset_ManufacturerTypeInformation";
const PSET_WARRANTY = "Pset_Warranty";

function deriveTypeKey(el) {
  const objType = (el.object_type || attrValue(el, "ObjectType") || "").trim();
  if (objType) return objType;
  return el.type || "UnknownType";
}

function formatMaterials(el) {
  const names = [];
  for (const entry of el.material_list || []) {
    const mat = entry.material || {};
    if (mat.name) names.push(mat.name);
  }
  return names.join(", ");
}

function fromTypes(types, createdOn) {
  const rows = [];
  const seen = new Set();
  for (const t of types) {
    const name = t.name || `Type_${(t.uuid || "").slice(0, 8)}`;
    if (seen.has(name)) continue;
    seen.add(name);
    rows.push({
      Name: name,
      CreatedBy: "n/a",
      CreatedOn: createdOn,
      Category: t.object_type || t.type || "",
      Description: t.description || t.longname || "",
      AssetType: "Fixed",
      Manufacturer: psetValue(t, PSET_MFR, "Manufacturer"),
      ModelNumber: psetValue(t, PSET_MFR, "ModelLabel"),
      WarrantyGuarantorParts: psetValue(t, PSET_WARRANTY, "WarrantyIdentifier"),
      WarrantyDurationParts: psetValue(t, PSET_WARRANTY, "WarrantyPeriod"),
      WarrantyGuarantorLabor: "",
      WarrantyDurationLabor: "",
      WarrantyDurationUnit: "year",
      ExtSystem: "BIMData",
      ExtObject: t.type || "IfcTypeObject",
      ExtIdentifier: t.uuid || "",
      ReplacementCost: "",
      ExpectedLife: psetValue(t, "Pset_ServiceLife", "ServiceLifeDuration"),
      DurationUnit: "year",
      NominalLength: "",
      NominalWidth: "",
      NominalHeight: "",
      ModelReference: psetValue(t, PSET_MFR, "ModelLabel"),
      Shape: "", Color: "", Finish: "", Grade: "", Material: "",
      SustainabilityPerformance: "",
      Classifications: formatClassifications(t),
      Layers: formatLayers(t),
      BaseQuantities: formatBaseQuantities(t),
    });
  }
  return rows;
}

function fromElements(elements, createdOn) {
  const rows = [];
  const seen = new Set();
  for (const el of elements) {
    if (!isComponent(el)) continue;
    const key = deriveTypeKey(el);
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      Name: key,
      CreatedBy: "n/a",
      CreatedOn: createdOn,
      Category: el.type || "",
      Description: attrValue(el, "Description") || "",
      AssetType: "Fixed",
      Manufacturer: psetValue(el, PSET_MFR, "Manufacturer"),
      ModelNumber: psetValue(el, PSET_MFR, "ModelLabel"),
      WarrantyGuarantorParts: psetValue(el, PSET_WARRANTY, "WarrantyIdentifier"),
      WarrantyDurationParts: psetValue(el, PSET_WARRANTY, "WarrantyPeriod"),
      WarrantyGuarantorLabor: "",
      WarrantyDurationLabor: "",
      WarrantyDurationUnit: "year",
      ExtSystem: "BIMData",
      ExtObject: el.type || "IfcTypeObject",
      ExtIdentifier: "",
      ReplacementCost: "",
      ExpectedLife: psetValue(el, "Pset_ServiceLife", "ServiceLifeDuration"),
      DurationUnit: "year",
      NominalLength: "",
      NominalWidth: "",
      NominalHeight: "",
      ModelReference: psetValue(el, PSET_MFR, "ModelLabel"),
      Shape: "", Color: "", Finish: "", Grade: "",
      Material: formatMaterials(el),
      SustainabilityPerformance: "",
      Classifications: formatClassifications(el),
      Layers: formatLayers(el),
      BaseQuantities: formatBaseQuantities(el),
    });
  }
  return rows;
}

export function build(elementTypes, elements) {
  const createdOn = nowISO();
  if (elementTypes && elementTypes.length) return fromTypes(elementTypes, createdOn);
  return fromElements(elements || [], createdOn);
}

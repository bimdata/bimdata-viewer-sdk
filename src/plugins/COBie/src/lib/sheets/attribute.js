/** Feuille COBie : Attribute — propriétés non-standard de chaque élément. */
import { nowISO } from "./_helpers.js";

export const HEADERS = [
  "Name", "CreatedBy", "CreatedOn", "Category",
  "SheetName", "RowName", "Value", "Unit",
  "ExtSystem", "ExtObject", "ExtIdentifier",
  "Description", "AllowedValues",
];

const SKIP_PSETS = new Set([
  "Pset_ManufacturerTypeInformation",
  "Pset_Warranty",
  "Pset_ServiceLife",
  "Qto_SpaceBaseQuantities",
  "Pset_SpaceCommon",
  "Pset_BuildingStoreyCommon",
]);

const SHEET_FOR_TYPE = {
  ifcspace: "Space",
  ifcbuildingstorey: "Floor",
  ifcbuilding: "Facility",
};

const SPATIAL_SKIP = new Set(["ifcbuilding", "ifcbuildingstorey", "ifcspace", "ifcsite", "ifcproject", ""]);

function rowsFromElement(el, sheetName, createdOn) {
  const rows = [];
  const rowName = el.name || el.uuid || "";
  for (const pset of el.property_sets || []) {
    const psetName = pset.name || "";
    if (SKIP_PSETS.has(psetName)) continue;
    for (const prop of pset.properties || []) {
      const defn = prop.definition || {};
      const propName = defn.name || "";
      const value = prop.value;
      if (value === null || value === undefined || value === "") continue;
      rows.push({
        Name: `${psetName}.${propName}`,
        CreatedBy: "n/a",
        CreatedOn: createdOn,
        Category: psetName,
        SheetName: sheetName,
        RowName: rowName,
        Value: String(Array.isArray(value) ? value.join(", ") : value),
        Unit: defn.unit || "",
        ExtSystem: "BIMData",
        ExtObject: el.type || "",
        ExtIdentifier: el.uuid || "",
        Description: defn.description || "",
        AllowedValues: "",
      });
    }
  }
  return rows;
}

export function build(buildings, storeys, spaces, elements) {
  const createdOn = nowISO();
  const rows = [];
  for (const b of buildings || []) rows.push(...rowsFromElement(b, "Facility", createdOn));
  for (const s of storeys || []) rows.push(...rowsFromElement(s, "Floor", createdOn));
  for (const sp of spaces || []) rows.push(...rowsFromElement(sp, "Space", createdOn));
  for (const el of elements || []) {
    const t = (el.type || "").toLowerCase();
    if (!SPATIAL_SKIP.has(t)) rows.push(...rowsFromElement(el, "Component", createdOn));
  }
  return rows;
}

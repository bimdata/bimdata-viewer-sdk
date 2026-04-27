/** Feuille COBie : Floor (IfcBuildingStorey). */
import { nowISO } from "./_helpers.js";

export const HEADERS = [
  "Name", "CreatedBy", "CreatedOn", "Category",
  "ExtSystem", "ExtObject", "ExtIdentifier",
  "Description", "Elevation", "Height",
];

export function build(storeys) {
  const createdOn = nowISO();
  return (storeys || []).map((storey) => {
    const psetCommon = (storey.property_sets || []).find((ps) => ps.name === "Pset_BuildingStoreyCommon") || {};
    const properties = {};
    for (const p of psetCommon.properties || []) {
      const n = (p.definition || {}).name || "";
      if (n) properties[n] = p.value;
    }
    return {
      Name: storey.name || storey.longname || `Floor_${(storey.uuid || "").slice(0, 8)}`,
      CreatedBy: "n/a",
      CreatedOn: createdOn,
      Category: "Floor",
      ExtSystem: "BIMData",
      ExtObject: "IfcBuildingStorey",
      ExtIdentifier: storey.uuid || "",
      Description: storey.description || storey.longname || "",
      Elevation: storey.elevation ?? properties.AboveGround ?? "",
      Height: properties.FloorPlanShape ?? "",
    };
  });
}

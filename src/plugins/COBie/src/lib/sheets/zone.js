/** Feuille COBie : Zone (IfcZone). */
import { nowISO } from "./_helpers.js";

export const HEADERS = [
  "Name", "CreatedBy", "CreatedOn", "Category",
  "SpaceNames", "ExtSystem", "ExtObject", "ExtIdentifier", "Description",
];

export function build(zones) {
  const createdOn = nowISO();
  return (zones || []).map((zone) => {
    const spaces = zone.spaces || [];
    const spaceNames = spaces
      .filter((s) => s && typeof s === "object")
      .map((s) => s.name || s.uuid || "")
      .filter(Boolean)
      .join(", ");
    return {
      Name: zone.name || `Zone_${(zone.uuid || "").slice(0, 8)}`,
      CreatedBy: "n/a",
      CreatedOn: createdOn,
      Category: zone.type || "IfcZone",
      SpaceNames: spaceNames,
      ExtSystem: "BIMData",
      ExtObject: "IfcZone",
      ExtIdentifier: zone.uuid || "",
      Description: zone.description || zone.longname || "",
    };
  });
}

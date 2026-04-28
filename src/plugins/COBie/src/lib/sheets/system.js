/** Feuille COBie : System (IfcSystem / IfcGroup). */
import { nowISO } from "./_helpers.js";

export const HEADERS = [
  "Name", "CreatedBy", "CreatedOn", "Category",
  "ComponentNames", "ExtSystem", "ExtObject", "ExtIdentifier", "Description",
];

export function build(systems) {
  const createdOn = nowISO();
  return (systems || []).map((sys) => {
    const components = sys.elements || sys.components || [];
    const names = components
      .filter((c) => c && typeof c === "object")
      .map((c) => c.name || c.uuid || "")
      .filter(Boolean)
      .join(", ");
    return {
      Name: sys.name || `System_${(sys.uuid || "").slice(0, 8)}`,
      CreatedBy: "n/a",
      CreatedOn: createdOn,
      Category: sys.type || "IfcSystem",
      ComponentNames: names,
      ExtSystem: "BIMData",
      ExtObject: sys.type || "IfcSystem",
      ExtIdentifier: sys.uuid || "",
      Description: sys.description || sys.longname || "",
    };
  });
}

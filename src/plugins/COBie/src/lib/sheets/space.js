/** Feuille COBie : Space (IfcSpace) avec relation vers Floor. */
import { nowISO, psetValue } from "./_helpers.js";

export const HEADERS = [
  "Name", "CreatedBy", "CreatedOn", "Category", "FloorName",
  "Description", "ExtSystem", "ExtObject", "ExtIdentifier",
  "RoomTag", "UsableHeight", "GrossArea", "NetArea",
  "GrossFloorArea", "GrossPerimeter", "GrossVolume", "Height", "NetFloorArea",
];

const QTO_NAMES = new Set(["Qto_SpaceBaseQuantities", "BaseQuantities"]);

export function build(spaces, index) {
  const createdOn = nowISO();
  return (spaces || []).map((space) => {
    const storey = index.storeyOfSpace(space.id);
    let floorName = storey ? storey.name || "" : "";
    if (!floorName) {
      const level = psetValue(space, ["Contraintes", "Constraints"], "Niveau")
        || psetValue(space, ["Contraintes", "Constraints"], "Level");
      if (typeof level === "string") {
        floorName = level.replace("Niveau:", "").replace("Level:", "").trim();
      }
    }
    return {
      Name: space.name || space.longname || `Space_${space.id}`,
      CreatedBy: "n/a",
      CreatedOn: createdOn,
      Category: psetValue(space, "Pset_SpaceCommon", "Reference") || "Space",
      FloorName: floorName,
      Description: space.description || space.longname || "",
      ExtSystem: "BIMData",
      ExtObject: "IfcSpace",
      ExtIdentifier: space.uuid || "",
      RoomTag: space.longname || space.name || "",
      UsableHeight: psetValue(space, "Pset_SpaceCommon", "UsableHeight"),
      GrossArea: psetValue(space, QTO_NAMES, "GrossFloorArea"),
      NetArea: psetValue(space, QTO_NAMES, "NetFloorArea"),
      GrossFloorArea: psetValue(space, QTO_NAMES, "GrossFloorArea"),
      GrossPerimeter: psetValue(space, QTO_NAMES, "GrossPerimeter"),
      GrossVolume: psetValue(space, QTO_NAMES, "GrossVolume"),
      Height: psetValue(space, QTO_NAMES, "Height"),
      NetFloorArea: psetValue(space, QTO_NAMES, "NetFloorArea"),
    };
  });
}

/** Feuille COBie : Component (composants physiques IFC). */
import {
  nowISO, psetValue, attrValue, formatClassifications,
  formatLayers, formatBaseQuantities, isComponent,
} from "./_helpers.js";

export const HEADERS = [
  "Name", "CreatedBy", "CreatedOn", "TypeName", "Space", "FloorName",
  "Description", "ExtSystem", "ExtObject", "ExtIdentifier",
  "SerialNumber", "InstallationDate", "WarrantyStartDate",
  "TagNumber", "BarCode", "AssetIdentifier",
  "Classifications", "Layers", "BaseQuantities",
];

function resolveTypeName(element) {
  const ref = element.element_type || element.type_object;
  if (ref && typeof ref === "object" && ref.name) return ref.name;
  if (typeof ref === "string" && ref) return ref;
  if (element.object_type) return element.object_type;
  return attrValue(element, "ObjectType") || "";
}

export function build(elements, index) {
  const createdOn = nowISO();
  const rows = [];
  for (const el of elements || []) {
    if (!isComponent(el)) continue;
    const space = index.spaceOfElement(el.uuid);
    const storey = index.storeyOfElement(el.uuid);
    const name = el.name || attrValue(el, "Name") || `${el.type || "Element"}_${(el.uuid || "").slice(0, 8)}`;
    const description = el.description || el.longname || attrValue(el, "Description") || "";
    rows.push({
      Name: name,
      CreatedBy: "n/a",
      CreatedOn: createdOn,
      TypeName: resolveTypeName(el),
      Space: space ? space.name || "" : "",
      FloorName: storey ? storey.name || "" : "",
      Description: description,
      ExtSystem: "BIMData",
      ExtObject: el.type || "IfcElement",
      ExtIdentifier: el.uuid || "",
      SerialNumber: psetValue(el, "Pset_ManufacturerTypeInformation", "SerialNumber"),
      InstallationDate: "",
      WarrantyStartDate: "",
      TagNumber: psetValue(el, "Pset_ManufacturerTypeInformation", "ArticleNumber"),
      BarCode: "",
      AssetIdentifier: el.uuid || "",
      Classifications: formatClassifications(el),
      Layers: formatLayers(el),
      BaseQuantities: formatBaseQuantities(el),
    });
  }
  return rows;
}

/** Helpers communs aux builders de feuilles COBie. */

export const nowISO = () => new Date().toISOString().slice(0, 19);

/** Récupère la valeur d'une propriété dans un Pset (ou un set de Psets) par nom. */
export function psetValue(element, psetNames, propName) {
  const names = new Set(typeof psetNames === "string" ? [psetNames] : psetNames);
  for (const ps of element.property_sets || []) {
    if (names.has(ps.name)) {
      for (const prop of ps.properties || []) {
        const defn = prop.definition || {};
        if (defn.name === propName) return prop.value;
      }
    }
  }
  return "";
}

/** Récupère un attribut IFC racine (Name, Description, ObjectType, Tag) depuis attributes.properties. */
export function attrValue(element, attrName) {
  const attrs = element.attributes || {};
  for (const prop of attrs.properties || []) {
    const defn = prop.definition || {};
    if (defn.name === attrName) return prop.value;
  }
  return null;
}

/** Formate les classifications : "Nom: notation (titre); ...". */
export function formatClassifications(element) {
  const parts = [];
  for (const cl of element.classifications || []) {
    const name = cl.name || "";
    const notation = cl.notation || "";
    const title = cl.title || "";
    let chunk = name ? `${name}: ${notation}` : notation;
    if (title) chunk = chunk ? `${chunk} (${title})` : title;
    if (chunk) parts.push(chunk);
  }
  return parts.join("; ");
}

/** Formate les layers CAO : "name1, name2, ...". */
export function formatLayers(element) {
  const names = (element.layers || []).map((l) => l && l.name).filter(Boolean);
  return names.join(", ");
}

/**
 * Agrège toutes les quantités des property sets IfcElementQuantity
 * (BaseQuantities Revit ou Qto_*) en "Name=value; Name=value".
 */
export function formatBaseQuantities(element) {
  const items = [];
  for (const ps of element.property_sets || []) {
    const name = ps.name || "";
    const isQto = ps.type === "IfcElementQuantity" || name === "BaseQuantities" || name.startsWith("Qto_");
    if (!isQto) continue;
    for (const prop of ps.properties || []) {
      const defn = prop.definition || {};
      const propName = defn.name;
      let value = prop.value;
      if (propName && value !== null && value !== undefined && value !== "") {
        if (typeof value === "number" && !Number.isInteger(value)) {
          value = Math.round(value * 10000) / 10000;
        }
        items.push(`${propName}=${value}`);
      }
    }
  }
  return items.join("; ");
}

/** Conteneurs spatiaux à exclure de Component. */
export const EXCLUDED_COMPONENT_TYPES = new Set([
  "ifcbuilding", "ifcbuildingstorey", "ifcspace", "ifcsite",
  "ifcproject", "ifcannotation", "ifcgrid", "ifcopeningelement",
  "ifcvirtualelement", "ifczone", "ifcsystem", "ifcgroup",
  "ifcdistributionport",
]);

export function isComponent(element) {
  const t = (element.type || "").toLowerCase();
  return t !== "" && !EXCLUDED_COMPONENT_TYPES.has(t);
}

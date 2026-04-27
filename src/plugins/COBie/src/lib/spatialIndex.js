/**
 * Index des relations spatiales :
 *   étage  ↔ espaces, espace ↔ étage,
 *   étage  ↔ éléments (directs + via espaces),
 *   espace ↔ éléments, élément ↔ espace, élément ↔ étage.
 */

export class SpatialIndex {
  constructor(buildings, storeys, spaces, elements) {
    this.buildings = new Map(buildings.map((b) => [b.uuid, b]));
    this.storeys = new Map(storeys.map((s) => [s.uuid, s]));
    this.spaces = new Map(spaces.map((s) => [s.id, s]));
    this.spacesByUuid = new Map(spaces.filter((s) => s.uuid).map((s) => [s.uuid, s]));
    this.elements = new Map(elements.map((e) => [e.uuid, e]));

    this.storeySpaces = new Map(); // storey_uuid → [space_id]
    this.spaceStorey = new Map();  // space_id → storey_uuid|null
    this.spaceElements = new Map(); // space_id → [element_uuid]
    this.storeyElementsDirect = new Map(); // storey_uuid → [element_uuid]
    this.elementSpace = new Map(); // element_uuid → space_id|null
    this.elementStorey = new Map(); // element_uuid → storey_uuid|null

    this._build();
  }

  _build() {
    for (const space of this.spaces.values()) {
      const storeyUuid = this._resolveStoreyRef(space);
      this.spaceStorey.set(space.id, storeyUuid);
      if (storeyUuid) {
        if (!this.storeySpaces.has(storeyUuid)) this.storeySpaces.set(storeyUuid, []);
        this.storeySpaces.get(storeyUuid).push(space.id);
      }
    }
    for (const el of this.elements.values()) {
      const spaceId = this._resolveSpaceRef(el);
      const storeyUuid = this._resolveElementStorey(el, spaceId);
      this.elementSpace.set(el.uuid, spaceId);
      this.elementStorey.set(el.uuid, storeyUuid);
      if (spaceId !== null && spaceId !== undefined) {
        if (!this.spaceElements.has(spaceId)) this.spaceElements.set(spaceId, []);
        this.spaceElements.get(spaceId).push(el.uuid);
      } else if (storeyUuid) {
        if (!this.storeyElementsDirect.has(storeyUuid)) this.storeyElementsDirect.set(storeyUuid, []);
        this.storeyElementsDirect.get(storeyUuid).push(el.uuid);
      }
    }
  }

  _resolveStoreyRef(space) {
    for (const key of ["storey", "storey_uuid", "floor"]) {
      const val = space[key];
      if (val) {
        if (typeof val === "string") return val;
        if (typeof val === "object" && val.uuid) return val.uuid;
      }
    }
    const parent = space.parent;
    if (parent) {
      if (typeof parent === "string" && this.storeys.has(parent)) return parent;
      if (typeof parent === "object" && parent.uuid && this.storeys.has(parent.uuid)) return parent.uuid;
    }
    return null;
  }

  _resolveSpaceRef(element) {
    const spaces = element.spaces || [];
    if (spaces.length) {
      const ref = spaces[0];
      if (typeof ref === "number") return ref;
      if (typeof ref === "object" && ref) return ref.id ?? null;
      if (typeof ref === "string") {
        const sp = this.spacesByUuid.get(ref);
        return sp ? sp.id : null;
      }
    }
    const val = element.space;
    if (val !== undefined && val !== null) {
      if (typeof val === "number") return val;
      if (typeof val === "object") return val.id ?? null;
    }
    return null;
  }

  _resolveElementStorey(element, spaceId) {
    if (spaceId !== null && spaceId !== undefined) {
      return this.spaceStorey.get(spaceId) ?? null;
    }
    for (const key of ["storey", "storey_uuid", "floor"]) {
      const val = element[key];
      if (val) {
        if (typeof val === "string") return val;
        if (typeof val === "object" && val.uuid) return val.uuid;
      }
    }
    return null;
  }

  spacesOfStorey(storeyUuid) {
    return (this.storeySpaces.get(storeyUuid) || []).map((id) => this.spaces.get(id));
  }
  elementsOfSpace(spaceId) {
    return (this.spaceElements.get(spaceId) || []).map((u) => this.elements.get(u));
  }
  elementsOfStorey(storeyUuid, includeSpaces = true) {
    const uuids = [...(this.storeyElementsDirect.get(storeyUuid) || [])];
    if (includeSpaces) {
      for (const sid of this.storeySpaces.get(storeyUuid) || []) {
        uuids.push(...(this.spaceElements.get(sid) || []));
      }
    }
    return uuids.map((u) => this.elements.get(u));
  }
  storeyOfSpace(spaceId) {
    const uuid = this.spaceStorey.get(spaceId);
    return uuid ? this.storeys.get(uuid) : null;
  }
  storeyOfElement(elementUuid) {
    const uuid = this.elementStorey.get(elementUuid);
    return uuid ? this.storeys.get(uuid) : null;
  }
  spaceOfElement(elementUuid) {
    const sid = this.elementSpace.get(elementUuid);
    return sid !== null && sid !== undefined ? this.spaces.get(sid) : null;
  }
}

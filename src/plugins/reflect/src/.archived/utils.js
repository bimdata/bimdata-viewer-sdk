function toIfcType(s) {
  s = "Ifc_" + s;
  return s.replace(/([-_][a-z])/gi, $1 => {
    return $1.toUpperCase().replace("-", "").replace("_", "");
  });
}

export {
  toIfcType
};

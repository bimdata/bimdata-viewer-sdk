const BSDD_API_URL = "https://bs-dd-api-prototype.azurewebsites.net/api";

async function requestApi(route, verb, { body = null, params = null } = {}) {
  const options = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: verb.toUpperCase(),
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  let paramsString = "";
  if (params) {
    paramsString = "?" + new URLSearchParams(params);
  }
  const response = await fetch(BSDD_API_URL + route + paramsString, options);
  return response.json();
}

function toIfcType(s) {
  s = "Ifc_" + s;
  return s.replace(/([-_][a-z])/gi, $1 => {
    return $1.toUpperCase().replace("-", "").replace("_", "");
  });
}

export { requestApi, toIfcType };

const PRIORITIES = Object.freeze({
  URGENT: {
    text: "URGENT",
    color: "#ED1212"
  },
  SECURITE: {
    text: "SÉCURITÉ",
    color: "#F4A124"
  },
  SENSIBLE: {
    text: "SENSIBLE",
    color: "#ECD92F"
  },
  AUTRE: {
    text: "AUTRE",
    color: "#898989"
  },
  PROJET: {
    text: "PROJET",
    color: "#3B4DEA"
  },
  AF1: {
    text: "AF1",
    color: "#8551C8"
  },
  AF2: {
    text: "AF2",
    color: "#C7A2F8"
  },
  ATC: {
    text: "ATC",
    color: "#4D9307"
  },
  AT1: {
    text: "AT1",
    color: "#A2E361"
  },
  AT2: {
    text: "AT2",
    color: "#E9FAD7"
  },
});

const TYPES = Object.freeze({
  I1: {
    id: "I1",
    text: "demandes d'interventions (DI/OT)",
  },
  I2: {
    id: "I2",
    text: "modifications de process",
  },
  I3: {
    id: "I3",
    text: "activités sécurités (plus utilisés)",
  },
  I4: {
    id: "I4",
    text: "I4",
  },
  I5: {
    id: "I5",
    text: "demande de travaux",
  },
  I6: {
    id: "I6",
    text: "I6",
  },
  SEC1: {
    id: "SEC1",
    text: "SEC1",
  },
  SEC2: {
    id: "SEC2",
    text: "SEC2",
  },
  SEC3: {
    id: "SEC3",
    text: "SEC3",
  },
  SEC4: {
    id: "SEC4",
    text: "SEC4",
  },
});

export { PRIORITIES, TYPES };
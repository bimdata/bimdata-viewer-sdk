import { reactive } from "vue";

const EMPTY_FILTERS = {
  priorities: [],
  statuses: [],
  types: [],
  startDate: null,
  endDate: null,
  startPrice: null,
  endPrice: null,
};

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

function useFilter(data) {
  const filters = reactive({ ...EMPTY_FILTERS });

  function apply(f) {
    Object.assign(filters, f);
  }

  return {
    filters,
    apply,
  };
}

export { PRIORITIES, useFilter };
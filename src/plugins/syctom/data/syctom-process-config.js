import iconCombustible from "../assets/icon-combustible.svg";
import iconCompteur from "../assets/icon-compteur.svg";
import iconStockage from "../assets/icon-stockage.svg";

export const GROUPS = [
  {
    label: "Compteurs procédés",
    icon: iconCompteur,
    items: [
      { label: "Vapeur vers CPCU", unit: "t", tag3: ["540FI0054"] },
      { label: "Condensat de CPCU", unit: "m3", tag3: ["580FI0005"] },
      { label: "Vapeur HP vers GTA", unit: "t", tag3: ["540FI0009"] },
      { label: "Vapeur HP vers cond. auxiliaire", unit: "t", tag3: ["540FI0010"] },
      { label: "MP vers collecteur BP", unit: "t", tag3: ["540FI0080"] },
      { label: "Vapeur BP vers degazeur", unit: "t", tag3: ["530FC0002"] },
      { label: "Eau alimentaire totale", unit: "t", tag3: ["530FI0100"] },
      { label: "Eau alimentaire désurchauffe MP", unit: "m3", tag3: ["530FI0070"] },
      { label: "Eau alimentaire désurchauffe CPCU", unit: "m3", tag3: ["540FI0076"] },
      { label: "Eau alimentaire désurchauffe HPMP", unit: "m3", tag3: ["540FI0074"] },
      { label: "Condensats batiments administratifs", unit: "m3", tag3: ["540FI0207"] },
      { label: "Retour condenseur principal", unit: "m3", tag3: ["530FI0055"] },
      { label: "Retours condensats", unit: "m3", tag3: ["530FI0057"] },
      { label: "Vapeur HP", unit: "t", tag1: ["271FI0166"], tag2: ["272FI0166"] },
      { label: "Eau alimentaire vers chaudière", unit: "t", tag1: ["271FC0100"], tag2: ["272FC0100"] },
      { label: "Vapeur MP rechauffeur", unit: "t", tag1: ["540FI0079"], tag2: ["540FI0078"] },
      { label: "Eau alimentaire vers rechauf d'air", unit: "t", tag1: ["540FI0077"], tag2: ["540FI0075"] },
    ],
  },
  {
    label: "Compteurs réactifs",
    icon: iconCompteur,
    items: [
      { label: "Acide Chlorydrique", unit: "m3", tag3: ["590FI0032"] },
      { label: "Soude", unit: "m3", tag3: ["590FI0132"] },
      { label: "Bicabornate de sodium", unit: "t", tag1: ["391SI0503"], tag2: ["392SI0503"] },
      { label: "Coke de lignite", unit: "kg", tag1: ["391SI0504"], tag2: ["392SI0504"] },
      { label: "Ammoniaque", unit: "l", tag1: ["341FI0303A", "341FI0303B"], tag2: ["342FI0303A", "342FI0303B"] },
    ],
  },
  {
    label: "Compteurs utilisés",
    icon: iconCompteur,
    items: [
      { label: "Eau brute", unit: "m3", tag3: ["620FI003"] },
      { label: "Eau de Seine", unit: "m3", tag3: ["610FI1001"] },
      { label: "Eau déminée + Condensat", unit: "m3", tag3: ["520FI0320"] },
      { label: "Eau déminérailsée primaire", unit: "m3", tag1: ["520FI0180"], tag2: ["520FI0200"] },
      { label: "Gaz naturel", unit: "m3", tag1: ["341FI0301"], tag2: ["342FI0301"] },
      { label: "Fuel", unit: "l", tag1: ["261FI0012", "261FI0062"], tag2: ["262FI0012", "262FI0062"] },
    ],
  },
  {
    label: "Combustibles",
    icon: iconCombustible,
    items: [
      { label: "Gaz naturel", unit: "m3", tag1: ["341FI0301"], tag2: ["342FI0301"] },
      { label: "Fuel", unit: "l", tag1: ["261FI0012", "261FI0062"], tag2: ["262FI0012", "262FI0062"] },
    ],
  },
  {
    label: "Stockage et distribution des réactifs TER",
    icon: iconStockage,
    items: [
      { label: "Chlorure Ferrique", unit: "l", tag1: ["590FQI0202A"] },
      { label: "Acide Déminée", unit: "m3", tag1: ["590FQI0032A"] },
      { label: "Bisulfite", unit: "l", tag1: ["590FQI0300A"] },
      { label: "Soude Déminée", unit: "m3", tag1: ["590FQI0132A"] },
      { label: "Javel", unit: "l", tag1: ["590FQI0250A"] },
    ],
  },
  // {
  //   label: "Sortie Four",
  //   icon: "",
  //   items: [
  //     { label: "O2", unit: "%", tag3: ["272AI0077"] },
  //     { label: "Température", unit: "°C", tag3: ["272TC0076"] },
  //   ],
  // },
  // {
  //   label: "Grille",
  //   icon: "",
  //   data: [
  //     { label: "Température bas de grille", unit: "°C", tag3: ["272TI0008", "272TI0011"] },
  //   ],
  // },
];

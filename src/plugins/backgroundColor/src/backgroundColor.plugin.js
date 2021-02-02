import pickerModal from "./pickerModal.vue";

export default {
  name: "BackgroundColorPlugin",
  startupScript($viewer) {
    $viewer.contextMenu.registerCommand({
        get label() {
          return $viewer.vm.$t("BackgroundColorPlugin.title");
        },
        execute: () => $viewer.globalContext.modals.pushModal(pickerModal),
      });
  },
  i18n: {
    en: {
      title: "Change background color",
      apply: "Apply",
      close: "Close",
    },
    fr: {
      title: "Changer la couleur de fond",
      apply: "Appliquer",
      close: "Fermer",
    },
  },
};

<template>
  <div class="export-modal">
    <div class="export-modal__close">
      <BIMDataIcon
        @click.native="$emit('close')"
        class="fill-primary"
        name="close"
      >
      </BIMDataIcon>
    </div>
    <div class="export-modal__content">
      <h2 class="export-modal__content__title">
        {{ $t("excelExport.title") }}
      </h2>
      <div class="export-modal__content__error" v-if="errorDisplayed">
        {{ errorMessage }}
      </div>
      <div class="export-modal__content__input">
        <BIMDataInput
          v-model="fileName"
          :placeholder="$t('excelExport.label')"
          :error="!fileName"
          :errorMessage="$t('excelExport.error')"
          :loading="loading"
        />
      </div>
      <div class="export-modal__export">
        <BIMDataButton
          fill
          color="primary"
          radius
          @click="onExportClick"
          :disabled="!fileName || loading"
        >
          {{ $t("excelExport.button") }}
        </BIMDataButton>
      </div>
    </div>
  </div>
</template>

<script>
import fileSaver from "file-saver";
import * as ExcelImport from "exceljs/dist/exceljs.min.js";
let ExcelJS;
if (ExcelImport.default) {
  ExcelJS = ExcelImport.default;
} else {
  ExcelJS = ExcelImport;
}
const UNIT_SYMBOL = {
  "": "",
  MICROMETRE: "µm",
  MILLIMETRE: "mm",
  CENTIMETRE: "cm",
  DECIMETRE: "dm",
  METRE: "m",
  DECAMETRE: "dam",
  HECTOMETRE: "hm",
  KILOMETRE: "km",
};
import {
  BIMDataButton,
  BIMDataIcon,
  BIMDataInput,
} from "@bimdata/design-system/components.js";
export default {
  components: {
    BIMDataIcon,
    BIMDataButton,
    BIMDataInput,
  },
  data() {
    return {
      fileName: "",
      errorDisplayed: false,
      errorMessage: "",
      loading: false,
    };
  },
  created() {
    // Set default fileName
    const parts = this.$viewer.state.ifcs[0].document.file_name.split(".");
    parts.pop(); // Remove extension
    const name = parts.join("."); // rebuild name without extension
    this.fileName =
      name +
      "-export-" +
      new Date().toLocaleDateString(this.$i18n.locale).replace(/\//g, "-");
  },
  methods: {
    onExportClick() {
      if (!this.fileName) {
        this.errorDisplayed = true;
      } else {
        this.retrieveElementProperties();
      }
    },
    async retrieveElementProperties() {
      this.loading = true;
      const selectedObjects = this.$viewer.state.selectedObjects;
      const ifcs = this.$viewer.state.ifcs;
      const requests = ifcs.map(ifc => this.$viewer.api.getRawElements(ifc.id));
      const rawElementsArray = await Promise.all(requests);
      const rawElements = Object.assign(...rawElementsArray);
      await this.buildExcel(selectedObjects, rawElements);
    },
    async buildExcel(selectedObjects, rawElements) {
      const now = new Date();
      const workbook = new ExcelJS.Workbook();
      workbook.created = now;
      const ifcTypes = new Set(selectedObjects.map(object => this.convertIfcType(object.type)));
      ifcTypes.forEach(ifcType => {
        const selectedObjectsWithType = selectedObjects.filter(object => this.convertIfcType(object.type) === ifcType);
        const worksheet = workbook.addWorksheet(ifcType);
        // uuid, name, ifc type, object type, base quantities, Pset common
        const columns = [
          { header: "UUID", key: "uuid", width: 30 },
          { header: "Nom", key: "name", width: 32 },
          {
            header: "Type d'objet",
            key: "objectType",
            width: 32,
          },
        ];

        let dynamicColumns = new Set();

        selectedObjectsWithType.forEach(object => {
          const quantitiesPset = rawElements[object.uuid].propertySets.find(
            pset => pset.name === "BaseQuantities"
          );
          if (quantitiesPset) {
            quantitiesPset.properties.forEach(prop => {
              dynamicColumns.add("QTO." + prop.definition.name);
            });
          }
          const commonPset = rawElements[object.uuid].propertySets.find(
            pset => pset.name.startsWith('Pset_') && pset.name.endsWith('Common')
          );
          if (commonPset) {
            commonPset.properties.forEach(prop => {
              dynamicColumns.add("Common." + prop.definition.name);
            });
          }
        });

        dynamicColumns = Array.from(dynamicColumns);

        dynamicColumns.forEach(column => {
          columns.push({
            header: column,
            key: column,
            width: 30,
          });
        });
        worksheet.columns = columns;

        const rows = selectedObjectsWithType.forEach(object => {
          const quantitiesPset = rawElements[object.uuid].propertySets.find(
            pset => pset.name === "BaseQuantities"
          );
          const commonPset = rawElements[object.uuid].propertySets.find(
            pset => pset.name.startsWith('Pset_') && pset.name.endsWith('Common')
          );

          const row = {
            uuid: object.uuid,
            name: object.name,
            ifcType: this.convertIfcType(object.type),
            objectType: object.object_type,
          };
          if (quantitiesPset) {
            quantitiesPset.properties.forEach(prop => {
              row["QTO." + prop.definition.name] = prop.value;
            });
          }
          if (commonPset) {
            commonPset.properties.forEach(prop => {
              row["Common." + prop.definition.name] = prop.value;
            });
          }

          worksheet.addRow(row);
        });

      });
      // worksheet.autoFilter = {
      //   from: "A1",
      //   to: "M1",
      // };
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      fileSaver.saveAs(blob, this.fileName + ".xlsx");
      this.loading = false;
    },
    convertIfcType(type) {
      return "Ifc" + this.toCamel(type.charAt(0).toUpperCase() + type.slice(1));
    },
    toCamel(str) {
      return str.replace(/([-_][a-z])/gi, $1 => {
        return $1.toUpperCase().replace("-", "").replace("_", "");
      });
    },
  },
};
</script>

<style lang="scss">
@import "../node_modules/@bimdata/design-system/dist/scss/_BIMDataVariables.scss";
@import "../node_modules/@bimdata/design-system/dist/scss/mixins/_font-size.scss";
@import "./_ExportModal.scss";
</style>

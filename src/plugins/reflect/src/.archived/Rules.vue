<template>
  <div class="rules">
    <template v-if="adminMode">
      <BIMDataSearchAutocomplete
        placeholder="Search properties of type"
        :items="arrayTypesIfc"
        :autoclear="false"
        @item-click="onItemClick"
      >
        <template #logoPlaceholder>
          <BIMDataIcon name="doubleChevron" fill color="default" size="xxs" />
        </template>
      </BIMDataSearchAutocomplete>
  
      <BIMDataSelect
        class="m-24"
        width="200px"
        label="Selector output properties"
        :multi="true"
        :options="arrayProperties"
        v-model="selectionProperties"
      />

      <BIMDataSearch
        width="100%"
        :placeholder="$t('ReflectPlugin.search')"
        :clear="true"
        v-model="queryString"
        @update:modelValue="testLark"
        @enter="handleClick"
        @clear="queryString = ''"
      />
    </template>

    <div class="rules__header">
      <BIMDataButton
        width="calc(100% - 32px - var(--spacing-unit))"
        color="primary" fill radius
        @click="runPackage"
      >
        <BIMDataIcon name="right" size="xxs" margin="0 6px 0 0" />
        Lancement cahier des charges
      </BIMDataButton>
      <BIMDataButton
        color="high" fill radius icon
        @click="reset"
      >
        <BIMDataIcon name="delete" size="xs" />
      </BIMDataButton>
    </div>

    <div class="rules__body">
      <BIMDataTable
        class="validation-table"
        :columns="validationTableColumns"
        :rows="validationTableRows"
        :rowHeight="36"
        placeholder="Aucune règle"
      >
        <template #cell-validation_finale="{ row }">
          <div
            class="validation-status-cell"
            :class="row.validation_finale === '100.0%' ? 'valid' : 'not-valid'"
          >
            {{ row.validation_finale }}
          </div>
        </template>
      </BIMDataTable>
    </div>

    <div v-show="loading">
      <BIMDataLoading
        message="Calcul en cours..."
        subMessage="Transfert des informations de Tipee vers BIMData"
      />
    </div>
  </div>
</template>

<script>
import eachLimit from "async/eachLimit";
import fileSaver from "file-saver";
import _ from "lodash";
import {
  REFLECT_COLOR_NOT_VALID,
  REFLECT_TOPIC_LABEL,
  REFLECT_TOPIC_SYSTEM
} from "../config.js";
import { get_parser, Token } from "../my_parser.js";
import service from "../service.js";
import state from "../useless/state";
import { toIfcType } from "../utils.js";
import { generateAndDownloadXLS } from "../xls-utils.js";

const validationTableColumns = [
  {
    id: "numero_chapitre",
    label: "N°"
  },
  {
    id: "titre_chapitre",
    label: "Titre"
  },
  {
    id: "code_regle",
    label: "Code"
  },
  {
    id: "validation_finale",
    label: " ",
    align: "center"
  }
];

// Components
import {
  BIMDataButton,
  BIMDataIcon,
  BIMDataLoading,
  BIMDataSearch,
  BIMDataSearchAutocomplete,
  BIMDataSelect,
  BIMDataTable,
} from "@bimdata/design-system";

export default {
  components: {
    BIMDataButton,
    BIMDataIcon,
    BIMDataLoading,
    BIMDataSearch,
    BIMDataSearchAutocomplete,
    BIMDataSelect,
    BIMDataTable,
  },
  props: {
    adminMode: {
      type: Boolean,
      required: false,
    },
    projectId: {
      type: String,
      required: true,
    },
    rules: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      runResults: null,
      reflectElementUuids: null,
      reflectElementUuidsNotValid: null,
      columnsResultData: [],
      rowsResultData: [],
      validationTableColumns,
      validationTableRows: [],

      // --- Admin Mode data ---
      queryString: '.IfcSpace[Name *= "CH1"]',
      properties: [],
      selectionProperties: ["BaseQuantities.*"],
      arrayProperties: [],
      arrayTypesIfc: [],
    };
  },
  created() {
    this.viewer3dPlugin = this.$viewer.globalContext.getPlugins("viewer3d")[0];
    this.bcfManager = this.$viewer.globalContext.getPlugins("bcfManager")[0];
    this.bcfApi = this.$viewer.api.apiClient.bcfApi;
  },
  mounted() {
    this.arrayTypesIfc = this.getTypeOfUuids();
  },
  methods: {
    async handleXLSDownload() {
      this.loading = true;
      await generateAndDownloadXLS(
        this.columnsResultData,
        this.rowsResultData,
        this.validationTableRows,
        "Results"
      );
      this.loading = false;
    },
    async handleBCFDownload() {
      this.loading = true;
      const response = await this.bcfApi.downloadBcfExport(
        this.$viewer.api.projectId
      );
      if (response) {
        const fileName =
          "Results_" +
          new Date().getHours() +
          ":" +
          new Date().getMinutes() +
          ":" +
          new Date().getSeconds() +
          ".bcfzip";
        fileSaver.saveAs(response, "BCF_" + fileName);
      }
      this.loading = false;
    },

    async reset() {
      this.loading = true;

      this.rowsResultData = [];
      this.columnsResultData = [];
      this.validationTableRows = [];

      const uuids = [...this.$viewer.state.models[0].uuids.keys()];
      this.$viewer.state.showObjectsByUuids(uuids);
      this.$viewer.state.deselectObjectsByUuids(uuids);
      this.$viewer.state.colorizeObjectsByUuids(uuids, null);
      this.viewer3dPlugin.fitViewObjects();

      try {
        // Clear all bcf topics with label "Reflect"
        let topics = await this.bcfApi.getTopics(this.$viewer.api.projectId);
        topics = topics.filter(topic => topic.labels.includes(REFLECT_TOPIC_LABEL));
        await eachLimit(topics, 100, async topic => {
          await this.bcfApi.deleteTopic(topic.guid, this.$viewer.api.projectId)
        });
      } catch (error) {
        console.error("[ReflectPlugin] Clear topics error: ", error);
      }

      this.loading = false;
    },

    async runPackage() {
      await this.reset();
      this.loading = true;

      const runResults = await service.runPackage(this.projectId);

      if (runResults.length > 0) {
        this.reflectElementUuids = [];
        this.reflectElementUuidsNotValid = [];

        for (const { result } of runResults) {
          await eachLimit(result, 100, async res => {
            const uuid = res.guid ?? res.GlobalId ?? res.guids;

            this.reflectElementUuids.push(uuid);

            if (res.guid && res.validation_finale === false) {
              this.reflectElementUuidsNotValid.push(uuid);
              await this.createReflectTopic(res);
            }
          });
        }

        this.validationTableRows = runResults
          .reduce((acc, rule) => acc.concat(rule.validation_generale), []);

        const uuids = [...this.$viewer.state.models[0].uuids.keys()];
        const diff = _.difference(uuids, this.reflectElementUuids);
        this.$viewer.state.hideObjectsByUuids(diff);
        this.$viewer.state.colorizeObjectsByUuids(this.reflectElementUuidsNotValid, REFLECT_COLOR_NOT_VALID);
        this.viewer3dPlugin.fitViewObjects(this.reflectElementUuids);
      }

      this.loading = false;
    },
    async createReflectTopic(res) {
      const object = {
        ifc_guid: res.guid,
        originating_system: REFLECT_TOPIC_SYSTEM,
      };
      const topic = {
        title: res.code_regle,
        description: `Please validate ${res.title} ${res.code_regle}`,
        topic_type: "Reflect RIVP",
        topic_status: "Opened",
        priority: "10",
        labels: [REFLECT_TOPIC_LABEL],
        assigned_to: "RIVP",
        viewpoints: [
          {
            components: {
              selection: [object],
              coloring: [
                {
                  color: "#193F9E",
                  components: [object],
                },
              ],
              visibility: {
                default_visibility: false,
                exceptions: [object],
                view_setup_hints: {
                  spaces_visible: false,
                  space_boundaries_visible: false,
                  openings_visible: false,
                },
              },
            },
          },
        ],
      };

      // await this.bcfApi.createFullTopic(this.$viewer.api.projectId, topic);
      await Promise.resolve();
    },

    // --- Admin Mode methods ---

    handleClick() {
      this.loading = true;

      this.$emit("reflect-connected-method", state.connected);

      if (state.connected) {
        this.reset();
        let rule_type;

        const regex = /^[.|@]/g;

        if (regex.test(this.queryString)) {
          rule_type = "reflect";
        } else {
          rule_type = "nlp";
        }

        if (rule_type) {
          this.fetchData(rule_type, this.queryString).then(async res => {
            this.runResults = await service.runQuery(this.projectId, res.queryBuilder);
            if (this.runResults.length > 0) {
              this.reflectElementUuids = [];
              this.runResults.map(elem => {
                // search guid in object
                let filtered_keys = function (obj, filter) {
                  let keys = [];
                  for (let [key, value] of Object.entries(obj)) {
                    if (obj.hasOwnProperty(key) && filter.test(key)) {
                      keys.push(value);
                    }
                  }
                  return keys;
                };

                elem.result.map(result => {
                  this.reflectElementUuids.push(
                    filtered_keys(result, /guid|GlobalId|guids/)[0]
                  );
                });
              });

              this.initTableResults();

              const uuids = [...this.$viewer.state.models[0].uuids.keys()];
              const diff = _.difference(uuids, this.reflectElementUuids);
              this.$viewer.state.hideObjectsByUuids(diff);
              this.viewer3dPlugin.fitViewObjects(this.reflectElementUuids);

              this.loading = false;
            }
          });
        }
      }
    },
    async fetchData(ruleType, queryStr) {
      let postData;

      if (ruleType === "nlp") {
        const queryBuilder = {
          query: queryStr,
          type_rule: ruleType,
          attributes: "",
        };
        postData = {
          project_id: this.projectId,
          queryBuilder,
        };
      }

      if (ruleType === "reflect") {
        const queryBuilder = {
          attributes: _.uniq(this.selectionProperties),
          query: queryStr,
          type_rule: ruleType,
        };
        postData = {
          project_id: this.projectId,
          queryBuilder,
        };
      }

      return postData;
    },
    initTableResults() {
      this.rowsResultData = this.runResults
        .reduce((acc, rule)  => acc.concat(rule.result), []);

      const keysResultData = this.rowsResultData.reduce(
        (acc, elem) => acc.concat(Object.keys(elem)), []
      );

      this.columnsResultData = Array.from(new Set(keysResultData)).map(
        item => ({ id: item, label: item })
      );
    },
    async handleProperties(title) {
      this.loading = true;
      this.arrayProperties = await service.getProperties(this.projectId, title);
      if (this.arrayProperties && this.arrayProperties.length > 0) {
        this.properties = this.arrayProperties.map(
          (elem, index) => ({ id: index, title: elem })
        );
      }
      this.loading = false;
    },
    testLark(item) {
      let transformer = {
        number: ([n]) => parseFloat(n.value),
        string: ([s]) => s.value.slice(1, -1),
        array: Array.from,
        pair: Array.from,
        object: Object.fromEntries,

        null: () => null,
        true: () => true,
        false: () => false,
      };
      const parser = get_parser({ transformer });
      function ignore_errors(e) {
        // This function gets called whenever there is a parse error

        if (e.token.type === "COMMA") {
          // Ignore a misplaced comma
          return true;
        } else if (e.token.type === "SIGNED_NUMBER") {
          // Unexpected number. Try to feed a comma and retry the number
          e.interactive_parser.feed_token(new Token("COMMA", ","));
          e.interactive_parser.feed_token(e.token);
          return true;
        }

        // Unhandled error. Will stop parse and raise exception
        return false;
      }
      // console.log(parser.parse(item, null, ignore_errors));
      try {
        const lark_object = parser.parse(item, null, ignore_errors);
        const class_selector = this.recurse_lark(lark_object);
      } catch (error) {
        console.error(error);
        // expected output: ReferenceError: nonExistentFunction is not defined
        // Note - error messages will vary depending on browser
      }
    },
    recurse_lark(lark_object) {
      let class_selector;
      if (lark_object.data === "class_selector") {
        class_selector = lark_object.children[0].value;
        this.handleProperties(class_selector);

        return class_selector;
      }
      if (lark_object.children) {
        return this.recurse_lark(lark_object.children[0]);
      }
    },
    getTypeOfUuids() {
      return _.uniq(
        this.$viewer.state.objects.map(object => toIfcType(object.type))
      ).map(
        (elem, index) => ({ id: index, title: elem })
      );
    },
    onItemClick($event) {
      this.selectionProperties = [];
      this.handleProperties($event.title);
    },
  },
};
</script>

<style scoped lang="scss" src="./Rules.scss"></style>

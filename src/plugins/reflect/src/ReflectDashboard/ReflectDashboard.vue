<template>
  <div class="reflect-dashboard">
    <div class="reflect-dashboard__header">
      <BIMDataButton ghost square icon @click="showMenu = !showMenu">
        <BIMDataIcon name="burgerMenu" size="l" />
      </BIMDataButton>
      <span class="title">
        <img src="../../assets/favicon-32x32.png" alt="Tipee" />
        <h4>REFLECT</h4>
      </span>
      <BIMDataButton ghost square icon>
        <BIMDataIcon name="fullscreen" size="s" />
      </BIMDataButton>

      <div v-show="showMenu" class="menu">
        <BIMDataButton width="100%" ghost square @click="exportDataToXLS">
          <BIMDataIcon name="export" size="xs" margin="0 6px 0 0" />
          Exporter au format Excel
        </BIMDataButton>
        <BIMDataButton width="100%" ghost square @click="exportBcfToXML">
          <BIMDataIcon name="export" size="xs" margin="0 6px 0 0" />
          Exporter les BCF au format XML
        </BIMDataButton>
        <BIMDataButton width="100%" color="high" ghost square @click="$emit('logout')">
          <BIMDataIcon name="logout" size="xs" margin="0 6px 0 0" />
          Se déconnecter
        </BIMDataButton>
      </div>
    </div>

    <div class="reflect-dashboard__body">
      <div class="reflect-dashboard__body__actions">
        <BIMDataButton
          class="color-tipee"
          width="calc(100% - 32px - var(--spacing-unit))"
          fill radius
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

      <div class="reflect-dashboard__body__results">
        <ReflectValidationTable :rows="validationData" />
      </div>
    </div>

    <div v-show="loading" class="loading">
      <BIMDataLoading
        class="color-tipee"
        message="Calcul en cours..."
        subMessage="Transfert des informations de Tipee vers BIMData"
      />
    </div>
  </div>
</template>

<script>
import eachLimit from "async/eachLimit";
import FileSaver from "file-saver";
import diff from "lodash/difference"
import {
  REFLECT_BCF_FILENAME,
  REFLECT_COLOR_NOT_VALID,
  REFLECT_TOPIC_LABEL,
  REFLECT_TOPIC_SYSTEM,
  REFLECT_XLS_FILENAME
} from "../config.js";
import service from "../service.js";
import { generateAndDownloadXLS } from "../xls-utils.js";

// Components
import {
  BIMDataButton,
  BIMDataIcon,
  BIMDataLoading,
} from "@bimdata/design-system";
import ReflectValidationTable from "../ReflectValidationTable/ReflectValidationTable.vue";

export default {
  components: {
    BIMDataButton,
    BIMDataIcon,
    BIMDataLoading,
    ReflectValidationTable
  },
  emits: [
    "logout",
  ],
  data() {
    return {
      adminMode: false,
      loading: false,
      processing: false,
      projects: [],
      projectId: null,
      rules: [],
      showMenu: false,

      reflectElementUuids: null,
      reflectElementUuidsNotValid: null,
      validationData: [],
    };
  },
  created() {
    this.viewer3d = this.$viewer.globalContext.getPlugins("viewer3d")[0];
    this.bcfManager = this.$viewer.globalContext.getPlugins("bcfManager")[0];
    this.bcfApi = this.$viewer.api.apiClient.bcfApi;
  },
  mounted() {
    this.$viewer.globalContext.hub.once("3d-model-loaded", () => {
      if (this.$viewer.state.models.length > 1) {
        this.$viewer.localContext.hub.emit("alert", {
          type: "error",
          message:
            "You can't split more than one model at once. Please load only one model.",
        });
      }
    });
    this.$viewer.localContext.registerShortcut({
      name: "admin",
      key: "$",
      ctrlKey: true,
      shiftKey: false,
      execute: () => this.toggleAdminMode(),
    });

    if (this.$viewer.state.models.length > 0) {
      this.loadProject();
    }
  },
  beforeDestroy() {
    clearInterval(this.processing);
    this.$viewer.localContext.unregisterShortcut("admin");
  },
  methods: {
    toggleAdminMode() {
      this.adminMode = !this.adminMode;
    },

    async loadProject() {
      this.loading = true;

      this.projects = await service.getProjects();

      // Get project name => model file name without extension
      const loadedModels = this.$viewer.state.models;
      const fileName = loadedModels[0].document.file_name;
      const projectName = fileName.split(".").slice(0, -1).join(".");

      const project = this.projects.find(p => p.name === projectName);

      if (this.projects.length === 0 || !project) {
        await this.initProject(projectName);
      } else {
        this.projectId = project._id;
      }

      this.rules = await service.getRules(this.projectId);

      this.loading = false;
    },

    async initProject(name) {
      this.loading = true;

      this.projectId = await service.createProject(name);

      const doc = this.$viewer.state.models[0].document;
      const result = await service.addIfc(this.projectId, doc.name, doc.file);
      const taskId = result.status.tasks.task_id_ifc;

      this.processing = setInterval(async () => {
        const status = await service.getTaskStatus(this.projectId, taskId);

        if (status === "SUCCESS") {
          clearInterval(this.processing);
          this.loading = false;
        }
      }, 2000);
    },

    async runPackage() {
      await this.reset();
      this.loading = true;

      const runResults = await service.runPackage(this.projectId);

      if (runResults.length > 0) {
        this.reflectElementUuids = [];
        this.reflectElementUuidsNotValid = [];

        for (const { result } of runResults) {
          await eachLimit(result, 50, async res => {
            const uuid = res.guid ?? res.GlobalId ?? res.guids;

            this.reflectElementUuids.push(uuid);

            if (res.guid && res.validation_finale === false) {
              this.reflectElementUuidsNotValid.push(uuid);
              await this.createReflectTopic(res);
            }
          });
        }

        this.validationData = runResults
          .reduce((acc, rule) => acc.concat(rule.validation_generale), []);

        const uuids = [...this.$viewer.state.models[0].uuids.keys()];
        this.$viewer.state.hideObjectsByUuids( diff(uuids, this.reflectElementUuids) );
        this.$viewer.state.colorizeObjectsByUuids(this.reflectElementUuidsNotValid, REFLECT_COLOR_NOT_VALID);
        this.viewer3d.fitViewObjects(this.reflectElementUuids);
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

      await this.bcfApi.createFullTopic(this.$viewer.api.projectId, topic);
    },

    async reset() {
      this.loading = true;

      this.rowsResultData = [];
      this.columnsResultData = [];
      this.validationData = [];

      const uuids = [...this.$viewer.state.models[0].uuids.keys()];
      this.$viewer.state.showObjectsByUuids(uuids);
      this.$viewer.state.deselectObjectsByUuids(uuids);
      this.$viewer.state.colorizeObjectsByUuids(uuids, null);
      this.viewer3d.fitViewObjects();

      try {
        // Clear all bcf topics with label "Reflect"
        let topics = await this.bcfApi.getTopics(this.$viewer.api.projectId);
        topics = topics.filter(topic => topic.labels.includes(REFLECT_TOPIC_LABEL));
        await eachLimit(topics, 50, async topic => {
          await this.bcfApi.deleteTopic(topic.guid, this.$viewer.api.projectId)
        });
      } catch (error) {
        console.error("[ReflectPlugin] Clear topics error: ", error);
      }

      this.loading = false;
    },

    async exportDataToXLS() {
      if (this.validationData.length > 0) {
        this.loading = true;
        await generateAndDownloadXLS(
          [],
          [],
          this.validationData,
          REFLECT_XLS_FILENAME
        );
        this.loading = false;
      } else {
        this.$viewer.localContext.hub.emit("alert", {
          type: "error",
          message: "Il n'y a aucune donnée à exporter...",
        });
      }
    },

    async exportBcfToXML() {
      this.loading = true;
      const response = await this.bcfApi.downloadBcfExport(
        this.$viewer.api.projectId
      );
      if (response) {
        const now = new Date();
        FileSaver.saveAs(
          response,
          `${REFLECT_BCF_FILENAME}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}.bcfzip`
        );
      }
      this.loading = false;
    },
  },
};
</script>

<style scoped lang="scss" src="./ReflectDashboard.scss"></style>

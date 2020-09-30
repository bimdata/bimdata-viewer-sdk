<template>
  <div class="home p-24">
    <h2>BIMData SDK</h2>
    <div class="m-y-6">
      <select v-model="selectedCloud" :disabled="fetchingClouds">
        <option disabled :value="null">{{
          fetchingClouds ? "Fetching clouds" : "Select a cloud"
        }}</option>
        <option v-for="cloud of clouds" :key="cloud.id" :value="cloud">{{
          cloud.name
        }}</option>
      </select>
    </div>
    <div class="m-y-6">
      <select
        v-model="selectedProject"
        :disabled="!selectedCloud || fetchingProjects"
      >
        <option disabled :value="null">{{
          fetchingProjects ? "Fetching projects" : "Select a project"
        }}</option>
        <option
          v-for="project of projects"
          :key="project.id"
          :value="project"
          >{{ project.name }}</option
        >
      </select>
    </div>
    <div class="m-y-6">
      <select
        v-model="selectedIfc"
        :disabled="!selectedProject || fetchingIfcs"
      >
        <option disabled :value="null">{{
          fetchingIfcs ? "Fetching IFCs" : "Select an IFC"
        }}</option>
        <option v-for="ifc of ifcs" :key="ifc.id" :value="ifc">{{
          ifc.name
        }}</option>
      </select>
    </div>
    <button
      class="m-t-12"
      :disabled="!selectedCloud || !selectedProject"
      @click="go"
    >
      Go
    </button>
  </div>
</template>

<script>
import getClient from "../api/api.js";

import { mapGetters } from "vuex";

export default {
  name: "home",
  data() {
    return {
      clouds: [],
      selectedCloud: null,
      fetchingClouds: false,
      projects: [],
      selectedProject: null,
      fetchingProjects: false,
      ifcs: [],
      selectedIfc: null,
      fetchingIfcs: false,
    };
  },
  computed: {
    ...mapGetters(["oidcAccessToken"]),
    collaborationApi() {
      const apiClient = getClient({
        accessToken: this.oidcAccessToken,
        apiUrl: process.env.VUE_APP_BIMDATA_API_URL,
      });
      return new apiClient.CollaborationApi();
    },
    ifcApi() {
      const apiClient = getClient({
        accessToken: this.oidcAccessToken,
        apiUrl: process.env.VUE_APP_BIMDATA_API_URL,
      });
      return new apiClient.IfcApi();
    },
  },
  watch: {
    selectedCloud() {
      if (this.selectedCloud) {
        this.selectedIfc = null;
        this.selectedProject = null;
        this.getProjects();
      }
    },
    selectedProject() {
      if (this.selectedProject) {
        this.selectedIfc = null;
        this.getIfcs();
      }
    },
  },
  created() {
    this.getClouds();
  },
  methods: {
    go() {
      this.$router.push({
        name: "viewer",
        query: {
          cloudId: this.selectedCloud.id,
          projectId: this.selectedProject.id,
          ifcId: this.selectedIfc.id,
        },
      });
    },
    async getClouds() {
      this.fetchingClouds = true;
      this.clouds = await this.collaborationApi.getClouds();
      this.fetchingClouds = false;
    },
    async getProjects() {
      this.fetchingProjects = true;
      this.projects = await this.collaborationApi.getProjects(
        this.selectedCloud.id
      );
      this.fetchingProjects = false;
    },
    async getIfcs() {
      this.fetchingIfcs = true;
      this.ifcs = await this.ifcApi.getIfcs(
        this.selectedCloud.id,
        this.selectedProject.id
      );
      this.fetchingIfcs = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.home {
  margin: auto;
  width: 30%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  select {
    width: 150px;
    height: 32px;
    border: none;
    background-color: white;
    border-bottom: 1px solid;
    outline: none;
    cursor: pointer;
  }
  button {
    width: 150px;
    height: 32px;
    background-color: #2f374a;
    color: #fff;
    border-radius: 3px;
    background-origin: none;
    border: none;
    cursor: pointer;
    &:hover {
      background-color: #3b455d;
    }
  }
}
</style>

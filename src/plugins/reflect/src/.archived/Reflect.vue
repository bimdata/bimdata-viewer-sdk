<template>
  <div class="reflect-main m-48">
    <div class="" v-if="selected_project === null">
      <ul class="bimdata-list bimdata-cards">
        <BIMDataCard
          width="30%"
          v-for="item in projects"
          :key="item.project_id"
          @click.native="getRules(item)"
        >
          <template #content>
            <h4>{{ item.name }}</h4>
          </template>
        </BIMDataCard>
      </ul>
    </div>

    <div class="" v-else>
      <ul class="bimdata-list bimdata-cards">
        <BIMDataCard
          width="30%"
          v-for="item in rules"
          :key="item.rule_id"
          @click.native="runRule(item)"
        >
          <template #content>
            <h4>{{ item.name }}</h4>
          </template>
        </BIMDataCard>
      </ul>
    </div>

    <!--    <div class="p-x-12">-->
    <!--      <BIMDataButton-->
    <!--        width="100%"-->
    <!--        @click="backProject"-->
    <!--        class="bimdata-btn__fill bimdata-btn__fill&#45;&#45;primary bimdata-btn__radius"-->
    <!--      >-->
    <!--        back projects-->
    <!--      </BIMDataButton>-->
    <!--    </div>-->

    <div v-if="loading" class="loading">
      <BIMDataLoading />
    </div>
  </div>
</template>

<script>
import { BIMDataCard, BIMDataLoading } from "@bimdata/design-system";

import AddProject from "./reflect_tabs/AddProjectReflect.vue";
import { mapGetters } from "vuex";

export default {
  // https://vuejs.org/v2/guide/components.html
  name: "Reflect",
  components: {
    BIMDataCard,
    BIMDataLoading
  },
  props: {
    access_token: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      title: "REFLECT",
      projectName: "",
      descriptionName: "",
      clouds: [],
      rules: [],
      ifcs: [],
      projects: [],
      selectedCloud: null,
      fetchingClouds: false,
      selectedProject: null,
      fetchingProjects: false,
      selectedIfc: null,
      fetchingIfcs: false,
      accessToken: null,
      selected_project: null,
      loading: false,
      buttonDisabled: true,
    };
  },
  computed: {
    ...mapGetters(["oidcAccessToken"]),
    headers(token) {
      return {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      };
    },
    reflect_url() {
      return "https://smarty.plateforme-tipee.com";
    },
    api_bimdata_url() {
      return "https://api.bimdata.io/cloud/121/project/256948/model/19803/export\n";
    },
  },
  created() {
    // Set default fileName
    const parts = this.$viewer.state.ifcs[0].document.file_name.split(".");
    parts.pop(); // Remove extension
    const name = parts.join("."); // rebuild name without extension

    this.projectName =
      name +
      "-" +
      new Date().toLocaleDateString(this.$i18n.locale).replace(/\//g, "-");
    this.projectDescription = "projectDescription";
    // this.getReflectToken();
    // this.getProjects();
    this.loading = false;
  },
  methods: {
    updateValue(row, value) {
      debugger;
      row.value = value;
      row.toUpdate = true;
    },

    async getProjects() {
      this.loading = true;

      const res = await fetch(`${this.reflect_url}/reflect/projects`, {
        headers: this.headers(this.access_token),
      });
      const json = await res.json();
      this.projects = json.data;
      this.loading = false;
    },
    // async addProject() {
    //   this.loading = true;
    //   let formData = new FormData();
    //   formData.append("name", this.projectName);
    //   formData.append("description", this.projectDescription);
    //
    //   const res = await fetch(`${this.reflect_url}/reflect/project`, {
    //     headers: this.headers(this.access_token),
    //     body: formData,
    //     method: "post",
    //   });
    //   const json = await res.json();
    //   const id_current_project = json.data;
    //
    //   formData = new FormData();
    //   formData.append("file", this.api_bimdata_url());
    //
    //   const add_ifc = await fetch(
    //     `${this.reflect_url}/reflect/project/${id_current_project}/add_ifc`,
    //     {
    //       headers: this.headers(this.access_token),
    //       body: formData,
    //       method: "post",
    //     }
    //   );
    //
    //   this.loading = false;
    //
    //   await this.getProjects();
    // },

    async getIfcs() {
      const apiClient = new this.$viewer.api.apiClient.IfcApi();
      const ifcs = await apiClient.getIfcs(
        this.$viewer.api.cloudId,
        this.$viewer.api.projectId
      );

      return ifcs;
    },


    async addRule(project_id, name, description, queryBuilder) {
      this.loading = true;
      let formData = new FormData();
      formData.append("project_id", project_id);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("type_rule", "reflect");

      const res = await fetch(`${this.reflect_url}/reflect/rule`, {
        headers: this.headers(this.access_token),
        body: formData,
        method: "post",
      });
      const json = await res.json();
      const id_rule_current = json.data;

      formData = new FormData();
      formData.append("project_id", project_id);
      formData.append("type_rule", "reflect");
      formData.append("queryBuilder", queryBuilder);

      await fetch(`${this.reflect_url}/reflect/rule/${id_rule_current}`, {
        headers: this.headers(this.access_token),
        body: formData,
        method: "post",
      });

      this.loading = false;
    },

    async getRules(selected) {
      this.loading = true;
      const projectId = selected.project_id;

      const res = await fetch(
        `${this.reflect_url}/reflect/rules?` +
          new URLSearchParams({
            projectId: projectId,
          }),
        {
          headers: this.headers(this.access_token),
        }
      );
      const json = await res.json();
      this.rules = json.data;
      this.loading = false;
      this.selected_project = selected;
    },

    async runRule(selected) {
      this.loading = true;
      const projectId = selected.project_id;
      const ruleId = selected.rule_id;

      const res = await fetch(
        `${this.reflect_url}/reflect/project/${projectId}/rule/${ruleId}`,
        {
          headers: this.headers(this.access_token),
        }
      );
      const json = await res.json();
      this.resultats_rule = json.data;
      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>

</style>

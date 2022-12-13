<template>
  <div class="reflect-plugin">
    <template v-if="!connected">
      <ReflectLogin @login="checkAuthState" />
    </template>

    <template v-else>
      <ReflectDashboard @logout="logout" />
    </template>
  </div>
</template>

<script>
import { REFLECT_STORAGE_KEY } from "./config.js";
import service from "./service.js";
// Components
import ReflectDashboard from "./ReflectDashboard/ReflectDashboard.vue";
import ReflectLogin from "./ReflectLogin/ReflectLogin.vue";

export default {
  components: {
    ReflectDashboard,
    ReflectLogin,
  },
  data() {
    return {
      connected: false,
    };
  },
  mounted() {
    this.checkAuthState();
  },
  methods: {
    checkAuthState() {
      let item = localStorage.getItem(REFLECT_STORAGE_KEY);
      if (!item) {
        // If the item doesn't exist => logout
        this.logout();
      }

      item = JSON.parse(item);
      if ((new Date()).getTime() < item?.expires_at) {
        service.setAccessToken(item.access_token);
        this.connected = item.connected;
      } else {
        // If the item is expired => logout
        this.logout();
      }
    },
    logout() {
      localStorage.removeItem(REFLECT_STORAGE_KEY);
      service.setAccessToken(null);
      this.connected = false;
    },
  },
};
</script>

<style scoped lang="scss" src="./Reflect.scss"></style>

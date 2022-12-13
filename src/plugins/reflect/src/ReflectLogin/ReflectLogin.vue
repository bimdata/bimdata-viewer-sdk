<template>
  <div class="reflect-login">
    <div class="reflect-login__header flex items-center justify-center">
      <img
        width="172"
        src="../../assets/reflect.png"
        alt="Reflect, service de vérification de la qualkité des maquettes IFC."
      />
    </div>

    <div class="reflect-login__body">
      <h2 class="reflect-login__body__title">
        CONNEXION
      </h2>
      <div class="reflect-login__body__form">
        <BIMDataInput
          width="100%"
          placeholder="Nom utilisateur"
          v-model="username"
        />
        <BIMDataInput
          width="100%"
          margin="36px 0 12px 0"
          type="password"
          placeholder="Mot de passe"
          v-model="password"
        />
        <BIMDataButton
          class="m-t-48 color-tipee"
          width="100%"
          fill
          radius
          @click="submit"
        >
          Connexion
        </BIMDataButton>
      </div>
      <div class="reflect-login__body__text text-center p-y-24">
        <h3 class="color-primary">
          REFLECT
        </h3>
        <p class="color-granite">
          C’est un service de vérification de la qualité des maquettes numérique
          IFC. Ce service permet de superviser une maquette numérique en
          vérifiant sa conformité vis à vis d’un protocole préalablement défini
          (cahier des charges). L’assistant vérifie la présence et l’emplacement
          d’informations attendues dans la maquette à partir de règles.
        </p>
      </div>
    </div>

    <div class="reflect-login__footer">
      <div class="flex items-center justify-center">
        <img src="../../assets/favicon-32x32.png" alt="Tipee" />
        <span style="margin-left: 6px; font-weight: bold">Tipee 2022</span>
      </div>
      <a :href="TIPEE_PLATFORM_URL">{{ TIPEE_PLATFORM_URL }}</a>
      <a :href="TIPEE_REFLECT_URL">{{ TIPEE_REFLECT_URL }}</a>
    </div>
  </div>
</template>

<script>
import {
  TIPEE_PLATFORM_URL,
  TIPEE_REFLECT_URL,
  REFLECT_TOKEN_TTL,
  REFLECT_STORAGE_KEY
} from "../config.js";
import service from "../service.js";

// Components
import { BIMDataButton, BIMDataInput } from "@bimdata/design-system";

export default {
  components: {
    BIMDataButton,
    BIMDataInput,
  },
  data() {
    return {
      TIPEE_PLATFORM_URL,
      TIPEE_REFLECT_URL,

      password: "test_plugin",
      username: "test_plugin",
    };
  },
  emits: ["login"],
  methods: {
    async submit() {
      const json = await service.login(this.username, this.password);

      const item = {
        connected: !json.error,
        access_token: json.access_token,
        expires_at: (new Date()).getTime() + REFLECT_TOKEN_TTL,
      };

      localStorage.setItem(REFLECT_STORAGE_KEY, JSON.stringify(item));

      this.$emit("login");
    },
  },
};
</script>

<style scoped lang="scss" src="./ReflectLogin.scss"></style>

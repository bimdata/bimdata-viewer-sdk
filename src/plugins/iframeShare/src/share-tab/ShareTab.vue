<template>
  <div class="share-tab">
    <ShareCreationForm :shareBackendUrl="shareBackendUrl" />
  </div>
</template>

<script>
import ShareCreationForm from "../components/ShareCreationForm.vue";

export default {
  components: {
    ShareCreationForm,
  },
  props: {
    shareBackendUrl: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      shareUrl: null,
    };
  },
};
</script>

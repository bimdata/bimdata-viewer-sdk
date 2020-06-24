<script>
import { mapActions } from "vuex";

export default {
  name: "OidcCallback",
  mounted() {
    this.oidcSignInCallback()
      .then(redirectPath => {
        this.$router.push(redirectPath);
      })
      .catch(err => {
        console.error(err);
        this.$router.push("/oidc-callback-error"); // Handle errors any way you want
      });
  },
  methods: {
    ...mapActions(["oidcSignInCallback"]),
  },
  render() {
    return null;
  },
};
</script>

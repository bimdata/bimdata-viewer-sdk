// state.js
import {ref, reactive} from "vue";

// const state = reactive({
//   access_token: null,
//   connected: false
// }); // You can add initial values here if needed



export default {
  setup () {
    const state = reactive({ // (1)
      access_token: null,
      connected: false,
      admin: false,
    });
    // Optional: do other stuff (2)
    return {
      state // (3)
    }
  }
}
// export default state;

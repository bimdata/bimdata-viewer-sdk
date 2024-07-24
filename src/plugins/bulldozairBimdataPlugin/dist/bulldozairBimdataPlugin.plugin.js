(function(){"use strict";try{if(typeof document!="undefined"){var o=document.createElement("style");o.appendChild(document.createTextNode(".ifc-annotation{width:32px;height:32px;border-radius:50%;border:1px solid var(--color-primary);background-color:var(--color-high);font-weight:700;display:flex;justify-content:center;align-items:center;user-select:none;cursor:grab}.ifc-annotation.grabbing{cursor:grabbing}.ifc-annotation:focus{border:2px solid var(--color-high);background-color:var(--color-warning)}")),document.head.appendChild(o)}}catch(r){console.error("vite-plugin-css-injected-by-js",r)}})();
const d = (i, t) => {
  const a = i.__vccOpts || i;
  for (const [s, n] of t)
    a[s] = n;
  return a;
}, g = {
  props: {
    localContext: Object,
    index: Number,
    moveTo: Function,
    moveDone: Function,
    remove: Function
  },
  data() {
    return {
      grabbing: !1
    };
  },
  mounted() {
    this.$refs.marker.addEventListener("mousedown", this.onMouseDown);
  },
  beforeUnmount() {
    this.$refs.marker.removeEventListener("mousedown", this.onMouseDown);
  },
  methods: {
    onMouseDown() {
      this.grabbing = !0, document.addEventListener("mouseup", this.onMouseUp), document.addEventListener("mousemove", this.onMouseMove);
    },
    onMouseUp() {
      this.grabbing = !1, this.moveDone(), document.removeEventListener("mousemove", this.onMouseMove);
    },
    onMouseMove(i) {
      let t;
      if (this.localContext.window.name === "3d") {
        const { clientX: s, clientY: n } = i, { xeokit: e } = this.localContext.viewer, { x: o, y: r } = e.scene.canvas.canvas.getBoundingClientRect(), l = e.scene.pick({
          pickSurface: !0,
          canvasPos: [s - o, n - r]
        }), [u, m, v] = l ? l.worldPos : [0, 0, 0];
        t = { x: u, y: v, z: m };
      } else {
        const { movementX: s, movementY: n } = i, e = this.localContext.viewer.viewer, { x: o, y: r } = e.canvas.getBoundingClientRect(), { x: l, y: u } = this.$refs.marker.getBoundingClientRect();
        t = e.camera.getPosition({
          x: l - o + s,
          y: u - r + n
        });
      }
      this.moveTo(t);
    }
  }
};
function p(i, t, a, s, n, e) {
  return BIMDataViewerVue.openBlock(), BIMDataViewerVue.createElementBlock(
    "div",
    {
      class: BIMDataViewerVue.normalizeClass(["ifc-annotation", { grabbing: n.grabbing }]),
      ref: "marker",
      tabindex: "0",
      onKeyup: t[0] || (t[0] = BIMDataViewerVue.withKeys((...o) => a.remove && a.remove(...o), ["delete"]))
    },
    BIMDataViewerVue.toDisplayString(a.index),
    35
    /* TEXT, CLASS, HYDRATE_EVENTS */
  );
}
const c = /* @__PURE__ */ d(g, [["render", p], ["__file", "/Users/thib/Bulldozair/github/bimdata-viewer-sdk/src/plugins/bulldozairBimdataPlugin/src/bulldozairAnnotation.vue"]]);
const b = {
  data() {
    return {
      index: 0
    };
  },
  render() {
    return null;
  },
  methods: {
    createAnnotation: ({ x: i, y: t, z: a, number: s }) => {
      const { state: n } = globalThis.$viewer, e = n.addAnnotation({
        component: c,
        props: {
          index: s,
          moveDone: () => {
            globalThis.$viewer.globalContext.hub.emit("bz-annotation-move", { annotation: e });
          },
          moveTo: (o) => Object.assign(e, o),
          remove: () => (globalThis.$viewer.globalContext.hub.emit("bz-annotation-remove", { annotation: e }), n.removeAnnotation(e))
        },
        x: i,
        y: t,
        z: a
      });
    }
  },
  onOpen() {
    const { state: i } = this.$viewer, t = this.$viewer.localContext;
    t.startAnnotationMode(({ x: a, y: s, z: n, object: e }) => {
      const o = i.addAnnotation({
        component: c,
        props: {
          index: ++this.index,
          moveDone: () => {
            this.$viewer.globalContext.hub.emit("bz-annotation-move", { annotation: o, object: e });
          },
          moveTo: (r) => Object.assign(o, r),
          remove: () => (this.$viewer.globalContext.hub.emit("bz-annotation-remove", { annotation: o }), i.removeAnnotation(o))
        },
        x: a,
        y: s,
        z: n
      });
      this.$viewer.globalContext.hub.emit("bz-annotation-create", { annotation: o, object: e }), t.stopAnnotationMode(), this.$close();
    });
  }
}, h = /* @__PURE__ */ BIMDataViewerVue.createElementVNode(
  "div",
  null,
  null,
  -1
  /* HOISTED */
);
function w(i, t, a, s, n, e) {
  return BIMDataViewerVue.openBlock(), BIMDataViewerVue.createElementBlock(
    BIMDataViewerVue.Fragment,
    null,
    [
      BIMDataViewerVue.createCommentVNode(" https://vuejs.org/guide/essentials/template-syntax.html "),
      h
    ],
    2112
    /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
  );
}
const B = /* @__PURE__ */ d(b, [["render", w], ["__file", "/Users/thib/Bulldozair/github/bimdata-viewer-sdk/src/plugins/bulldozairBimdataPlugin/src/BulldozairBimdataPlugin.vue"]]), x = {
  name: "BulldozairBimdataPluginPlugin",
  // The name of the plugin
  component: B,
  addToWindows: ["3d", "2d"],
  button: {
    position: "right",
    keepOpen: !0,
    tooltip: "ifcAnnotations.tooltip",
    icon: {
      component: "BIMDataIconLocation",
      options: { size: "m" }
    }
  },
  i18n: {
    en: {
      tooltip: "BulldozairBimdataPlugin is awesome!"
    },
    fr: {
      tooltip: "BulldozairBimdataPlugin est génial !"
    }
  }
};
export {
  x as default
};

<template>
    <div class="viewer">
        <div :id="viewerId"></div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import makeBIMDataViewer from "@bimdata/viewer";

import bulldozairBimdataPlugin from "bulldozairBimdataPlugin";

export default {
    data() {
        return {
            viewerId: "bimdataViewerId",
        };
    },
    computed: {
        ...mapGetters(["oidcAccessToken"]),
    },
    mounted() {
        const bimdataViewer = makeBIMDataViewer({
            locale: "fr",
            api: {
                cloudId: this.$route.query.cloudId,
                projectId: this.$route.query.projectId,
                modelIds: [this.$route.query.modelId],
                apiUrl: import.meta.env.VITE_APP_BIMDATA_API_URL,
                accessToken: this.oidcAccessToken,
            },
            ui: {
                style: {
                    colorSecondary: '#7830fe',
                },
                header: false,
                windowManager: false,
                version: false,
                bimdataLogo: false,
                menuVisible: false,
            },
            plugins: {

            },
        });

        bimdataViewer.registerPlugin(bulldozairBimdataPlugin);

        bimdataViewer.mount(`#${this.viewerId}`, {
            ratios: [50, 50],
            direction: 'column',
            children: [
                {
                    ratios: [25, 75],
                    children: ['structure', '2d'],
                },
                {
                    ratios: [25, 75],
                    children: ['properties', '3d'],
                },
            ],
        });
        bimdataViewer.$viewer.globalContext.hub.on("bz-annotation-create", payload => {
            console.log("bz-annotation-create", payload);
        });
        bimdataViewer.$viewer.globalContext.hub.on("bz-annotation-move", payload => {
            console.log("bz-annotation-move", payload);
        });
        bimdataViewer.$viewer.globalContext.hub.on("bz-annotation-remove", payload => {
            console.log("bz-annotation-remove", payload);
        });

        bimdataViewer.$viewer.globalContext.hub.on("3d-model-loaded", payload => {
            console.log("3d-model-loaded", payload);
            const { globalContext } = bimdataViewer.$viewer;
            const pluginInstance = globalContext.plugins.get('BulldozairBimdataPluginPlugin')[0];
            pluginInstance.createAnnotation({ x: 7.855044131214674, y: 17.953135312432774, z: 1.3085887913883143, number: 123 });
        });
        bimdataViewer.$viewer.globalContext.hub.on("2d-model-loaded", payload => {
            console.log("2d-model-loaded", payload);
        });


        this.$watch(
            () => this.oidcAccessToken,
            token => {
                bimdataViewer.setAccessToken(token);
            }
        );
    },
};
</script>

<style scoped>
.viewer {
    height: 100vh;
    width: 100vw;
}
</style>

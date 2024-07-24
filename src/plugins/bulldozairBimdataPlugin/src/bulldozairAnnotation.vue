<template>
    <div
        class="ifc-annotation"
        :class="{ grabbing }"
        ref="marker"
        tabindex="0"
        @keyup.delete="remove"
    >
        {{ index }}
    </div>
</template>
<script>
export default {
    props: {
        localContext: Object,
        index: Number,
        moveTo: Function,
        moveDone: Function,
        remove: Function,
    },
    data() {
        return {
            grabbing: false,
        };
    },
    mounted() {
        this.$refs.marker.addEventListener('mousedown', this.onMouseDown);
    },
    beforeUnmount() {
        this.$refs.marker.removeEventListener('mousedown', this.onMouseDown);
    },
    methods: {
        onMouseDown() {
            this.grabbing = true;
            document.addEventListener('mouseup', this.onMouseUp);
            document.addEventListener('mousemove', this.onMouseMove);
        },
        onMouseUp() {
            this.grabbing = false;
            this.moveDone();
            document.removeEventListener('mousemove', this.onMouseMove);
        },
        onMouseMove(event) {
            let position;

            const windowName = this.localContext.window.name;

            if (windowName === '3d') {
                const { clientX, clientY } = event;

                const { xeokit } = this.localContext.viewer;
                const { x, y } = xeokit.scene.canvas.canvas.getBoundingClientRect();

                const pickResult = xeokit.scene.pick({
                    pickSurface: true,
                    canvasPos: [clientX - x, clientY - y],
                });

                const [p0, p1, p2] = pickResult ? pickResult.worldPos : [0, 0, 0];
                position = { x: p0, y: p2, z: p1 }; // xeokit is y-up
            } else {
                const { movementX, movementY } = event;

                const engine2d = this.localContext.viewer.viewer;
                const { x: cx, y: cy } = engine2d.canvas.getBoundingClientRect();
                const { x, y } = this.$refs.marker.getBoundingClientRect();

                position = engine2d.camera.getPosition({
                    x: x - cx + movementX,
                    y: y - cy + movementY,
                });
            }

            this.moveTo(position);
        },
    },
}
</script>
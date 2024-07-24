<template>
    <!-- https://vuejs.org/guide/essentials/template-syntax.html -->
    <div></div>
</template>

<script>
import BulldozairAnnotation from './bulldozairAnnotation.vue';

export default {
    data() {
        return {
            index: 0,
        };
    },
    render() {
        return null;
    },
    methods: {
        createAnnotation: ({ x, y, z, number }) => {
            const { state } = this.$viewer;
            const annotation = state.addAnnotation({
                component: BulldozairAnnotation,
                props: {
                    index: number,
                    moveDone: () => {
                        this.$viewer.globalContext.hub.emit('bz-annotation-move', { annotation });
                    },
                    moveTo: (position) => {
                        return Object.assign(annotation, position)
                    },
                    remove: () => {
                        this.$viewer.globalContext.hub.emit('bz-annotation-remove', { annotation });
                        return state.removeAnnotation(annotation)
                    },
                },
                x,
                y,
                z,
            });
        },
    },
    onOpen() {
        const { state } = this.$viewer;
        const context = this.$viewer.localContext;
        context.startAnnotationMode(({ x, y, z, object }) => {
            const annotation = state.addAnnotation({
                component: BulldozairAnnotation,
                props: {
                    index: ++this.index,
                    moveDone: () => {
                        this.$viewer.globalContext.hub.emit('bz-annotation-move', { annotation, object });
                    },
                    moveTo: (position) => {
                        return Object.assign(annotation, position)
                    },
                    remove: () => {
                        this.$viewer.globalContext.hub.emit('bz-annotation-remove', { annotation });
                        return state.removeAnnotation(annotation)
                    },
                },
                x,
                y,
                z,
            });
            this.$viewer.globalContext.hub.emit('bz-annotation-create', { annotation, object });
            context.stopAnnotationMode();
            this.$close();
        });
    },
};
</script>

<style>
.ifc-annotation {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid var(--color-primary);
    background-color: var(--color-high);
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    cursor: grab;
}

.ifc-annotation.grabbing {
    cursor: grabbing;
}

.ifc-annotation:focus {
    border: 2px solid var(--color-high);
    background-color: var(--color-warning);
}
</style>

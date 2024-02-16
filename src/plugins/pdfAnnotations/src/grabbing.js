import { onBeforeUnmount, onMounted, ref } from "vue";

export default function useGrabbing(mouseMove = () => {}) {
  const grabbing = ref(false);
  const templateRef = ref(null);

  function onMouseDown() {
    grabbing.value = true;

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
  }
  function onMouseUp() {
    document.removeEventListener("mousemove", onMouseMove);

    grabbing.value = false;
  }
  function onMouseMove(event) {
    mouseMove?.(event);
  }

  onMounted(() => templateRef.value.addEventListener("mousedown", onMouseDown));

  onBeforeUnmount(() =>
    templateRef.value.removeEventListener("mousedown", onMouseDown)
  );

  return {
    grabbing,
    templateRef,
  };
}

<template>
    <div :class="design">
        <p class="mb-1 text-white">
            {{ title }}
        </p>
        <input :class="design" type="text" v-model="inputText" class="outline-double outline-4 outline-offset-0 outline-blue-400" />
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
    modelValue: string;
    title?: string;
    design?: string;
    inputClass?: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const inputText = ref(props.modelValue);

watch(inputText, (newValue, oldValue) => {
    emit("update:modelValue", newValue);
});
</script>

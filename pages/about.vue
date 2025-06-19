<script setup>
const route = useRoute();
const enableCustomLayout = () =>{
    route.meta.layout = 'custom';
};
definePageMeta({
    layout: false,
});
</script>
<template>
    <div>
        <button @click="enableCustomLayout">Update Layout</button>
    </div>
</template>
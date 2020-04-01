<template>
    <div class="input-group">
        <div class="input-group-prepend col-auto px-0">
            <label class="input-group-text" for="filter-input">
                🔍 <span class="sr-only">筛选镜像项目</span>
            </label>
        </div>
        <input type="search" class="form-control" ref="input" id="filter-input col"
        placeholder="筛选镜像项目 (F)..." accesskey="f"
        v-model="filterString" v-on:input="$emit('update:filterString', filterString);">
        <div class="input-group-append col-12 col-sm-auto d-flex mx-0 px-0">
            <label class="input-group-text col justify-content-center">
                <input type="checkbox" class="mr-1" v-model="filterStatusFailed" accesskey="s"
                 v-on:change="$emit('update:filterStatusFailed', filterStatusFailed);">
                <span>只显示异常 (S)</span>
            </label>
            <label class="input-group-text col justify-content-center">
                <input type="checkbox" class="mr-1" v-model="filterRaw" accesskey="r"
                 v-on:change="$emit('update:filterRaw', filterRaw);">
                <span>机读格式 (R)</span>
            </label>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        filterString: String,
        filterStatusFailed: Boolean,
        filterRaw: Boolean,
    },/*
    data: function() {
        return {
            filterString: "",
            filterStatusFailed: false,
            filterRaw: false,
        };
    },*/
    methods: {
        focus: function() {
            var filterInput = this.$refs.input;
            if (filterInput.scrollIntoViewIfNeeded)
                filterInput.scrollIntoViewIfNeeded();
            else if (filterInput.scrollIntoView)
                filterInput.scrollIntoView();
            filterInput.focus();
        },
    }
};
</script>

<style scoped>
</style>
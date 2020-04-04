<template>
    <div>
        <MirrorFilter
            ref="filter"
            v-bind:filter-string.sync="filterString"
            v-bind:filter-status-failed.sync="filterStatusFailed"
            v-bind:filter-raw.sync="filterRaw"
        />
        <MirrorStatusTable
            v-bind:last-updated="lastUpdated"
            v-bind:last-updated-error="lastUpdatedError"
            v-bind:statuses="statuses"
            v-bind:status-json="statusJson"
            v-bind:filter-string="filterString"
            v-bind:filter-status-failed="filterStatusFailed"
            v-bind:filter-raw="filterRaw"
        />
    </div>
</template>

<script>
import MirrorFilter from './MirrorFilter.vue';
import MirrorStatusTable from './MirrorStatusTable.vue';

var refreshInterval = 10000;

export default {
    data: function(){
        return {
            statusJson: "",
            statusLastRefresh: null,
            statuses: [],
            lastUpdated: null,
            lastUpdatedError: "",
            filterString: "",
            filterStatusFailed: false,
            filterRaw: false,
        };
    },
    components: {
        MirrorFilter,
        MirrorStatusTable,
    },
    beforeMount: function(a){
        this.statusJson = this.$el.dataset.statusJson;
    },
    mounted: function() {
        var $this = this;

        // init hash
        if (location.hash.length > 2) {
            $this.filterString = location.hash.substring(1);
        }

        $this.loadStatusJson();
        setInterval(function(){
            if (document.hidden !== true) $this.loadStatusJson();
        }, refreshInterval);
        document.addEventListener("visibilitychange", function(){
            if(document.hidden === false && (new Date()-$this.lastRefresh) > refreshInterval) $this.loadStatusJson();
        }, false);

        var $this = this;
        document.body.addEventListener('keyup', function(event) {
            if (!event.ctrlKey && !event.altKey &&
                (document.activeElement.tagName !== 'INPUT' || document.activeElement.type === 'checkbox')){
                if (event.keyCode == 70) { // f
                    $this.$refs.filter.focus();
                }
                if (event.keyCode == 83) { // s
                    $this.filterStatusFailed = !$this.filterStatusFailed;
                }
                if (event.keyCode == 82) { // r
                    $this.filterRaw = !$this.filterRaw;
                }
                // Chrome does not like i and t
            }
        });
    },
    methods: {
        loadStatusJson: function(){
            this.statusLastRefresh = new Date();
            var statusJSON = this.statusJson;
            var xhr = new XMLHttpRequest();
            var $this = this;
            xhr.open('GET', statusJSON, true); // +'?refresh='+encodeURIComponent(+new Date())
            xhr.onload = function() {
                var data = [];
                try {
                    data = JSON.parse(this.responseText);
                } catch (error) {
                    $this.lastUpdatedError = ""+error;
                    return;
                }
                $this.statuses = data;
                $this.lastUpdatedError = "";

                var lastModified = this.getResponseHeader('Last-Modified');
                $this.lastUpdated = new Date(lastModified || undefined);
            };
            xhr.onerror = function () {
                $this.lastUpdatedError = "("+this.status+"): "+this.responseText;
            };
            xhr.send();
        },
    }
};
</script>

<style scoped>
</style>
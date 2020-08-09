import Vue from 'vue';
import SyncStatusApp from "./components/SyncStatusApp.vue";

window.addEventListener('load', function(){
    if (!isSupportedBrowser()) {
        document.getElementById('sync-status-loading').style.display = 'none';
        document.getElementById('sync-status-unsupported').style.display = 'block';
        // abort status load
        return;
    }

    var el = document.getElementById('sync-status-app');
    var view = (new (Vue.extend(SyncStatusApp))()).$mount(el);
});
import Vue from 'vue';
import SyncStatusApp from "./components/SyncStatusApp.vue";

window.addEventListener('load', function(){
    var el = document.getElementById('sync-status-app');
    var view = (new (Vue.extend(SyncStatusApp))()).$mount(el);
});
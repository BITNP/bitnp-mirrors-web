<template>
  <div class="table-responsive-lg">
    <table class="table table-sm table-hover">
        <caption v-if="lastUpdatedError" class="text-danger">更新失败 {{ lastUpdatedError }} <time v-if="lastUpdatedText" v-bind:datetime="lastUpdated">（当前数据更新于本机时间 {{ lastUpdatedText }}）</time></caption>
        <caption v-if="!lastUpdatedError && lastUpdated">更新于本机时间 <time v-bind:datetime="lastUpdated">{{ lastUpdatedText }}</time></caption>
        <thead>
          <tr class="text-nowrap" v-if="!filterRaw">
            <th>名称</th>
            <th>状态</th>
            <th class="text-center">更新</th>
            <!--<th>完成</th>-->
            <th class="text-center">下次</th>
            <th class="text-right">大小</th>
            <th>来源</th>
          </tr>
          <tr class="text-nowrap" v-else>
            <th>名称</th>
            <th>状态</th>
            <th>完成</th>
            <th>更新</th>
            <th>下次</th>
            <th>大小</th>
            <th>来源</th>
          </tr>
        </thead>
        <tbody id="previous-tbody">
            <tr class="text-center" v-if="!statuses.length"><td colspan="6">正在加载… 您也可以获取 <a v-bind:href="statusJson">JSON 格式的镜像状态</a></td></tr>
            <tr v-for="item in statusesFiltered" v-bind:key="item.name"
              v-bind:class="{
              'table-warning': (item.status == 'syncing' || item.status == 'pre-syncing' || item.status == 'paused' || item.status == 'disabled'),
              'table-danger': (item.status == 'failed' || item.status == 'none' || item.status == 'paused'),
              }">
              <template v-if="!filterRaw">
                <td><a v-bind:href="'../' + item.name + '/'">{{ item.name }}</a></td>
                <td class="text-nowrap" v-html="$options.filters.statusLabel(item)"></td>
                <td class="text-center"><time v-bind:datetime="item.last_update" v-bind:title="item.last_update">
                  {{ item.last_update_ts | dateFromTS | dateShort }}
                </time></td>
                <!--<td><time v-bind:datetime="item.last_ended" v-bind:title="item.last_ended">
                  {{ item.last_ended_ts | dateFromTS | timeSince(item.last_update_ts*1000, null, true) }}
                </time></td>-->
                <td class="text-center"><time v-bind:datetime="item.next_schedule" v-bind:title="item.next_schedule">
                  {{ item.next_schedule_ts | dateFromTS | dateShort | default("正在同步") }}
                </time></td>
                <td class="text-right">{{ item.size }}</td>
                <td v-bind:title="item.upstream">
                    <details class="text-break">
                        <summary class="text-truncate d-inline-block w-upstream">{{ item.upstream | TLD }}</summary>
                        <a v-bind:href="item.upstream">{{ item.upstream }}</a>
                    </details>
                </td>
              </template>
              <template v-else>
                <td>{{ item.name }}</td>
                <td class="text-nowrap">{{ item.status }}</td>
                <td class="text-right"><time v-bind:datetime="item.last_update" v-bind:title="item.last_update">
                  {{ item.last_update_ts }}
                </time></td>
                <td class="text-right"><time v-bind:datetime="item.last_ended" v-bind:title="item.last_ended">
                  {{ item.last_ended_ts }}
                </time></td>
                <td class="text-right"><time v-bind:datetime="item.next_schedule" v-bind:title="item.next_schedule">
                  {{ item.next_schedule_ts }}
                </time></td>
                <td class="text-right">{{ item.size }}</td>
                <td v-bind:title="item.upstream">
                    <a v-bind:href="item.upstream">{{ item.upstream }}</a>
                </td>
              </template>
            </tr>
        </tbody>
    </table>
</div>
</template>

<script>
var TLDList = ['edu.cn', 'com.cn', 'org', 'wide.ad.jp', 'ad.jp', 'edu', 'edu.au', 'com', 'co', 'io', 'net', 'at', 'de', 'nl', 'ca', 'ch', 'co.uk'];
var statusLabel = {
    "none": "&#x23F8;&#xFE0F; 未同步",
    "failed": "&#x274C; 同步失败",
    "syncing": "&#x1F504; 同步于 %updaterel%",
    "pre-syncing": "&#x23F3; 正在预同步",
    "paused": "&#x23F8;&#xFE0F; 同步暂停",
    "disabled": "&#x23F8;&#xFE0F; 同步禁用",
    "success": "%oldemoji%同步于 %updaterel%",
};
export default {
  props: {
    lastUpdated: Date,
    statuses: Array,
    lastUpdatedError: String,
    filterString: String,
    filterStatusFailed: Boolean,
    filterRaw: Boolean,
    statusJson: String,
  },
  computed: {
    lastUpdatedText: function(){
      return this.lastUpdated ? this.lastUpdated.toLocaleString(): null;
    },
    statusesFiltered: function(){
      var $this = this;
      return this.statuses.filter(function(v){
        if (!v.name) return false;
        if ($this.filterStatusFailed && v.status == "success") return false;
        if ($this.filterString &&
            v.name.toLowerCase().indexOf($this.filterString.toLowerCase().trim()) == -1)
            return false;
        return true;
      });
    }
  },
  data: function() {
    return {
      greeting: "Hello"
    };
  },
  filters: {
    default: function(v, d){
      return v || d;
    },
    TLD: function(u){
      if (URL){
        try {
          var url = new URL((u || '').replace(/^rsync|git|s3/i, 'http'));
          // URL cannot process rsync protocal
        } catch (error) {
          return u;
        }
        var TLDmatch = TLDList.filter(function(v){
          return url.hostname.endsWith(v);
        });
        if (TLDmatch.length) {
          var subdomains = url.hostname.substring(0, url.hostname.length-TLDmatch[0].length).split('.');
          return subdomains[subdomains.length-2]+'.'+TLDmatch[0];
        } else {
          return url.hostname || u;
        }
      } else {
        return u;
      }
    },
    statusLabel: function(item){
      var last_update = this.dateFromTS(item.last_update_ts);
      return (statusLabel[item.status] || item.status)
        .replace('%updaterel%',
          this.timeSince(last_update, null, '前'))
        .replace('%oldemoji%',
          (new Date().getTime() - last_update.getTime()) > 3600000 * 24 ? '&#x1F570;&#xFE0F; ': ''
        );
    },
    dateFromTS: function(ts){
      if (ts < 0) return null;
      return new Date(ts*1000);
    },
    dateShort: function(date){
      if (!date) return '';
      var strings = [];
      strings.push(date.getMonth()+1);
      strings.push('-');
      strings.push(date.getDate());
      strings.push(' ');
      strings.push(date.getHours());
      strings.push(':');
      strings.push(date.getMinutes());
      for (var i in strings) {
        if (i % 2 == 0) {
          if(strings[i] < 10) strings[i] = '0'+strings[i];
        }
      }
      return strings.join('');
    },
    timeSince: function(timeStamp, now, reltext, minus) {
      reltext = reltext || "";
      if(!timeStamp) return "";
      // if(!reltext) return +timeStamp/1000; // getRaw
      var now = now ? now: new Date();
      if (typeof now == 'number') {
        now = new Date(now);
      }
      var secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;
      if(minus) secondsPast = -secondsPast;
      if(secondsPast < 60*2){
        if (secondsPast < 1) secondsPast = 1;
        return parseInt(secondsPast) + ' 秒'+reltext;
      }
      if(secondsPast < 3600*3){
        return parseInt(secondsPast/60) + ' 分钟'+reltext;
      }
      if(secondsPast <= 86400*2){
        return parseInt(secondsPast/3600) + ' 小时'+reltext;
      }
      //if(secondsPast > 86400){
          var day = timeStamp.getDate();
          var month = timeStamp.getMonth()+1;
          if (month < 10) month = '0' + month;
          // var year = timeStamp.getFullYear() == now.getFullYear() ? "" :  (timeStamp.getFullYear()+"-");
          return month+"-"+day;
      //}
    },
  }
};
</script>

<style scoped>
@media (max-width: 991.98px){
  .w-upstream {
    max-width: 10rem;
  }
}
</style>
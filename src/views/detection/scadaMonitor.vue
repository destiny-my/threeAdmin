<!--
 * @Author: ybf
 * @Date: 2023-08-17 09:57:36
 * @LastEditTime: 2023-11-08 18:44:09
 * @Description: 描述
 * Copyright (c) 2023 by 慧能分享, All Rights Reserved.
-->
<template>
  <!-- <iframe :src='scadaUrl'  allowtransparency="true" frameborder="0" style="width: 100%; height: 100%; border: none; background-color: transparent;"></iframe> -->
  <wiringDiagramView style="width: 100%; height: 100%; border: none; background-color: transparent;"> </wiringDiagramView>
</template>
<script>
import Analyse from '@/api/carbon/analyse'
import {getToken} from "@/utils/auth";
import wiringDiagramView from "@/views/detection/wiringDiagramView.vue";
export default {
  components: { wiringDiagramView },
  name: 'scadaMonitor',
  data() {
    return {scadaUrl: ''}
  },
  watch: {
    '$route'() {
      if (this.$route.name === 'scadaMonitor') {
        this.updatePage()
      }
    }
  },
  mounted() {
    this.updatePage()
  },
  methods: {
    updatePage: function () {
      // 更新页面
      let graphId = this.$route.query.graphId
      if (graphId === undefined || graphId === null || graphId === '') {
        return
      }

      // 读取配置
      // Analyse.selectDictLabel({'dictType': 'lt_config', 'dictValue': 'scada_url'}).then((res) => {
      //   if (res === undefined || res === null || res['code'] !== 0) {
      //     return
      //   }

      //   let _scadaUrl = res['msg']
      //   if (_scadaUrl === undefined || _scadaUrl === null || _scadaUrl.length <= 0) {
      //     return
      //   }

      //   this.scadaUrl = _scadaUrl + '/WebScada/viewer.html?pageType=2&graphId=' + graphId + '&token=' + getToken()
      // })
    }
  }
}
</script>
<style scoped>
</style>

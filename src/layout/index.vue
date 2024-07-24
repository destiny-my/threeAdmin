<template>
    <div class="layoutMain">
      <router-view></router-view>
    </div>
</template>

<script>

import Header from './header.vue'
import Footer from './footer.vue'

export default {
  data() {
    return {
    }
  },
  components: {
    Header,
    Footer
  },
  created() {
  },
  mounted() {
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>
.layoutMain{
  height: 100%;
  width: 100%;
  background: red;
}
</style>

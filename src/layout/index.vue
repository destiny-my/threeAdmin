<template>
  <el-container>
    <Header></Header>
    <el-main>
      <router-view ></router-view>
    </el-main>
    <!-- <Footer></Footer> -->
  </el-container>
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
.el-container {
  background: url(../assets/image/bg.jpg);
  background-size: 100% 100%;
  color: #fff;
  font-size: 0.0729rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  // z-index: -1;
}

.el-main {
  // height: 1.5625rem !important;
  padding: 20px 40px;
  overflow: hidden;
}
</style>

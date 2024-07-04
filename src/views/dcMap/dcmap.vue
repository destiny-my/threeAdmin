<template>
    <div id="viewer-container" class="viewer-container">
      <slot></slot>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Viewer',
    data() {
      return {}
    },
    methods: {
      initViewer() {
        let viewer = new this.$DC.Viewer('viewer-container')
        this.$emit('on-viewer-completed', viewer)
      }
    },
    mounted() {
        this.$DC.ready().then(this.initViewer)
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .viewer-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  </style>
  
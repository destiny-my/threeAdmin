<template>
  <div class="tableBox">
    <el-table :header-cell-style="{ fontSize: '14px', padding: 0 }" :cell-style="{ fontSize: '14px', padding: 0 }" :data="tableData" fit stripe>
      <el-table-column v-if="show && tableData.length !== 0" type="index" label="序号" width="60" align="center"></el-table-column>
      <template v-for="(item, key) in header">
        <el-table-column :key="key" :prop="item.id ? item.id : null" :label="item.name ? item.name : null" :width="item.width ? item.width : null" align="center"></el-table-column>
      </template>
    </el-table>
    <el-pagination :style="pStyle === '0' ? 'display:none' : ' '" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage4" :page-sizes="[10, 20, 50]" :page-size="100" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
  </div>
</template>
<script>
export default {
  props: {
    tableData: {
      require: true,
      type: Array,
      default() {
      }
    },
    header: {
      require: true,
      type: Array,
      default() {
      }
    },
    pStyle: {
      require: true,
      type: String,
      default() {
      }
    },
    show: {
      require: true,
      type: Boolean,
      default() {
      }
    },
    total: {
      require: true,
      type: Number,
      default() {
      }
    },
  },
  data() {
    return {
      currentPage4: 1
    }
  },
  methods: {
    handleSizeChange(val) {
    },
    handleCurrentChange(val) {
    }
  },
};
</script>
<style lang="less" scoped>
.tableBox {
  overflow-x: scroll;

  /deep/ .el-table,
  /deep/ .el-table__expanded-cell {
    color: #fff;
    border: 1px solid #0E68A6;
    background: transparent;
  }

  /deep/ .el-table th,
  /deep/ .el-table tr,
  /deep/ .el-table td {
    color: #C0D5EB;
    border: 1px solid #0E68A6;
    background: transparent;
  }

  /deep/ .el-table__header thead tr {
    background: rgba(0, 59, 100, 0.7);
  }

  /deep/ .el-table__header thead th {
    //color: #41A6EB;
    color: #FFF;
    opacity: 0.75;
  }

  /deep/ .el-table--striped .el-table__body tr.el-table__row--striped td {
    background: rgba(0, 59, 100, 0.7);
  }

  /deep/ .el-table--enable-row-hover .el-table__body tr:hover > td {
    background: rgba(255, 255, 255, .2);
  }

  // 去掉最下面的那一条线
  /deep/ .el-table::before {
    height: 0;
  }

  /deep/ .el-select-dropdown {
    background-color: rgba(34, 65, 109, 0.8) !important;
    border: none;
  }

  /deep/ .el-select-dropdown__item {
    color: #fff;
  }

  /deep/ .el-select-dropdown__item.hover,
  /deep/ .el-select-dropdown__item:hover {
    background-color: rgba(34, 65, 109, 0.8) !important;
  }

  /deep/ .el-pagination__total {
    color: #fff;
  }

  /deep/ .el-pagination__jump {
    color: #fff;
  }

  /deep/ .el-input__inner {
    background-color: rgba(222, 241, 253, 0.1);
    border: 1px solid #0095FF;
    color: #fff;
  }

  /deep/ .el-pagination button:disabled {
    background-color: rgba(222, 241, 253, 0.1);
    color: #fff;
  }

  /deep/ .el-pager li {
    background: rgba(222, 241, 253, 0.1);
  }
}
</style>

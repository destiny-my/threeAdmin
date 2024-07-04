<template>
  <div class="container">
      <div v-html="mdData" :style="{display: 'block'}" class="mdData"></div>
      <form class="layui-form" action="">
          <div class="layui-form-item">
              <label class="layui-form-label" style="margin-left: 40px;margin-right: 10px;">消耗燃气</label>
              <el-input-number controls-position="right" @change="handleChange" :min="1" :max="10"></el-input-number>
              <span>m^3</span>
          </div>

          <div class="layui-form-item">
              <div class="btn">
              <el-button @click="resultShow">计算</el-button>
              </div>
          </div>
          <div v-if="result">
              <div class="consume">
                  <div class="electric_quantity">
                      <label class="layui-form-label" style="margin-left: 14px;margin-right: 10px;">碳排放量</label>
                      <input class="count" type="text">
                      <span>kg</span>
                  </div>
              </div>
          </div>
      </form>
</div>
</template>

<script>

import katex from 'katex'

export default {
    data(){
        return{
        options: [{
                value: '选项1',
                label: '华北'
                }, {
                value: '选项2',
                label: '华中'
                }, {
                value: '选项3',
                label: '华南'
                }],
        value: '',
        text: 'Carbon Emissions=$$(\\omega\\frac{44}{12}E_iN_{CV,i}C_{E,i}C_{OF,i}+(1-\\omega)N_{CV,i}C_{F,i}){\\textstyle\\sum_{i=1}^a}E_i$$',
        isLineFeed: true,
        delimiters: '$$',
        mdData: '',
        result:true
        }
    },
    created() {
      this.katexRender()
    },
    methods:{
        resultShow(){
            this.result = true
        },
        handleChange(){

        },
        katexRender() {
            const data = this.text
            const delimitersLength = this.delimiters.length
            let pos = data.indexOf(this.delimiters)
            const positions = []
            while (pos > -1) {
              positions.push(pos)
              pos = data.indexOf(this.delimiters, pos + delimitersLength)
            }
            let htmlData = ''
            if (positions.length <= 1) {
              htmlData = this.getSpanHtml(data)
            } else {
              htmlData += this.getSpanHtml(data.substring(0, positions[0]))
              for (let index = 1; index <= positions.length - 1; index++) {
                const current = positions[index]
                if (index % 2 !== 0) {
                  const d = katex.renderToString(data.substring(positions[index - 1] + delimitersLength, current), { throwOnError: false })
                  htmlData += d
                } else {
                  htmlData += this.getSpanHtml(data.substring(positions[index - 1] + delimitersLength, current))
                }
              }
              htmlData += this.getSpanHtml(data.substring(positions[positions.length - 1] + delimitersLength))
            }
            this.mdData = htmlData
        },
        getSpanHtml(str) {
            return `<span>${str}</span>`
        }
    }
}
</script>

<style lang="less" scoped>
      @import "../../../node_modules/katex/dist/katex.min.css";
      .container {
        height: 100%;

        .height-100 {
          height: 100%;
        }

        .card-title {
          height: 16px;
          margin-left: 10px;
          line-height: 16px;
          padding-left: 10px;
          border-left: 4px solid #308ec1;
        }

        .image {
          position: absolute;
          right: 3px;
          cursor: pointer;
        }

        .centent {
          position: absolute;
          top: 0;
          width: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          height: 100%;
          z-index: 1;
        }

        .mdData {
          padding-top: 8%;
          padding-left: 10%;
          padding-bottom: 3%;
          font-size: 18px;
        }


        .layui-form {
          margin-top: 20px;
          padding: 20px 6%;
        }

        .data_collection {
          height: 300px;
          width: 100%;
          display: flex;
        }

        /* .layui-form select {
          display: block;
      } */

        .dialog .layui-form-select dl {
          background: #0b264a;
        }

        .consume {
          margin-left: 30px;
          margin-top: 20px;
          display: flex;

          div {
            margin-right: 50px;

            .el-input-number {
              width: 90px !important;
              padding: 0;
              margin: 0;
            }
          }
        }

        .count {
          width: 182px;
          height: 38px;
          border-bottom-left-radius: 6px;
          border-top-left-radius: 6px;
          border-bottom-right-radius: 6px;
          border-top-right-radius: 6px;
        }

        .btn {
          /* display: flex; */
          width: 80%;
          margin: 50px 0;
          padding-left: 22%;
          justify-content: flex-end;

          .el-button {
            background-color: #246fcf;
            color: #ffff;
          }
        }
      }
</style>

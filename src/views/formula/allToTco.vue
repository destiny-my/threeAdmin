<template>
  <div class="container">
    <div class="card-title">碳排计算器</div>
    <el-row :gutter="20" class="grid-row">
      <el-col :span="13" style="padding: 20px 0 0 30px">
        <el-row :gutter="15" class="grid-pad">
          <el-col :span="12">
            <div class="form-title title-fourth">
              <span>碳排因子</span>
              <el-tooltip class="item" effect="dark" placement="top">
                <div slot="content">
                  <span class="title-fourth">碳排因子</span>
                  <div :style="{ display: 'block' }" class="title-fourth" v-for="(item, index) in annotation" :key="index">
                    <span class="annotation_title" style="display: inline-block;width: 100px;line-height: 24px;">{{ item.dictLabel }}</span>
                    <span class="annotation_num">{{ item.dictValue | keepDecimal }}</span>
                    <span class="annotation_num">{{ item.remark }}</span>
                  </div>
                </div>
                <img class="image" src="../../assets/image/icon-question.png" alt=""/>
              </el-tooltip>
            </div>
            <el-select v-model="form.region" placeholder="请选择区域" size="mini">
              <el-option v-for="item in optionsArea" :key="item.dictLabel" :label="item.dictLabel" :value="item.dictLabel"></el-option>
            </el-select>
          </el-col>
          <el-col :span="12">
            <div class="form-title title-fourth">
              <span>消耗电量</span>
              <el-tooltip class="item" effect="dark" placement="top">
                <div slot="content">
                  <span class="title-fourth">消耗电量计算公式</span>
                  <div v-html="mdData.electMdData" :style="{ display: 'block' }" class="title-fourth"></div>
                </div>
                <img class="image" src="../../assets/image/icon-question.png" alt=""/>
              </el-tooltip>
            </div>
            <el-input-number v-model="form.electricVal" controls-position="right" :min="0" size="mini" label="请输入内容"></el-input-number>
            <span class="form-units title-fourth">kW·h</span>
          </el-col>
        </el-row>
        <el-row :gutter="15" class="grid-pad">
          <el-col :span="12">
            <div class="form-title title-fourth">
              <span>光伏</span>
              <el-tooltip class="item" effect="dark" placement="top">
                <div slot="content">
                  <span class="title-fourth">光伏计算公式(按天计算)</span>
                  <div v-html="mdData.acreageMdData" :style="{ display: 'block' }" class="title-fourth"></div>
                </div>
                <img class="image" src="../../assets/image/icon-question.png" alt=""/>
              </el-tooltip>
            </div>
            <el-input-number v-model="form.photovoltaicAreaVal" controls-position="right" :min="0" size="mini" label="请输入内容"></el-input-number>
            <span class="form-units title-fourth">㎡</span>
          </el-col>
          <el-col :span="12">
            <div class="form-title title-fourth">
              <span>消耗水量</span>
              <el-tooltip class="item" effect="dark" placement="top">
                <div slot="content">
                  <span class="title-fourth">消耗水计算公式</span>
                  <div v-html="mdData.waterMdData" :style="{ display: 'block' }" class="title-fourth"></div>
                </div>
                <img class="image" src="../../assets/image/icon-question.png" alt=""/>
              </el-tooltip>
            </div>
            <el-input-number v-model="form.waterVal" controls-position="right" :min="0" size="mini" label="请输入内容"></el-input-number>
            <span class="form-units title-fourth">m³</span>
          </el-col>
        </el-row>
        <el-row :gutter="15" class="grid-pad">
          <el-col :span="12">
            <div class="form-title title-fourth">
              <span>充电桩</span>
              <el-tooltip class="item" effect="dark" placement="top">
                <div slot="content">
                  <span class="title-fourth">充电桩计算公式(按天计算)</span>
                  <div v-html="mdData.pileMdData" :style="{ display: 'block' }" class="title-fourth"></div>
                </div>
                <img class="image" src="../../assets/image/icon-question.png" alt=""/>
              </el-tooltip>
            </div>
            <el-input-number v-model="form.chargingPileVal" controls-position="right" :min="0" size="mini" label="请输入内容"></el-input-number>
            <span class="form-units title-fourth">根</span>
          </el-col>
          <el-col :span="12">
            <div class="form-title title-fourth">
              <span>消耗燃气量</span>
              <el-tooltip class="item" effect="dark" placement="top">
                <div slot="content">
                  <span class="title-fourth">消耗燃气计算公式</span>
                  <div v-html="mdData.gasMdData" :style="{ display: 'block' }" class="title-fourth"></div>
                </div>
                <img class="image" src="../../assets/image/icon-question.png" alt=""/>
              </el-tooltip>
            </div>
            <el-input-number v-model="form.gasVal" controls-position="right" :min="0" size="mini" label="请输入内容"></el-input-number>
            <span class="form-units title-fourth">m³</span>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="padding-right: 30px;">
          <el-col :span="12" style="text-align:right">
            <el-button type="primary" class="btn" @click="resultClick" size="mini">计算</el-button>
          </el-col>
          <el-col :span="12" style="text-align:left">
            <el-button type="primary" class="btn" @click="reset" size="mini">重置</el-button>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="1" class="line-col">
        <div class="line"></div>
      </el-col>
      <el-col :span="10" style="padding: 0 0 0 30px">
        <!-- <span class="result-title">计算结果：</span> -->
        <span class="opacity-75 title-fifth unit-name">单位：kgCO₂</span>
        <el-row v-for="(item, index) in resultCount" :key="index">
          <el-col :span="12" class="result-box" v-for="(item2, index) in item" :key="index">
            <img :src="item2.img" alt=""/>
            <div class="grid-content">
              <span class="grid1 title-fourth">{{ item2.title }}</span>
              <div style="display:flex;align-items: center;">
                <!-- <el-tooltip placement="bottom">
                  <span slot="content">{{ item2.num }}</span>
                  <span class="grid2">{{ item2.num }}</span>
                </el-tooltip> -->
                <span class="grid2">{{ item2.num }}</span>
                <!-- <span class="grid3">{{ item2.unit }}</span> -->
              </div>
            </div>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import katex from "katex";
import Monitor from "@/api/carbon/monitor";
import Analyse from "@/api/carbon/analyse";

export default {
  data() {
    return {
      optionsArea: [],
      annotation: '',
      defaultRegion: '',
      form: {
        region: "",
        carbonFactor: "1",
        electricVal: "",
        waterVal: "",
        gasVal: "",
        photovoltaicAreaVal: "",
        chargingPileVal: "",
      },
      result: [
        {img: require("../../assets/image/icon-calc-elect.png"), title: "电碳排", num: "0.00", unit: "kgCO₂",},
        {img: require("../../assets/image/icon-calc-pv.png"), title: "光伏减排", num: "0.00", unit: "kgCO₂",},
        {img: require("../../assets/image/icon-calc-water.png"), title: "水碳排", num: "0.00", unit: "kgCO₂",},
        {img: require("../../assets/image/icon-calc-charge.png"), title: "充电桩减排", num: "0.00", unit: "kgCO₂",},
        {img: require("../../assets/image/icon-calc-gas.png"), title: "气碳排", num: "0.00", unit: "kgCO₂",},
        {img: require("../../assets/image/icon-calc-total.png"), title: "总碳排", num: "0.00", unit: "kgCO₂",},
      ],
      resultCount: "",
      text: {
        // 电
        electText: "Carbon Emissions=$$(\\omega\\frac{44}{12}E_iN_{CV,i}C_{E,i}C_{OF,i}+(1-\\omega)N_{CV,i}C_{F,i}){\\textstyle\\sum_{i=1}^a}E_i$$",
        // 水
        waterText: "$$EF_j=B_o\\ast MCF_j$$</br>TOW=$$P\\ast BOD\\ast0.001\\ast I\\ast365$$</br>Carbon Emissions=$$\\lbrack{\\textstyle\\sum_{i,j}U_i}\\;\\ast\\;T_{i,j}\\;\\ast\\;EF_j\\rbrack(TOW-S)-R$$",
        // 气
        gasText: "Carbon Emissions=$$(\\omega\\frac{44}{12}E_iN_{CV,i}C_{E,i}C_{OF,i}+(1-\\omega)N_{CV,i}C_{F,i}){\\textstyle\\sum_{i=1}^a}E_i$$",
        // 充电桩
        pileText: "$$C_{PEy}={\\textstyle\\sum_i}E{\\textstyle F_{elec,i,y}}\\ast\\;E{\\textstyle C_{PJ,i,y}\\ast(1+TDL_{i,y})-}{\\textstyle\\sum_i}{\\textstyle N_{fuel,i,y}}{\\textstyle\\ast}{\\textstyle E}{\\textstyle F_{fuel,i,y}}$$</br>$$C_2{\\textstyle=}{\\textstyle C_0}{\\textstyle+}{\\textstyle C_m}$$</br>$$C{\\textstyle a}{\\textstyle r}{\\textstyle b}{\\textstyle o}{\\textstyle n}{\\textstyle\\;}{\\textstyle E}{\\textstyle m}{\\textstyle i}{\\textstyle s}{\\textstyle s}{\\textstyle i}{\\textstyle o}{\\textstyle n}{\\textstyle s}{\\textstyle=}{\\textstyle C_{All}}{\\textstyle+}{\\textstyle C_2}{\\textstyle-}{\\textstyle C_1}$$",
        // 光伏面积
        acreageText: "$$\\textstyle C_1=H_tP_0R{(1-d)}^{H_t}m_c$$",
      },
      isLineFeed: true,
      delimiters: "$$",
      mdData: {
        electMdData: "",
        waterMdData: "",
        gasMdData: "",
        pileMdData: "",
        acreageMdData: "",
      },
    };
  },
  created() {
  },
  mounted() {
    this.computation();
    this.equation();
    this.handleChange();
  },
  methods: {
    handleChange() {
      Analyse.selectDictDataByDictType({dictType: 'lt_carbon_factor'}).then((res) => {
        if (res === undefined || res === null || res['code'] !== 0 || res['data'] === undefined) {
          return
        }

        let _data = res['data']
        this.annotation = _data

        let _list = []
        for (let _item of _data) {
          if (_item['cssClass'] === '1') {
            _list.push(_item)
          }

          // 设置默认
          if (_item['isDefault'] === 'Y') {
            this.defaultRegion = _item['dictLabel']
            this.form.region = this.defaultRegion
          }
        }

        this.optionsArea = _list
      })
    },
    computation() {
      let arr = []
      for (let index = 0; index < this.result.length; index += 2) {
        arr.push(this.result.slice(index, index + 2))
      }

      this.resultCount = arr
    },
    equation() {
      this.mdData.electMdData = this.katexRender(this.text.electText)
      this.mdData.waterMdData = this.katexRender(this.text.waterText)
      this.mdData.gasMdData = this.katexRender(this.text.gasText)
      this.mdData.pileMdData = this.katexRender(this.text.pileText)
      this.mdData.acreageMdData = this.katexRender(this.text.acreageText)
    },
    reset() {
      this.form = {
        region: this.defaultRegion,
        carbonFactor: "1",
        electricVal: "",
        waterVal: "",
        gasVal: "",
        photovoltaicAreaVal: "",
        chargingPileVal: "",
      }

      this.result[0].num = '0.00'
      this.result[1].num = '0.00'
      this.result[2].num = '0.00'
      this.result[4].num = '0.00'
      this.result[3].num = '0.00'
      this.result[5].num = '0.00'
    },
    katexRender(text) {
      const data = text
      const delimitersLength = this.delimiters.length
      let pos = data.indexOf(this.delimiters)
      const positions = []
      while (pos > -1) {
        positions.push(pos);
        pos = data.indexOf(this.delimiters, pos + delimitersLength)
      }

      let htmlData = "";
      if (positions.length <= 1) {
        htmlData = this.getSpanHtml(data)
      } else {
        htmlData += this.getSpanHtml(data.substring(0, positions[0]))
        for (let index = 1; index <= positions.length - 1; index++) {
          const current = positions[index];
          if (index % 2 !== 0) {
            const d = katex.renderToString(data.substring(positions[index - 1] + delimitersLength, current), {throwOnError: false})
            htmlData += d
          } else {
            htmlData += this.getSpanHtml(data.substring(positions[index - 1] + delimitersLength, current))
          }
        }

        htmlData += this.getSpanHtml(data.substring(positions[positions.length - 1] + delimitersLength))
      }

      return htmlData
      // this.mdData = htmlData
    },
    getSpanHtml(str) {
      return `<span>${str}</span>`
    },
    resultClick() {
      // 更新碳排
      Monitor.carbonEmissionToolCalculation(this.form).then((res) => {
        if (res === undefined || res === null || res['code'] !== 200 || res['data'] === undefined) {
          return
        }

        let _data = res.data
        let _eVal = _data['electricVal']
        let _wVal = _data['waterVal'][2]
        let _gVal = _data['gasVal']
        let _pvVal = this.form['photovoltaicAreaVal'] * 0.4 // _data['photovoltaicAreaVal']
        let _cVal = this.form['chargingPileVal'] * 134.00 // _data['chargingPileVal']
        let _tVal = _eVal + _wVal + _gVal - _pvVal - _cVal
        this.result[0].num = this.$numToFixed(_eVal)
        this.result[1].num = this.$numToFixed(_pvVal)
        this.result[2].num = this.$numToFixed(_wVal)
        this.result[4].num = this.$numToFixed(_gVal)
        this.result[3].num = this.$numToFixed(_cVal)
        this.result[5].num = this.$numToFixed(_tVal)
      })
    },
  },
};
</script>
<style lang="less" scoped>
@import "../../../node_modules/katex/dist/katex.min.css";

.container {
  height: 100%;

  .card-title {
    height: 16px;
    margin-left: 10px;
    color: #fff;
    line-height: 16px;
    padding-left: 10px;
    border-left: 4px solid #308ec1;
    margin-bottom: 20px;
  }

  .grid-row {
    height: calc(100% - 0.184444rem);

    /deep/ .el-row {
      margin-bottom: 0.2rem;
    }

    .grid-pad {
      padding: 12px 0;
    }

    .form-title {
      // display: block;
      color: #c0d5eb;
      margin-bottom: 8px;
      display: flex;
      align-items: center;

      span {
        padding-right: 8px;
      }

    }

    .form-units {
      color: #fff;
      opacity: 0.75;
      font-size: 14px;
    }

    .el-input-number--mini {
      width: 180px;
    }

    .btn {
      width: 50%;
      // margin-top: 0.2rem;
    }

    .line-col {
      height: 100%;

      .line {
        height: 360px;
        width: 2px;
        background: #265569;
        height: 100%;
      }
    }

    /deep/ .el-input__inner {
      background-color: #00233d;
      border: 1px solid #41a6eb;
      color: #41a6eb;
    }

    /deep/ .el-select .el-input .el-select__caret {
      color: #41a6eb;
    }

    /deep/ .el-input-number__increase,
    /deep/ .el-input-number__decrease {
      color: #41a6eb;
      background: rgba(65, 166, 235, 0.1);
    }

    /deep/ .el-input-number__increase {
      border-left: 1px solid #41a6eb;
      border-bottom: 1px solid #41a6eb;
    }

    /deep/ .el-input-number.is-controls-right .el-input-number__decrease {
      border-left: 1px solid #41a6eb;
    }

    .result-title {
      color: #c0d5eb;
      font-size: 19px;
      font-weight: 400;
    }
    .unit-name{
      display: inline-block;
      width: calc(100% - 30px);
      text-align: right;
    }
    .result-box {
      display: flex;
      padding: 20px 0;

      img {
        width: 42px;
        height: 42px;
      }

      .grid-content {
        padding-left: 12px;

        .grid1 {
          display: block;
          color: rgba(255, 255, 255, 0.75);
          font-weight: 400;
          line-height: 20px;
        }

        .grid2 {
          font-size: 21px;
          font-weight: 500;
          min-width: 30px;
          // max-width: 100px;
          padding-right: 6px;
          cursor: pointer;
          // text-overflow:ellipsis;
          // overflow: hidden;
        }

        .grid3 {
          display: inline-block;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.45);
          font-weight: 400;
        }
      }
    }
  }

  .el-button:focus {
    background-image: none !important;
  }
}

</style>

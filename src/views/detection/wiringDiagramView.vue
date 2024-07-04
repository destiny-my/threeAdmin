<template>
    <div class="wiringDiagramView">
        <div :style="{ width: '100%', height: '100%' }" v-html="graphViewSrc" id="svgImgDom"></div>
    </div>
</template>
    
<script>
export default {
    name: "wiringDiagramView",
    components: {},
    data() {
        return {
            graphViewSrc: '',
            wiringDiagramObj: [
                {
                    fileName: '111',
                    tag: 'day'
                },
                {
                    fileName: '暖通图',
                    tag: 'hot'
                },
                {
                    fileName: '电力线路图',
                    tag: 'power'
                },
                {
                    fileName: '空调照明图',
                    tag: 'ktzm'
                },
            ],
            failCount: 0,
            cachedDynamicTagMap: null,
            setInterval: null,
            setIntervalChannel: null,
            dgmDrawType: 1,
            panZoomTiger: null,
            channelStatus: [],
            cachedDynamicTagMap: {}
        };
    },
    watch: {

    },
    computed: {

    },
    created() {
    },
    mounted() {
        this.getwiringDiagramView();
    },
    beforeDestroy() {
        if (this.setInterval) {
            clearInterval(this.setInterval);
        }
        if (this.setIntervalChannel) {
            clearInterval(this.setIntervalChannel);
        }
    },
    methods: {
        /**
         * 获取一次接线图
         */
        getwiringDiagramView() {
            let postData = {
                offset: 1,
                size: 9999,
                dgmName: '',
                // dgmDrawType: this.dgmDrawType
            };
            this.$httpGet(window.api.drawWiringDiagramInfo, postData).then(res => {
                if (res.successful) {
                    let row = res.result.data.filter(item => {
                        // console.log(item.dgmName, item.id)
                        return item.dgmName.indexOf('信息港暖通图') > -1
                    }
                    )[0]
                    this.openGraphView(row)
                }
            }).catch(err => {

            });
        },
        /**
         * 查看mxgraph图形
         */
        openGraphView(row, obj) {
            this.$httpGet(window.api.drawWiringDownload + row.id).then(res => {
                // this.graphViewSrc = downloadSvg
                res = res.replace(/..\/..\/..\/../g, 'http://172.16.1.163:8083')
                this.graphViewSrc = res
                let tag = 'day'; // night
                let dataDay = [
                    { "flowid": 1, "direction": 1, "color": "#009900" },
                    { "flowid": 2, "direction": 1, "color": "#FF0000" },
                    { "flowid": 3, "direction": 1, "color": "#FF0000" },
                    { "flowid": 4, "direction": 1, "color": "#009900" },
                    { "flowid": 5, "direction": 1, "color": "#009900" },
                    { "flowid": 6, "direction": 1, "color": "#009900" },
                    { "flowid": 7, "direction": 1, "color": "#009900" },
                    { "flowid": 8, "direction": -1, "color": "#FF0000" },
                    { "flowid": 9, "direction": 1, "color": "#FF0000" },
                    { "flowid": 10, "direction": -1, "color": "#FF0000" },
                    { "flowid": 11, "direction": 1, "color": "#009900" },
                    { "flowid": 12, "direction": -1, "color": "#009900" },
                    { "flowid": 13, "direction": -1, "color": "#FF8000" },
                    { "flowid": 14, "direction": -1, "color": "#009900" },
                    { "flowid": 15, "direction": -1, "color": "#009900" },
                    { "flowid": 16, "direction": -1, "color": "#009900" },
                    { "flowid": 17, "direction": -1, "color": "#FF0000" },
                    { "flowid": 18, "direction": 1, "color": "#FF0000" },
                    { "flowid": 19, "direction": 1, "color": "#FF0000" },
                    { "flowid": 20, "direction": -1, "color": "#009900" },
                    { "flowid": 21, "direction": -1, "color": "#009900" },
                    { "flowid": 22, "direction": -1, "color": "#FF8000" },
                    { "flowid": 23, "direction": 1, "color": "#009900" },
                    { "flowid": 24, "direction": 0, "color": "#FF8000" }];

                let dataNight = [
                    { "flowid": 1, "direction": 0, "color": "#009900" },
                    { "flowid": 2, "direction": 0, "color": "#FF0000" },
                    { "flowid": 3, "direction": 0, "color": "#FF0000" },
                    { "flowid": 4, "direction": 0, "color": "#009900" },
                    { "flowid": 5, "direction": 0, "color": "#009900" },
                    { "flowid": 6, "direction": 0, "color": "#009900" },
                    { "flowid": 7, "direction": 0, "color": "#009900" },
                    { "flowid": 8, "direction": 0, "color": "#FF0000" },
                    { "flowid": 9, "direction": 0, "color": "#FF0000" },
                    { "flowid": 10, "direction": 0, "color": "#FF0000" },
                    { "flowid": 11, "direction": 0, "color": "#009900" },
                    { "flowid": 12, "direction": -1, "color": "#009900" },
                    { "flowid": 13, "direction": -1, "color": "#FF8000" },
                    { "flowid": 14, "direction": -1, "color": "#009900" },
                    { "flowid": 15, "direction": -1, "color": "#009900" },
                    { "flowid": 16, "direction": -1, "color": "#009900" },
                    { "flowid": 17, "direction": -1, "color": "#FF0000" },
                    { "flowid": 18, "direction": 1, "color": "#FF0000" },
                    { "flowid": 19, "direction": 1, "color": "#FF0000" },
                    { "flowid": 20, "direction": 0, "color": "#009900" },
                    { "flowid": 21, "direction": 1, "color": "#009900" },
                    { "flowid": 22, "direction": 1, "color": "#FF8000" },
                    { "flowid": 23, "direction": 1, "color": "#009900" },
                    { "flowid": 24, "direction": 1, "color": "#FF8000" }];

                this.$nextTick(() => {
                    // 设置svg画面拖动和缩放
                    this.panZoomTiger = this.initZoomPan();
                    this.panZoomTiger.zoom(1);
                    if (this.dgmDrawType == 0) {
                        this.panZoomTiger.zoom(1.14);
                        let pan = this.panZoomTiger.getPan()
                        this.panZoomTiger.pan({ x: pan.x, y: pan.y + 93 })
                        this.panZoomTiger.disableZoom();
                        this.panZoomTiger.disablePan();
                    }
                    // 阻止网页右键菜单
                    $("body").smartMenu([], { name: "body" }); $("body").smartMenu([], { name: "body" });
                    // 解析svg dom
                    // 获取所有动态数据标识，并缓存。为刷新数据做准备
                    this.cachedDynamicTagMap = parseSvg();
                    // 调整svg画面图元。将fill=none的图元设置为fill='#000'
                    adjustSvgSymbol($("defs")[0]);

                    if (tag == "day" || tag == "night") {
                        let data = null;
                        if (tag == "day") {
                            data = dataDay;
                        } else if (tag == "night") {
                            data = dataNight;
                        }
                        parseSvgFlow(data, 31, 30, 32);
                        if (document.querySelector('[flowid="32"]') != null) {
                            document.querySelector('[flowid="32"]').setAttribute("class", "button g2");
                        }
                        if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
                            $('.box_in').css('-webkit-animation', 'none');
                            $('.moveImg').css('-webkit-animation', 'none');
                        } else {
                            showHide();
                        }
                    } else {
                        parseSvgPower();
                    }
                   
                    // polling远程实时库数据，刷新svg画面
                    // pollingRequestData数据结构 = [{id:384477, code:'status'}, {id:5567, code:'ia'}];
                    let keys = getPollingRequestData(this.cachedDynamicTagMap);
                    console.log(this.cachedDynamicTagMap, keys)
                    // 获取标识牌类型码表
                    // this.getDrawWiringDicts().then(res => {
                    //     getSignTypeDict(res);
                    // })
                    this.polling(keys);
                    this.setInterval = setInterval(() => {
                        this.polling(keys);
                    }, 2000);

                })
            }).catch(err => { });
        },
        // svg缩放拖拽
        initZoomPan() {
            const eventsHandler = {
                haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel'],
                init: function (options) {
                    var instance = options.instance,
                        initialScale = 1,
                        pannedX = 0,
                        pannedY = 0
                    // Init Hammer
                    // Listen only for pointer and touch events
                    this.hammer = Hammer(options.svgElement, {
                        inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
                    })
                    // Enable pinch
                    this.hammer.get('pinch').set({ enable: true })
                    // Handle double tap
                    this.hammer.on('doubletap', function (ev) {
                        instance.zoomIn()
                    })
                    // Handle pan
                    this.hammer.on('panstart panmove', function (ev) {
                        // On pan start reset panned variables
                        if (ev.type === 'panstart') {
                            pannedX = 0
                            pannedY = 0
                        }
                        // Pan only the difference
                        instance.panBy({ x: ev.deltaX - pannedX, y: ev.deltaY - pannedY })
                        pannedX = ev.deltaX
                        pannedY = ev.deltaY
                    })
                    // Handle pinch
                    this.hammer.on('pinchstart pinchmove', function (ev) {
                        // On pinch start remember initial zoom
                        if (ev.type === 'pinchstart') {
                            initialScale = instance.getZoom()
                            instance.zoom(initialScale * ev.scale)
                        }
                        instance.zoom(initialScale * ev.scale)
                    })

                    // Prevent moving the page on some devices when panning over SVG
                    options.svgElement.addEventListener('touchmove', function (e) { e.preventDefault(); });
                },
                destroy: function () {
                    this.hammer.destroy()
                }
            }
            const element = document.querySelector('#svgImgDom').firstElementChild;
            // var g = document.getElementById("vertex").getBBox()
            // let rect = $(element).children()[3]
            // console.log(rect, g)
            element.style.width = this.dgmDrawType == 0 ? '1590px' : "100%"
            element.style.height = this.dgmDrawType == 0 ? '1260px' : '100%'
            element.style.pointerEvents = this.dgmDrawType == 0 ? 'none' : 'all'
            let self = this
            var panZoomTiger = svgPanZoom(element, {
                zoomEnabled: true,
                controlIconsEnabled: true,
                dblClickZoomEnabled: false,
                fit: true,
                center: false,
                contain: true,
                customEventsHandler: eventsHandler,
                panEnabled: true,
                // zoomScaleSensitivity: 1,
                // 'minZoom': -50,
                // 'maxZoom': 50,
                beforeZoom: function (oldZoom, newZoom) {
                    if (self.dgmDrawType == 0) {
                        return true
                    }
                },
                onZoom: function (newPan) {
                    if (self.dgmDrawType == 0) {
                        return false
                    }
                },
                beforePan: function (oldPan, newPan) {
                    if (self.dgmDrawType == 0) {
                        return { x: false, y: true }
                    }
                },
                onPan: function (newPan) {
                    if (self.dgmDrawType == 0) {
                        return false
                    }
                },
                onUpdatedCTM: function () {
                    return false
                }
            });
            let a = document.getElementById('svg-pan-zoom-controls');
            if (a) {
                a.remove();
            }
            return panZoomTiger;
        },
        /**
         * 获取标识牌类型码表
         * @param {*} obj 
         */
        async getDrawWiringDicts(obj) {
            let data = await this.$httpGet(window.api.drawWiringDicts).then(res => {
                return res
            }).catch(err => { });
            return data
        },
        async polling(keys) {
            $.ajax({
                type: 'POST',
                headers: { 'isswagger': 'true' },
                url: process.env.VUE_APP_BASE_BIZ_SERVICE + window.api.byKeys + '?r=' + Math.random(),
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(keys),
                success: (res) => {
                    if (res.successful) {
                        this.failCount = 0;
                        let resRdbData = res.result;
                        // 4.3 将remote数据渲染到svg画面。仅渲染变动数据
                        renderRdbData(resRdbData, this.cachedDynamicTagMap);
                    } else {
                        this.failCount = this.failCount + 1;
                        if (this.failCount == 5) {
                            this.$message({
                                type: 'info',
                                message: '实时数据获取失败'
                            });
                        } else if (this.failCount > 5 && (this.failCount - 5) % 10 == 0) {
                            this.$message({
                                type: 'info',
                                message: '实时数据获取失败'
                            });
                        }
                    }
                },
                error: (error) => {
                    this.failCount = this.failCount + 1;
                    // 连续5次访问失败，弹窗提醒
                    if (this.failCount == 5) {
                        if (typeof error.responseJSON === 'object') {
                            this.$message({
                                type: 'info',
                                message: error.responseJSON.message
                            });
                        }
                    } else if (this.failCount > 5 && (this.failCount - 5) % 10 == 0) {
                        // 每N次提示一次
                        if (typeof error.responseJSON === 'object') {
                            this.$message({
                                type: 'info',
                                message: JSON.stringify(error.responseJSON.message)
                            });
                        }
                    }

                }
            })
        }
    }
};
</script>
    
<style scoped lang="scss">
.wiringDiagramView {
    height: 100%;
    display: flex;
    justify-content: center;
    background-color: #011536;
    overflow: auto;
}
</style>
    
    
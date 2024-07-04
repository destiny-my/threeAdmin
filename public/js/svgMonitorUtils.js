
/**
 * svg画面监测工具类
 * 2019-7-28
 */
/**
 * 获取polling request数据
 * @param {svg图形中的量测信息标签集合} cachedDynamicTagMap
 */
function getPollingRequestData(cachedDynamicTagMap) {
    var result = [];
    if (!cachedDynamicTagMap) {
        return result;
    }

    cachedDynamicTagMap.forEach(function(item, key, mapObj) {
        if (key) {
            var keyArr = key.split('|');
            result.push({ id: keyArr[0], code: keyArr[1] });
        }
    });
    return result;
}

function getSignTypeDict() {
    return new Promise((resolve, reject) => {
        GET(layui.setter.baseUrl + 'history-admin/sign/info/dicts', {}).then((data) => {

            console.dir(data);

            signTypeDict = data.result["dicts"][data.result["fields"]["signType"]]; //{"1": "开启","2": "停运"}
            resolve(signTypeDict);
        });

    });
}
//时间戳转换为日期字符串
function timestampToTime(timestamp) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = String(date.getFullYear()).substring(2) + '/';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '/';
    var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
    var h = date.getHours() + ':';
    var m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ' ';
    return Y + M + D + h + m;
}
function timestampToHMS(timestamp) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = String(date.getFullYear()).substring(0) + '/';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '/';
    var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
    var h = date.getHours() + ':';
    var m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':';
    var s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds());
    return Y + M + D + h + m + s;
}

/**
 * 对比本地数据和ajax返回的rdb数据，如果数据发生变动，更新到svg画面
 * @param {缓冲的量测信息标签} cachedDynamicTagMap 
 */
function renderRdbData(resRdbData, cachedDynamicTagMap) {//, dictMap
    let curRtdMap = new Map();
    resRdbData.forEach(function (remoteData) {
        if (remoteData) { // 跳过null，NaN，undefined
            if(Object.prototype.toString.call(resRdbData.lastValue)== "[object Object]"){
                console.dir("实时标签数据计算有误！");
                console.dir(resRdbData.lastValue);
                remoteData.lastValue = "";
            }
            curRtdMap.set(remoteData.objId + '|' + remoteData.atrbCode, remoteData);
            var cachedTagArr = cachedDynamicTagMap.get(remoteData.objId + '|' + remoteData.atrbCode);

            if (cachedTagArr) {
                cachedTagArr.forEach(function (svgTag) { // svgTag : {cimType,metaNode,useNode}
                    //console.log(svgTag.svgUseElement.getAttribute('xlink:href'))
                    if (svgTag.svgUseElement.nodeName == "switch") { //tspan
                        var tmplId = cachedDynamicTagMap.get(remoteData.objId + '|' + remoteData.atrbCode)[0].cimType;                        
                        var val = remoteData.lastValue;
                        if (remoteData.lastValue != undefined && remoteData.lastValue != "") {
                            var temp = "--";
                            if (val.toString() != "") { temp = (new Number(val)).toFixed(2); }
                            if (svgTag.svgUseElement.firstChild.firstChild.firstChild.firstChild != undefined) {
                                svgTag.svgUseElement.firstChild.firstChild.firstChild.firstChild.innerText = temp;
                                svgTag.svgUseElement.firstChild.firstChild.firstChild.innerText = temp;
                            } else {
                                svgTag.svgUseElement.firstChild.firstChild.firstChild.innerText = temp;
                            }
                        }
                    } else if (svgTag.svgUseElement.nodeName == "tspan") { //tspan
                        // var tmplId = cachedDynamicTagMap.get(remoteData.objId + '|' + remoteData.atrbCode)[0].cimType;
                        // var val = remoteData.lastValue;
                        // if (remoteData.lastValue != undefined) {
                        //     var temp = "--";
                        //     if (val.toString() != "") { temp = (new Number(val)).toFixed(2); }
                        //     svgTag.svgUseElement.innerHTML = temp;
                        // }                        
                    } else {
                        if (svgTag.svgUseElement.getAttribute('xlink:href')) {
                            var localData = svgTag.svgUseElement.getAttribute('xlink:href').split('_'); // 如：#Breaker:开关（竖）_0
                            // 仅处理变动数据
                            var val = remoteData.lastValue;
                            //
                            if (remoteData.lastValue != undefined && remoteData.lastValue != "") {
                                if (remoteData.lastValue != localData[1]) {
                                    if (localData[0] == "#other.智能电灯") {
                                        svgTag.svgUseElement.parentNode.setAttribute("class", "diandeng" + val);
                                    }
                                    svgTag.svgUseElement.setAttribute('xlink:href', localData[0] + '_' + val);
                                }
                            }
                        }
                    }
                    if (remoteData.atrbCode == "#") {
                        if (remoteData["signInfo"] != undefined && remoteData["signInfo"] != "") {
                            //当前对象存在标识牌,但图上没有更新标识牌信息
                            if (svgTag.svgUseElement.getAttribute('class') != "svg-tooltip-root") {
                                svgTag.svgUseElement.setAttribute("class", "svg-tooltip-root");
                                let ctrl = "可控";
                                if (remoteData["signInfo"]["signCanCtrl"] == 0) {
                                    ctrl = "不可控";
                                }
                                let tempTipStr = "";
                                tempTipStr = "<div class='title-tip'>标识牌信息</div>";
                                tempTipStr = tempTipStr + "<div class='info-tip'><span>类型: </span><div class='tip-content'>" + signTypeDict[remoteData["signInfo"]["signType"]] + " </div></div> ";
                                tempTipStr = tempTipStr + "<div class='info-tip'><span>规则: </span><div class='tip-content'>" + ctrl + "  </div></div>";
                                tempTipStr = tempTipStr + "<div class='info-tip'><span>时间: </span><div class='tip-content'>" + timestampToTime(remoteData["signInfo"]["signTime"]) + "</div></div>";
                                tempTipStr = tempTipStr + "<div class='info-tip'><span>备注: </span><div class='tip-content'>" + (remoteData["signInfo"]["comment"] == undefined ? "无" : remoteData["signInfo"]["comment"]) + " </div></div> ";
                                $(svgTag.svgUseElement.parentNode).tinytip({
                                    tooltip: tempTipStr,
                                    targetId: "obj-" + remoteData.objId,
                                    addClass: 'svg-tooltip svg-tooltip-sign' + remoteData["signInfo"]["signType"]
                                });
                            }
                            if ($('#sign-icon-obj-' + remoteData.objId).length == 0) {
                                // 标志牌: 1 锁住 2 保持分闸 3 保持合闸 4 警告 5 接地 6 检修
                                if (remoteData["signInfo"]["signType"] == "1") {
                                    svgTag.svgUseElement.outerHTML = svgTag.svgUseElement.outerHTML + genSignSZ(remoteData.objId, (parseFloat(svgTag.svgUseElement.getAttribute("x")) - 5), (parseFloat(svgTag.svgUseElement.getAttribute("y")) - 5));                                    
                                } else if (remoteData["signInfo"]["signType"] == "2") {
                                    svgTag.svgUseElement.outerHTML = svgTag.svgUseElement.outerHTML + genSignBCFZ(remoteData.objId, (parseFloat(svgTag.svgUseElement.getAttribute("x")) - 5), (parseFloat(svgTag.svgUseElement.getAttribute("y")) - 5)); 
                                } else if (remoteData["signInfo"]["signType"] == "3") {
                                    svgTag.svgUseElement.outerHTML = svgTag.svgUseElement.outerHTML + genSignBCHZ(remoteData.objId, (parseFloat(svgTag.svgUseElement.getAttribute("x")) - 5), (parseFloat(svgTag.svgUseElement.getAttribute("y")) - 5)); 
                                } else if (remoteData["signInfo"]["signType"] == "4") {
                                    svgTag.svgUseElement.outerHTML = svgTag.svgUseElement.outerHTML + genSignJG(remoteData.objId, (parseFloat(svgTag.svgUseElement.getAttribute("x")) - 5), (parseFloat(svgTag.svgUseElement.getAttribute("y")) - 5)); 
                                } else if (remoteData["signInfo"]["signType"] == "5") {
                                    svgTag.svgUseElement.outerHTML = svgTag.svgUseElement.outerHTML + genSignJD(remoteData.objId, (parseFloat(svgTag.svgUseElement.getAttribute("x")) - 5), (parseFloat(svgTag.svgUseElement.getAttribute("y")) - 5)); 
                                } else if (remoteData["signInfo"]["signType"] == "6") {
                                    svgTag.svgUseElement.outerHTML = svgTag.svgUseElement.outerHTML + genSignJX(remoteData.objId, (parseFloat(svgTag.svgUseElement.getAttribute("x")) - 5), (parseFloat(svgTag.svgUseElement.getAttribute("y")) - 5)); 
                                } else {
                                    svgTag.svgUseElement.outerHTML = svgTag.svgUseElement.outerHTML + genSignJD(remoteData.objId, (parseFloat(svgTag.svgUseElement.getAttribute("x")) - 5), (parseFloat(svgTag.svgUseElement.getAttribute("y")) - 5)); 
                                }
                            } else {
                                // 标志牌: 1 锁住 2 保持分闸 3 保持合闸 4 警告 5 接地 6 检修
                                if (remoteData["signInfo"]["signType"] == "1") {
                                    $('#sign-icon-obj-' + remoteData.objId).outerHTML = genSignSZ(remoteData.objId, (parseFloat(svgTag.svgUseElement.getAttribute("x")) - 5), (parseFloat(svgTag.svgUseElement.getAttribute("y")) - 5));
                                } else if (remoteData["signInfo"]["signType"] == "2") {
                                    $('#sign-icon-obj-' + remoteData.objId).outerHTML = genSignBCFZ(remoteData.objId, (parseFloat(svgTag.svgUseElement.getAttribute("x")) - 5), (parseFloat(svgTag.svgUseElement.getAttribute("y")) - 5));
                                } else if (remoteData["signInfo"]["signType"] == "3") {
                                    $('#sign-icon-obj-' + remoteData.objId).outerHTML = genSignBCHZ(remoteData.objId, (parseFloat(svgTag.svgUseElement.getAttribute("x")) - 5), (parseFloat(svgTag.svgUseElement.getAttribute("y")) - 5));
                                } else if (remoteData["signInfo"]["signType"] == "4") {
                                    $('#sign-icon-obj-' + remoteData.objId).outerHTML = genSignJG(remoteData.objId, (parseFloat(svgTag.svgUseElement.getAttribute("x")) - 5), (parseFloat(svgTag.svgUseElement.getAttribute("y")) - 5));
                                } else if (remoteData["signInfo"]["signType"] == "5") {
                                    $('#sign-icon-obj-' + remoteData.objId).outerHTML = genSignJD(remoteData.objId, (parseFloat(svgTag.svgUseElement.getAttribute("x")) - 5), (parseFloat(svgTag.svgUseElement.getAttribute("y")) - 5));
                                } else if (remoteData["signInfo"]["signType"] == "6") {
                                    $('#sign-icon-obj-' + remoteData.objId).outerHTML = genSignJX(remoteData.objId, (parseFloat(svgTag.svgUseElement.getAttribute("x")) - 5), (parseFloat(svgTag.svgUseElement.getAttribute("y")) - 5));
                                } else {
                                    $('#sign-icon-obj-' + remoteData.objId).outerHTML = genSignJD(remoteData.objId, (parseFloat(svgTag.svgUseElement.getAttribute("x")) - 5), (parseFloat(svgTag.svgUseElement.getAttribute("y")) - 5));
                                }
                            }
                   
                        } else {
                            //当前对象已解除标识牌,但图上取消
                            $('#tinytip-obj-' + remoteData.objId).remove();
                            svgTag.svgUseElement.setAttribute("class", "");
                            $('#sign-icon-obj-' + remoteData.objId).remove();
                        }
                    } else {
                        let label = "";
                        let valFlag = false;
                        let tempTipStr = "";
                        if (remoteData["signInfo"] != undefined && remoteData["signInfo"] != "") {
                            let ctrl = "可控";
                            if (remoteData["signInfo"]["signCanCtrl"] == 0) {
                                ctrl = "不可控";
                            }
                            tempTipStr = tempTipStr + "<div class='info-tip'><span>标识牌: </span><div class='tip-content'>" + signTypeDict[remoteData["signInfo"]["signType"]] + "( " + ctrl + " ) </div></div> ";
                            valFlag = true;
                        } else {
                            tempTipStr = tempTipStr + "<div class='info-tip'><span>标识牌: </span><div class='tip-content'>无</div></div> ";
                        }
                        // var QUALITY_CODE = {
                        //     "is_init": "是否初始化",
                        //     "data_source": "数据来源",
                        //     "is_effective": "是否有效",
                        //     "is_dead": "是否为死数据",
                        //     "yx_status": "遥信变位状态",
                        //     "over_limit_status": "遥测越限状态"
                        // };
                        // if (("" + remoteData["is_init"]) != "" && ("" +remoteData["is_init"]) != "undefined" && QUALITY_CODE_INIT[remoteData["is_init"]] != undefined) {
                        //     tempTipStr = tempTipStr + "<div class='info-tip'><span>是否初始化: </span><div class='tip-content'>" + QUALITY_CODE_INIT[remoteData["is_init"]] + "</div></div> ";
                        //     valFlag = true;
                        //     if ((parseInt(remoteData["is_init"]) == 0)) {
                        //         label = "svg-tooltip-atrb-uninit";//未初始化，灰色
                        //     }
                        // } else {
                        //     tempTipStr = tempTipStr + "<div class='info-tip'><span>是否初始化: </span><div class='tip-content'>未知</div></div> ";
                        //     valFlag = true;
                        // }
                        // if (("" + remoteData["data_source"]) != "" && ("" +remoteData["data_source"]) != "undefined" && dataTypeDict[remoteData["data_source"]] != undefined) {
                        //     tempTipStr = tempTipStr + "<div class='info-tip'><span>数据来源: </span><div class='tip-content'>" + dataTypeDict[remoteData["data_source"]] + "</div></div> ";
                        //     valFlag = true;//0：无；1：采集量；2：计算值；3：人工置数；4：封锁；5：状态估计；......                            
                        //     if ((parseInt(remoteData["data_source"]) == 3 )) {
                        //         label = "svg-tooltip-atrb-hand";//人工置数，蓝框
                        //     }
                        //     if ((parseInt(remoteData["data_source"]) ==4)) {
                        //         label = "svg-tooltip-atrb-lock";// 封锁，白框
                        //     }
                        // } else {
                        //     tempTipStr = tempTipStr + "<div class='info-tip'><span>数据来源: </span><div class='tip-content'>无</div></div> ";
                        //     valFlag = true;
                        // }
                        // if (("" +remoteData["is_effective"]) != "" && ("" +remoteData["is_effective"]) != "undefined" && QUALITY_CODE_EFFECT[remoteData["is_effective"]] != undefined) {
                        //     tempTipStr = tempTipStr + "<div class='info-tip'><span>是否有效: </span><div class='tip-content'>" + QUALITY_CODE_EFFECT[remoteData["is_effective"]] + "</div></div> ";
                        //     valFlag = true;
                        //     if ((parseInt(remoteData["is_effective"]) == 0)) {
                        //         label = "svg-tooltip-atrb-uneffect";//无效，灰色
                        //     }
                        // } else {
                        //     tempTipStr = tempTipStr + "<div class='info-tip'><span>是否有效: </span><div class='tip-content'>未知</div></div> ";
                        //     valFlag = true;
                        // }
                        // if (("" + remoteData["is_dead"]) != "" && ("" +remoteData["is_dead"]) != "undefined" && QUALITY_CODE_DEAD[remoteData["is_dead"]] != undefined) {
                        //     tempTipStr = tempTipStr + "<div class='info-tip'><span>是否为死数据: </span><div class='tip-content'>" + QUALITY_CODE_DEAD[remoteData["is_dead"]] + "</div></div> ";
                        //     valFlag = true;
                        //     //是否为死数据，提示效果暂不处理
                        // } else {
                        //     tempTipStr = tempTipStr + "<div class='info-tip'><span>是否为死数据: </span><div class='tip-content'>无</div></div> ";
                        //     valFlag = true;
                        // }
                        // if (parseInt(remoteData["atrbType"]) == IOT_ATRB_TYPE.MEASURE) {//遥测属性，显示遥测越限状态
                        //     if ((""+remoteData["over_limit_status"]) != "" && (""+remoteData["over_limit_status"]) != "undefined" && QUALITY_CODE_OVER[remoteData["over_limit_status"]] != undefined) {
                        //         tempTipStr = tempTipStr + "<div class='info-tip'><span>越限状态: </span><div class='tip-content'>" + QUALITY_CODE_OVER[remoteData["over_limit_status"]] + "</div></div> ";
                        //         valFlag = true;
                        //         if ((parseInt(remoteData["over_limit_status"]) > 0)) {
                        //             label = label + "  svg-tooltip-atrb-over";//越限闪烁（文字 有无闪烁）
                        //         }
                        //     } else {
                        //         tempTipStr = tempTipStr + "<div class='info-tip'><span>越限状态: </span><div class='tip-content'>正常</div></div> ";
                        //         valFlag = true;
                        //     }
                        // } else if (parseInt(remoteData["atrbType"]) == IOT_ATRB_TYPE.YT || parseInt(remoteData["atrbType"]) == IOT_ATRB_TYPE.SINGNAL) {
                        //     //遥信、遥调属性，显示遥信变位状态
                        //     if (("" + remoteData["yx_status"]) != "" && ("" +remoteData["yx_status"]) != "undefined" && QUALITY_CODE_YX[remoteData["yx_status"]] != undefined) {
                        //         tempTipStr = tempTipStr + "<div class='info-tip'><span>变位状态: </span><div class='tip-content'>" + QUALITY_CODE_YX[remoteData["yx_status"]] + "</div></div> ";
                        //         valFlag = true;
                        //         if ((parseInt(remoteData["yx_status"]) >0)) {
                        //             label = label + "  svg-tooltip-atrb-bw";//变位闪烁（图元 明暗闪烁）
                        //         }
                        //     } else {
                        //         tempTipStr = tempTipStr + "<div class='info-tip'><span>变位状态: </span><div class='tip-content'>正常</div></div> ";
                        //         valFlag = true;
                        //     }
                            
                        // }

                        // if (svgTag.svgUseElement.getAttribute('xlink:href')) {
                        //     //开关等图元类
                        //     if (valFlag) {
                        //         if (svgTag.svgUseElement.getAttribute('class') != "svg-tooltip-root") {
                        //             //需要显示,但图上还没有
                        //             svgTag.svgUseElement.setAttribute("class", "svg-tooltip-root");
                        //         }
                        //         $(svgTag.svgUseElement.parentNode).tinytip({
                        //             tooltip: tempTipStr,
                        //             targetId: "atrb-" + remoteData.id,
                        //             addClass: 'svg-tooltip svg-tooltip-atrb'
                        //         });

                        //         svgTag.svgUseElement.setAttribute("class", "svg-tooltip-root "+label);
                        //     } else {
                        //         //挂牌信息合数据来源都没有,但图上有过时的信息
                        //         if (svgTag.svgUseElement.getAttribute('class') != "svg-tooltip-root") {
                        //             $(svgTag.svgUseElement.parentNode).tinytip({
                        //                 tooltip: "",
                        //                 targetId: "atrb-" + remoteData.id
                        //             });
                        //             svgTag.svgUseElement.setAttribute("class", "");
                        //             // svgTag.svgUseElement.setAttribute("class", "");
                        //         }
                        //     }
                        // } else {
                        //     //文本
                        //     if (valFlag) {
                        //         if (svgTag.svgUseElement.getAttribute('class') != "svg-tooltip-root") {
                        //             //需要显示,但图上还没有
                        //             svgTag.svgUseElement.setAttribute("class", "svg-tooltip-root");
                        //         }
                        //         $(svgTag.svgUseElement.parentNode).tinytip({
                        //             tooltip: tempTipStr,
                        //             targetId: "atrb-" + remoteData.id,
                        //             addClass: 'svg-tooltip svg-tooltip-atrb'
                        //         });
                        //         svgTag.svgUseElement.setAttribute("class", "svg-tooltip-root " + label);
                        //         svgTag.svgUseElement.firstChild.firstChild.setAttribute("class", label);
                        //     } else {
                        //         //挂牌信息合数据来源都没有,但图上有过时的信息
                        //         if (svgTag.svgUseElement.getAttribute('class') != "svg-tooltip-root") {
                        //             $(svgTag.svgUseElement.parentNode).tinytip({
                        //                 tooltip: "",
                        //                 targetId: "atrb-" + remoteData.id
                        //             });
                        //             svgTag.svgUseElement.setAttribute("class", "");
                        //             svgTag.svgUseElement.firstChild.firstChild.setAttribute("class", "");
                        //         }
                        //     }
                        // }
                    }
                })
            }
        }
    });
    rtdMap = curRtdMap;
}

function afterShowMenu() {
    document.oncontextmenu = function noMenuReject() { return false; }
}

function showMyMenu(e) {
    if (e.which == 3) { // 1 = 鼠标左键 left; 2 = 鼠标中键; 3 = 鼠标右键 
        e.preventDefault();
        e.stopPropagation();

        $(e.currentTarget).smartMenu([]);
        var option = {
            name: "",
            offsetX: 2,
            offsetY: 2,
            textLimit: 10,
            beforeShow: $.noop,
            afterShow: afterShowMenu
        };
        
        var objId = e.currentTarget.lastChild.children[1].attributes[0].nodeValue;
        var atrbCode = e.currentTarget.lastChild.children[1].attributes[1].nodeValue;
        var tmplId = e.currentTarget.lastChild.children[0].attributes[0].nodeValue;
        if (atrbCode == '#') {
            //跳转设备画像
            $.smartMenu.remove();
            $(e.currentTarget).smartMenu(buildMenuData(null, objId, atrbCode, tmplId, e.x, e.y), option);
        } else {
            var curStatus;
            if (e.currentTarget.firstChild.nodeName == "use") {//引用图形元素
                var temp = e.currentTarget.firstChild.href.baseVal;
                var status = temp.split('_')[temp.split('_').length - 1];
                if (status != 'undefined') {
                    // if (dictMap[tmplId] != "undefined" && dictMap[tmplId].fields != "undefined" && dictMap[tmplId].fields.hasOwnProperty(atrbCode)) {
                    //     curStatus = dictMap[tmplId].dicts[dictMap[tmplId].fields[atrbCode]][status];
                    //     console.log(curStatus);
                    //     console.log(objId);
                    //     $.smartMenu.remove();
                    //     $(e.currentTarget).smartMenu(buildMenuData(curStatus, objId, atrbCode, tmplId, e.x, e.y), option);
                    // } else { //没有使用码表
                    $.smartMenu.remove();
                    curStatus = status;
                    $(e.currentTarget).smartMenu(buildMenuData(curStatus, objId, atrbCode, tmplId, e.x, e.y), option);
                    // }
                }
            } else {//文本元素
                $.smartMenu.remove();
                curStatus = e.currentTarget.firstChild.firstChild.firstChild.innerText;
                $(e.currentTarget).smartMenu(buildMenuData(curStatus, objId, atrbCode, tmplId, e.x, e.y), option);
            }　　            
        }
        return false; //阻止跳转 
    } else {
        e.preventDefault();
    }
}
/**
 * 解析svg Dom，缓存所有动态数据标签，包括遥测、遥信等
 */
function parseSvg() {
    // cachedDynamicTagMap数据结构: Map:  {(key) objectId|fieldNo: (value)[{cimType,metaNode,useNode},{cimType,metaNode,useNode}]}
    var cachedDynamicTagMap = new Map();
    $("g[id='basicShapes'] g").each(function(index, item) {
        // if (item.hasAttribute('drawname')) {
        //     // 该节点为跳转链接
        //     var drawFileName = item.getAttribute('drawname');
        //     item.setAttribute("class","button draw-click");
        //     item.setAttribute("onclick","window.location.href='monitor.html?fileName=" + drawFileName + "&&tag='");
        // }

        // if (item.hasAttribute('linkpage')) {
        //     // 该节点为跳转链接
        //     var linkurl = item.getAttribute('linkpage');
        //     item.setAttribute("class","button draw-click");
        //     item.setAttribute("onclick","window.location.href='" + linkurl + "'");
        // }
        if (item.hasAttribute('webpage')) {
            // 该节点为图上浮窗
            showFrameOnSvg(item);
        }
    });
    $("g[id='measures'] metadata PSR_Ref").each(function(index, item) {
        var key = item.getAttribute('objectid') + '|' + item.getAttribute('fieldcode');
        if (item.previousElementSibling.getAttribute('cimtype')) {
            // 缓存use节点
            var tagValue;
            // if(item.parentNode.previousElementSibling.nodeName == 'use'){
            // 1.构造tagValue对象，封装<g>的下级信息
            tagValue = {
                cimType: item.previousElementSibling.getAttribute('cimtype'),
                svgMetaElement: item, // svg meta node object
                svgUseElement: item.parentNode.previousElementSibling // svg use node object
            }
            console.log("measures_xlink:href" + key + item.parentNode.previousElementSibling.getAttribute('xlink:href'));

            // 2.为svg画面元素，增加右键点击事件
            gNode = item.parentNode.parentNode;
            gNode.addEventListener('mousedown', function(e) { showMyMenu(e); });
            //if (item.getAttribute('fieldcode').trim() == '#') {
            //code#表示设备本身，用于跳转设备画像
            var cachedTagValueArr = cachedDynamicTagMap.get(key);
            if (cachedTagValueArr == null) { // 执行第一次缓存时，构建数组
                cachedTagValueArr = [];
            }
            cachedTagValueArr.push(tagValue);

            cachedDynamicTagMap.set(key, cachedTagValueArr);
        }
    });
    $("g[id='vertex'] metadata PSR_Ref").each(function(index, item) {
        var key = item.getAttribute('objectid') + '|' + item.getAttribute('fieldcode');

        if (item.previousElementSibling.getAttribute('cimtype')) {
            // 缓存use节点
            var tagValue;
            // if(item.parentNode.previousElementSibling.nodeName == 'use'){
            // 1.构造tagValue对象，封装<g>的下级信息
            tagValue = {
                cimType: item.previousElementSibling.getAttribute('cimtype'),
                svgMetaElement: item // svg meta node object
                    ,
                svgUseElement: item.parentNode.previousElementSibling // svg use node object
            }
            console.log("vertex_xlink:href  " + item.parentNode.previousElementSibling.getAttribute('xlink:href'));

            // 2.为svg画面元素，增加右键点击事件
            gNode = item.parentNode.parentNode;
            gNode.addEventListener('mousedown', function(e) { showMyMenu(e); });
            gNode.setAttribute("class","objpointer");
            //if (item.getAttribute('fieldcode') != '#') {
            //code#表示设备本身，用于跳转设备画像
            var cachedTagValueArr = cachedDynamicTagMap.get(key);
            if (cachedTagValueArr == null) { // 执行第一次缓存时，构建数组
                cachedTagValueArr = [];
            }
            cachedTagValueArr.push(tagValue);
            cachedDynamicTagMap.set(key, cachedTagValueArr);
        }
    });
    console.log(cachedDynamicTagMap)
    return cachedDynamicTagMap;
}

/**
 * 调整svg画面图元
 * 将fill=none的图元设置为fill='#000'
 * 
 */
function adjustSvgSymbol(dom) {
    if (dom.children.length > 0) {
        //说明还有孩子节点
        resetFillColor(dom);
        for (var item of dom.children) {
            adjustSvgSymbol(item);
        };
    } else {
        resetFillColor(dom);
    }
}

function resetFillColor(curDom) {
    if (curDom.getAttribute('fill') == 'none') {
        curDom.setAttribute('fill', '#000');
    }
    curDom.setAttribute('pointer-eventes', 'all');
}

function initZoomPan() {
    const eventsHandler = {
        haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel'],
        init: function(options) {
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
            this.hammer.on('doubletap', function(ev) {
                    instance.zoomIn()
                })
                // Handle pan
            this.hammer.on('panstart panmove', function(ev) {
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
            this.hammer.on('pinchstart pinchmove', function(ev) {
                    // On pinch start remember initial zoom
                    if (ev.type === 'pinchstart') {
                        initialScale = instance.getZoom()
                        instance.zoom(initialScale * ev.scale)
                    }
                    instance.zoom(initialScale * ev.scale)
                })
                // Prevent moving the page on some devices when panning over SVG
            options.svgElement.addEventListener('touchmove', function(e) { e.preventDefault(); });
        },
        destroy: function() {
            this.hammer.destroy()
        }
    }
    const element = document.querySelector('#svgImgDom').firstElementChild;
    var panZoomTiger = svgPanZoom(element, {
        zoomEnabled: true,
        controlIconsEnabled: true,
        dblClickZoomEnabled: false,
        fit: false,
        center: true,
        customEventsHandler: eventsHandler
    });
    let a = document.getElementById('svg-pan-zoom-controls');
    if (a) {
        a.remove();
    }
    return panZoomTiger;
}

function adjustToFreezeWidth(rootSvg) {
    var windowWidth = $(window).width();

    var viewBoxVal = rootSvg.getAttribute("viewBox");
    var viewBoxWidth = viewBoxVal.split(",")[2];
    var viewBoxHeight = viewBoxVal.split(",")[3];
    rootSvg.removeAttribute("width");
    rootSvg.removeAttribute("height");

    var setWidth = windowWidth;
    var setHeight = (setWidth * viewBoxHeight) / viewBoxWidth;
    rootSvg.setAttribute("width", setWidth);
    rootSvg.setAttribute("height", setHeight);
}

function adjustToNone(rootSvg) {

    var viewBoxVal = rootSvg.getAttribute("viewBox");
    var viewBoxWidth = viewBoxVal.split(",")[2];
    var viewBoxHeight = viewBoxVal.split(",")[3];
    rootSvg.removeAttribute("width");
    rootSvg.removeAttribute("height");

    rootSvg.setAttribute("width", viewBoxWidth);
    rootSvg.setAttribute("height", viewBoxHeight);

}

function adjustToFreezeHeight(rootSvg) {

    var windowHeight = $(window).height();

    var viewBoxVal = rootSvg.getAttribute("viewBox");
    var viewBoxWidth = viewBoxVal.split(",")[2];
    var viewBoxHeight = viewBoxVal.split(",")[3];
    rootSvg.removeAttribute("width");
    rootSvg.removeAttribute("height");

    var setHeight = windowHeight;
    var setWidth = (setHeight * viewBoxWidth) / viewBoxHeight;
    rootSvg.setAttribute("width", setWidth);
    rootSvg.setAttribute("height", setHeight);
}

function adjustToFreezeAll() {

    var windowHeight = $(window).height();
    var windowWidth = $(window).width();

    rootSvg.removeAttribute("width");
    rootSvg.removeAttribute("height");

    rootSvg.setAttribute("width", windowWidth);
    rootSvg.setAttribute("height", windowHeight);

}

/**
 * 开启svg画面平移和缩放功能
 */
function configPanZoom() {
    return $("svg").svgPanZoom({
        events: {
            mouseWheel: true, // enables mouse wheel zooming events
            doubleClick: true, // enables double-click to zoom-in events
            drag: true, // enables drag and drop to move the SVG events
            dragCursor: "move" // cursor to use while dragging the SVG
        },
        animationTime: 0, // time in milliseconds to use as default for animations. Set 0 to remove the animation
        zoomFactor: 0.1, // how much to zoom-in or zoom-out
        maxZoom: 10, //maximum zoom in, must be a number bigger than 1
        panFactor: 10, // how much to move the viewBox when calling .panDirection() methods
        // initialViewBox: { // the initial viewBox, if null or undefined will try to use the viewBox set in the svg tag. Also accepts string in the format "X Y Width Height"
        //     x: 0, // the top-left corner X coordinate
        //     y: 0, // the top-left corner Y coordinate
        //     width: 5000, // the width of the viewBox
        //     height: 5000 // the height of the viewBox
        // },
        // limits: { // the limits in which the image can be moved. If null or undefined will use the initialViewBox plus 15% in each direction
        //     x: 0,
        //     y: 0,
        //     x2: 2000,
        //     y2: 2000
        // }
    });
}


function parseSvgPower() {
    const styles = document.createElement('style');
    styles.type = 'text/css';
    styles.innerHTML = styles.innerHTML +
        // " tspan { font-weight:bold; }" +
        " @-webkit-keyframes fadeIn { 0% { opacity: 1;}  50% { opacity: 0.6;} 100% { opacity: 0.1;  } }" +
        " .diandeng2 { -webkit-animation-name: fadeIn;  -webkit-animation-duration: 2s; " +
        " -webkit-animation-iteration-count: infinite; -webkit-animation-delay: 0s;  display:block; }" +
        " .diandeng3 { -webkit-animation-name: fadeIn;  -webkit-animation-duration: 0.5s; " +
        " -webkit-animation-iteration-count: infinite; -webkit-animation-delay: 0s;  display:block; }";
    // + " other.智能电灯_0";
    //diandeng2 闪烁
    //diandeng3 快闪
    var heads = document.getElementsByTagName("head");
    heads[0].appendChild(styles);
}

function parseSvgFlow(data, g1, g2, g3) {

    const styles = document.createElement('style');
    styles.type = 'text/css';
    styles.innerHTML = styles.innerHTML +
        "  polyline{stroke-linecap:unset;} " //square
        +
        " .g1{cursor:pointer!important;}  .g2{cursor:pointer!important;} .g3{cursor:pointer!important;}" +
        " .forward-runing {  stroke-dasharray: 15,5; animation: forward-run 1s linear infinite;   } " +
        " @keyframes forward-run {  to {  stroke-dashoffset:1970; } } "
        +
        " .objpointer{cursor:pointer!important;}";
    // + " tspan { font-weight:bold;}";
    var heads = document.getElementsByTagName("head");
    heads[0].appendChild(styles);

    if (document.querySelector('[flowid="' + g1 + '"]') != null) {
        $('[flowid="' + g1 + '"]').attr("class", "button g1");
    }
    if (document.querySelector('[flowid="' + g2 + '"]') != null) {
        $('[flowid="' + g2 + '"]').attr("class", "button g2");
    }
    if (document.querySelector('[flowid="' + g3 + '"]') != null) {
        $('[flowid="' + g3 + '"]').attr("class", "button g3");
    }

    if (document.getElementById("lines")) {
        document.getElementById("lines").remove();
    }

    document.getElementById('basicShapes').innerHTML = '<defs><pattern id="arrows-up" x="0" y="0" width="1" height="1" patternUnits="objectBoundingBox"><svg id="arrows" viewBox="0 0 1024 1024" width="30" height="35"><path d="M27.273 753.613l485.222-484.233 484.233 485.222z" fill="#ffffff"></path></svg></pattern></defs>  <defs><pattern id="arrows-right" x="0" y="0" width="1" height="1" patternUnits="objectBoundingBox"><svg id="arrows" viewBox="0 0 1024 1024" width="35" height="30"><path d="M270.387 27.273l484.233 485.222-485.222 484.233z" fill="#ffffff"></path></svg></pattern></defs>  <defs><pattern id="arrows-left" x="0" y="0" width="1" height="1" patternUnits="objectBoundingBox"><svg id="arrows" viewBox="0 0 1024 1024" width="35" height="30"><path d="M753.613 996.727l-484.233-485.222 485.222-484.233z" fill="#ffffff"></path></svg></pattern></defs>  <defs><pattern id="arrows-down" x="0" y="0" width="1" height="1" patternUnits="objectBoundingBox"><svg id="arrows" viewBox="0 0 1024 1024" width="30" height="35"><path d="M1023.979022 274.91428 511.999488 824.030619 0.020978 274.91428Z" fill="#ffffff"></path></svg></pattern></defs>' + document.getElementById('basicShapes').innerHTML;

    var length = 2000;
    for (var i = 0; i < data.length; i++) {
        if (document.querySelector('[flowid="' + data[i].flowid + '"]') == null) {
            continue;
        }
        var path = document.querySelector('[flowid="' + data[i].flowid + '"]').children[0];
        if (length < path.getTotalLength()) {
            length = path.getTotalLength();
        }
    }
    // stroke-dasharray 间距要相等  
    // 下面dis 的计算公式中 最后的*数字 值为间距数值
    var dis = Math.ceil(length / 500) * 10;
    for (var i = 0; i < data.length; i++) {
        if (document.querySelector('[flowid="' + data[i].flowid + '"]') == null) {
            continue;
        }
        document.querySelector('[flowid="' + data[i].flowid + '"]').children[0].setAttribute("stroke-dashoffset", length);
        if (data[i].direction == 0) { continue; }
        if (data[i].direction == -1) {
            length = length + dis;
        } else if (data[i].direction == 1) {
            length = length - dis;
        }
        const runclass = '.run-dash' + i + '{stroke-dasharray: 15,5; animation:dash' + i + ' 1.5s linear infinite; }';
        const runkeyframes = '@keyframes dash' + i + '{to{ stroke-dashoffset:' + length + ';}}';
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = runclass + runkeyframes;
        var head = document.getElementsByTagName("head");
        head[0].appendChild(style);

        document.querySelector('[flowid="' + data[i].flowid + '"]').children[0].setAttribute("stroke-dasharray", '15,5');
        document.querySelector('[flowid="' + data[i].flowid + '"]').children[0].setAttribute("style", ' stroke-dasharray: 15,5');

        if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {} else {
            document.querySelector('[flowid="' + data[i].flowid + '"]').children[0].setAttribute("class", 'run-dash' + i);
        }
        var polyline = document.querySelector('[flowid="' + data[i].flowid + '"]').children[0];
        var innerhtml = document.querySelector('[flowid="' + data[i].flowid + '"]').innerHTML;
        var plpoints = polyline.getAttribute("points").split(" ");
        for (var pl = 0; pl < plpoints.length / 2 - 1; pl++) {

            var d = judgeDirection(plpoints[2 * pl], plpoints[2 * pl + 1], plpoints[2 * pl + 2], plpoints[2 * pl + 3], data[i].direction);
            if (d == undefined) {
                continue;
            }
            var pos_x = plpoints[2 * pl] / 2 + plpoints[2 * pl + 2] / 2 - 15;
            var pos_y = plpoints[2 * pl + 1] / 2 + plpoints[2 * pl + 3] / 2 - 15;
            var pos_w = 30,
                pos_h = 35;
            if (d == "right" || d == "left") {
                pos_w = 35;
                pos_h = 30;
            }

            innerhtml = innerhtml + '<rect class="arrows" x="' + pos_x + '" y="' + pos_y + '" width="' + pos_w + '" height="' + pos_h + '" stroke="none" fill="url(#arrows-' + d + ')" />';
        }
        document.querySelector('[flowid="' + data[i].flowid + '"]').innerHTML = innerhtml;
    }
}
//判断箭头的方向
//允许出现一个像素点的误差
function judgeDirection(x1, y1, x2, y2, d) {
    var _x = x2 - x1;
    var _y = y2 - y1;
    if (Math.floor(Math.abs(_x)) < 5 && _y > 0 && Math.abs(_y) > 40 && Math.abs(_x) < Math.abs(_y)) {
        if (d == 1) { return "down"; } else { return "up"; }
    } else if (Math.floor(Math.abs(_x)) < 5 && _y < 0 && Math.abs(_y) > 40 && Math.abs(_x) < Math.abs(_y)) {
        if (d == 1) { return "up"; } else { return "down"; }
    } else if (Math.floor(Math.abs(_y)) < 5 && _x > 0 && Math.abs(_x) > 40 && Math.abs(_x) > Math.abs(_y)) {
        if (d == 1) { return "right"; } else { return "left"; }
    } else if (Math.floor(Math.abs(_y)) < 5 && _x < 0 && Math.abs(_x) > 40 && Math.abs(_x) > Math.abs(_y)) {
        if (d == 1) { return "left"; } else { return "right"; }
    }
}
//添加箭头闪现的动画
function showHide() {
    //document.getElementById
    $.each($('.arrows'), function(i, el) {
        // change the opacity to 0.
        $(el).css({
            'opacity': 0.2
        });
        // change the opacity to 1 with a transition.
        setTimeout(function() {
            $(el).animate({
                'opacity': 0.8
            }, 500);
        }, 50 + (i * 35)); // growing delay to each circles
    });

    // Loop again throught each circles 
    // $.each($('.arrowss'), function(i, el) {
    //     // and hide the circles
    //     setTimeout(function() {
    //         $(el).animate({
    //             'opacity': 0.2
    //         }, 450);
    //     }, 50 + (i * 35));
    // });
    // Loop the animation
    x = setTimeout("showHide()", 10000);
}
/**
 * 右键菜单列表
 * @param {*} key 所点击的<g>节点的主信息：objectid+fieldno
 * @param {*} tagValue 所点击的<g>节点的其他信息
 */
function buildMenuData(curStatus, objId, atrbCode, tmplId, x, y) {
    if (atrbCode == '#') {//点击设备自身
        if (rtdMap == null || rtdMap.get(objId + "|" + atrbCode)==null) {
            //获取不到实时数据
            // var menu = [[{ text: "设备画像", func: function () { showDecivePage(tmplId, objId) } }]];
            return [];
        } else {
            if (rtdMap.get(objId + "|" + atrbCode)["signInfo"] == null || rtdMap.get(objId + "|" + atrbCode)["signInfo"] == "" ) {
                var menu = [[{ text: "设备画像", func: function () { showDecivePage(tmplId, objId) } }],
                            [{ text: "设置标志牌", func: function () { addSign(tmplId, objId, x, y) } }]];
                return menu;
            } else {
                var menu = [[{ text: "设备画像", func: function () { showDecivePage(tmplId, objId) } }],
                    [{ text: "移除标志牌", func: function () { delSign(tmplId, objId, signTypeDict[rtdMap.get(objId + "|" + atrbCode)["signInfo"]["signType"]], x, y) } }]];
                return menu;
            }
        }
    } else {//点击设备具体属性
        if (rtdMap == null || rtdMap.get(objId + "|" + atrbCode) == null) {
            //获取不到实时数据
            // var menu = [[{ text: "历史曲线", func: function () { showHisPage(tmplId, objId, atrbCode); } }]];
            return [];
        } else {
            //data_source 0：无；1：采集量；2：计算值；3：人工置数；4：封锁；5：状态估计；
            if (rtdMap.get(objId + "|" + atrbCode)["data_source"] == null || rtdMap.get(objId + "|" + atrbCode)["data_source"] == "" || parseInt(rtdMap.get(objId + "|" + atrbCode)["data_source"]) != 4) {                
                if (rtdMap.get(objId + "|" + atrbCode)["signInfo"] == null || rtdMap.get(objId + "|" + atrbCode)["signInfo"] == "" || rtdMap.get(objId + "|" + atrbCode)["signInfo"]["signCanCtrl"] == 1) {
                    //挂牌,但允许控制
                    if (parseInt(rtdMap.get(objId + "|" + atrbCode)["atrbType"]) == IOT_ATRB_TYPE.MEASURE) {
                        var menu = [
                            [{ text: "命令下发", func: function () { genCtrlMenu(objId, atrbCode); } }],
                            [{ text: "属性封锁", func: function () { addLock(tmplId, objId, atrbCode, curStatus, rtdMap.get(objId + "|" + atrbCode), x, y); } }],
                            [{ text: "人工置数", func: function () { setValueByHand(tmplId, objId, atrbCode, curStatus, rtdMap.get(objId + "|" + atrbCode), x, y); } }],
                            [{ text: "历史曲线", func: function () { showHisPage(tmplId, objId, atrbCode); } }]];
                    } else {
                        var menu = [
                            [{ text: "命令下发", func: function () { genCtrlMenu(objId, atrbCode); } }],
                            [{ text: "属性封锁", func: function () { addLock(tmplId, objId, atrbCode, curStatus, rtdMap.get(objId + "|" + atrbCode), x, y); } }],
                            [{ text: "人工置数", func: function () { setValueByHand(tmplId, objId, atrbCode, curStatus, rtdMap.get(objId + "|" + atrbCode), x, y); } }]];
                    }
                    return menu;
                } else {
                    if (parseInt(rtdMap.get(objId + "|" + atrbCode)["atrbType"]) == IOT_ATRB_TYPE.MEASURE) {
                        var menu = [
                            [{ text: "历史曲线", func: function () { showHisPage(tmplId, objId, atrbCode); } }]];
                    } else {
                        var menu = [];
                    }
                    return menu;
                }
            } else {
                //封锁
                if (parseInt(rtdMap.get(objId + "|" + atrbCode)["atrbType"]) == IOT_ATRB_TYPE.MEASURE) {
                    var menu = [
                        [{ text: "解除封锁", func: function () { delLock(tmplId, objId, atrbCode, curStatus, rtdMap.get(objId + "|" + atrbCode), x, y); } }],
                        [{ text: "历史曲线", func: function () { showHisPage(tmplId, objId, atrbCode); } }]];
                } else {
                    var menu = [[{ text: "解除封锁", func: function () { delLock(tmplId, objId, atrbCode, curStatus, rtdMap.get(objId + "|" + atrbCode), x, y); } }]];
                }
                return menu;
            }
        }
    }
}
//显示设备画像
function showDecivePage(tmplId, objId ) {
    var myurl = VIEW_PATH + '/index.html?menuid=P15-1&' + 'tmplId=' + tmplId + '&objId=' + objId;
    window.open(myurl);    
}
//显示历史曲线
function showHisPage(tmplId, objId, atrbCode) {
    var myurl = VIEW_PATH + '/history/hisData/listForDraw.html?' + 'tmplId=' + tmplId + '&objId=' + objId + '&atrbCode=' + encodeURI(atrbCode);
    openWin2('历史曲线查看', myurl, null, 520, function () { }, function () { });
}
//设置标识牌
function addSign(tmplId, objId, posx, posy) {
    let myurl = 'ctrlToSign.html' + '?objId=' + objId + '&tmplId=' + tmplId + '&signTypeDict=' + encodeURI(JSON.stringify(signTypeDict));
    showOptOnDraw("-sign-" + objId, myurl, posx + 50, posy - 15, 250, 230);
}
//移除标识牌
function delSign(tmplId, objId, signName, posx, posy) {
    let myurl = 'ctrlToUnSign.html' + '?objId=' + objId + '&tmplId=' + tmplId + '&signName=' + encodeURI(signName);
    showOptOnDraw("-unsign-" + objId, myurl, posx + 50, posy - 15, 250, 200);
}
//封锁
function addLock(tmplId, objId, atrbCode, curStatus, atrb, posx, posy) {
    let myurl = 'ctrlToLock.html' + '?objId=' + objId + '&tmplId=' + tmplId + '&objAtrbId=' + atrb["id"] + '&status=' + curStatus + '&atrbCode=' + encodeURI(atrbCode) + '&atrbName=' + encodeURI(atrb["atrbName"]);
    showOptOnDraw("-lock-" + atrb["id"], myurl, posx + 50, posy - 15, 250, 230)
}
//解锁
function delLock(tmplId, objId, atrbCode, curStatus, atrb, posx, posy) {
    let myurl = 'ctrlToUnLock.html' + '?objId=' + objId + '&tmplId=' + tmplId + '&objAtrbId=' + atrb["id"] + '&status=' + curStatus + '&atrbCode=' + encodeURI(atrbCode) + '&atrbName=' + encodeURI(atrb["atrbName"]);
    showOptOnDraw("-unlock-" + atrb["id"], myurl, posx + 50, posy - 15, 250, 230)
}
//人工置数
function setValueByHand(tmplId, objId, atrbCode,curStatus, atrb, posx, posy) {
    let myurl = 'ctrlByHand.html' + '?objId=' + objId + '&tmplId=' + tmplId + '&objAtrbId=' + atrb["id"] + '&status=' + curStatus +'&atrbCode=' + encodeURI(atrbCode) + '&atrbName=' + encodeURI(atrb["atrbName"]);
    showOptOnDraw("-hand-" + atrb["id"], myurl, posx+50, posy-15, 250, 230)
}
//命令下发
function genCtrlMenu(objId, atrbCode) {
    if (rtdMap.get(objId + "|" + atrbCode)["signInfo"] == null || rtdMap.get(objId + "|" + atrbCode)["signInfo"] == "" || rtdMap.get(objId + "|" + atrbCode)["signInfo"].signCanCtrl == 1) {
        //无标识牌，或有标识牌但可控
        POST(layui.setter.baseUrl + 'iot-scada/ctrlPald/getCtrlType/byAtrbCode', { "objId": objId, "atrbCode": encodeURI(atrbCode) }).then((res) => {
            console.dir(res.result.status);
            if (res.result.status == "ctrl") {
                layer.msg('该设备属性未进行控制量配置！', { icon: 2, time: 3000 });
            } else if (res.result.status == "code") {
                layer.msg('该设备属性为遥信遥调属性，需配置码表！', { icon: 2, time: 3000 });
            } else if (res.result.status == "running") {
                layer.msg('当前控制已在运行，请稍后操作！', { icon: 2, time: 3000 });
            } else if (res.result.status == "1") { //控制命令下发
                var myurl = 'ctrlSendWindow.html' + '?ctrlId=' + res.result.id + '&key=' + Math.random()+ '&objId=' + objId+ '&atrbCode=' + encodeURI(atrbCode)+ '&atrbId=' + res.result.atrbId;
                openWin2('控制操作', encodeURI(myurl), 518, 440, null, null, 'rb');
            } 
        });
    } else {        
        layer.msg('该设备所挂标识牌不允许控制操作！', { icon: 2, time: 3000 });
    }

}
import request from "@/utils/request";
export function getUrl(type){
    return request({
        url:`/system/dict/data/dictType/${type}`,
        method:"get"
    })
}
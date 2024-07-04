import request from '@/utils/request'

// 查询数据缺陷 详细
export function getHlsDataBugs(id) {
  return request({
    url: '/defect/hlsDataBugs/' + id,
    method: 'get'
  })
}

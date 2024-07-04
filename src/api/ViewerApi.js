/**
 * @Author: Caven
 * @Date: 2020-05-07 19:28:33
 */

class ViewerApi {
  constructor(viewer,DC) {
    this._viewer = viewer
    this.DC = DC
  }

  get viewer() {
    return this._viewer
  }

  addBaseLayer() {
    let baidu = this.DC.ImageryLayerFactory.createAmapImageryLayer({
      style: 'img'
    })
    this._viewer.addBaseLayer(baidu)
    return this
  }
}

export default ViewerApi

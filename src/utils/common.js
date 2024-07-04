import * as THREE from "three";

// 创建文字
export const makeTextSprite = (text, color, parameters) => {
  if (parameters === undefined) parameters = {};
  var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
  var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 32;
  var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
  var borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : {r: 0, g: 0, b: 0, a: 1.0};
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  context.font = fontsize + "px " + fontface;
  var metrics = context.measureText(text);
  var textWidth = metrics.width;
  context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";
  context.lineWidth = borderThickness;
  context.fillStyle = color ? color : "#ffffff";
  context.fillText(text, borderThickness, fontsize + borderThickness);
  context.font = 48 + "px " + fontface;
  context.width = textWidth;
  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  var spriteMaterial = new THREE.SpriteMaterial({map: texture});
  var sprite = new THREE.Sprite(spriteMaterial);
  return sprite;
}

// 创建圆形文字
export const makeCycleTextSprite = (text, color = 'black', borderColor = 'white', textColor = 'white', W = 100, H = 100, borderWidth = 6) => {
  var canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  var ctx = canvas.getContext('2d');
  // ctx.fillRect(0, 0, W, H);

  ctx.beginPath();
  ctx.arc((W + borderWidth) / 2, (H + borderWidth) / 2, 40, 0, Math.PI * 2, true);
  ctx.closePath();
  // 填充背景颜色
  ctx.fillStyle = color;
  ctx.fill();
  // 填充边框颜色
  ctx.lineWidth = borderWidth;
  ctx.lineCap = 'round';
  ctx.strokeStyle = borderColor;
  ctx.stroke();
  // 填充文字颜色
  ctx.font = "30px Arial";
  ctx.fillStyle = textColor;
  // ctx.textAlign = "center";
  // var metrics = ctx.measureText(text);
  ctx.fillText(text, 20, 65);
  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  var spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: .8,
  });
  var sprite = new THREE.Sprite(spriteMaterial);
  return sprite;
}

// 创建矩形
export const makeCorld = (text, text2, color = 'red', borderColor = 'rgba(46,96,163,1)', textColor = 'white', W = 500, H = 200, borderWidth = 4) => {
  var canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  var ctx = canvas.getContext('2d');
  ctx.beginPath();
  // strokeRoundRect(ctx, 0, 0,500, 200, 30);
  // ctx.fillStyle = "rgba(8, 40, 81, 1)";
  fillRoundRect(ctx, 0, 0, 500, 200, 30, 'rgba(8, 40, 81, 1)');
  // ctx.fillRect(0, 0, W, H);
  ctx.closePath();
  // ctx.fill();

  // 填充背景颜色

  // 填充边框颜色
  ctx.lineWidth = borderWidth;
  // ctx.lineCap = 'round';
  ctx.strokeStyle = borderColor;
  ctx.stroke();
  // 填充文字颜色
  ctx.font = "30px Verdana";
  // ctx.fillStyle = textColor;
  var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
// gradient.addColorStop("0","#ccffcc");
// gradient.addColorStop("0.5","#99cccc");
// gradient.addColorStop("1.0","#ffcccc");
// Fill with gradient
// ctx.shadowColor="black";
// ctx.fillRect(20,20,100,80);
// ctx.fillStyle=gradient;

  // ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText('当日用电:', 65, 70);
  ctx.fillStyle = "#0094FF";
  // ctx.font = "30px Arial";
  ctx.fillText(text, 205, 70);

  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("等效碳排:", 65, 130);

  ctx.fillStyle = "#0094FF";
  ctx.fillText(text2, 205, 130);

  // var metrics = ctx.measureText(text);
  // ctx.fillText(text, (W + borderWidth) / 2, (H + borderWidth * 2) / 2 + metrics.fontBoundingBoxDescent + metrics.actualBoundingBoxDescent * 4);

  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  var spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: .8,
  });
  var sprite = new THREE.Sprite(spriteMaterial);
  return sprite;
}

/**该方法用来绘制一个有填充色的圆角矩形
 *@param cxt:canvas的上下文环境
 *@param x:左上角x轴坐标
 *@param y:左上角y轴坐标
 *@param width:矩形的宽度
 *@param height:矩形的高度
 *@param radius:圆的半径
 *@param fillColor:填充颜色
 **/
function fillRoundRect(cxt, x, y, width, height, radius, /*optional*/ fillColor) {
  //圆的直径必然要小于矩形的宽高
  if (2 * radius > width || 2 * radius > height) {
    return false;
  }

  cxt.save();
  cxt.translate(x, y);
  //绘制圆角矩形的各个边
  drawRoundRectPath(cxt, width, height, radius);
  cxt.fillStyle = fillColor || "#000"; //若是给定了值就用给定的值否则给予默认值
  cxt.fill();
  cxt.restore();
}

/**该方法用来绘制圆角矩形
 *@param cxt:canvas的上下文环境
 *@param x:左上角x轴坐标
 *@param y:左上角y轴坐标
 *@param width:矩形的宽度
 *@param height:矩形的高度
 *@param radius:圆的半径
 *@param lineWidth:线条粗细
 *@param strokeColor:线条颜色
 **/
function strokeRoundRect(cxt, x, y, width, height, radius, /*optional*/ lineWidth, /*optional*/ strokeColor) {
  //圆的直径必然要小于矩形的宽高
  if (2 * radius > width || 2 * radius > height) {
    return false;
  }

  cxt.save();
  cxt.translate(x, y);
  //绘制圆角矩形的各个边
  drawRoundRectPath(cxt, width, height, radius);
  cxt.lineWidth = lineWidth || 2; //若是给定了值就用给定的值否则给予默认值2
  cxt.strokeStyle = strokeColor || "#000";
  cxt.stroke();
  cxt.restore();
}

function drawRoundRectPath(cxt, width, height, radius) {
  cxt.beginPath(0);
  //从右下角顺时针绘制，弧度从0到1/2PI
  cxt.arc(width - radius, height - radius, radius, 0, Math.PI / 2);

  //矩形下边线
  cxt.lineTo(radius, height);

  //左下角圆弧，弧度从1/2PI到PI
  cxt.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);

  //矩形左边线
  cxt.lineTo(0, radius);

  //左上角圆弧，弧度从PI到3/2PI
  cxt.arc(radius, radius, radius, Math.PI, Math.PI * 3 / 2);

  //上边线
  cxt.lineTo(width - radius, 0);

  //右上角圆弧
  cxt.arc(width - radius, radius, radius, Math.PI * 3 / 2, Math.PI * 2);

  //右边线
  cxt.lineTo(width, height - radius);
  cxt.closePath();
}

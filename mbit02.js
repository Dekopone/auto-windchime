/* 
60分に一回, 自動で風鈴が鳴るプログラム
*/
var microBitBle;
var gpioPort0, gpioPort2;
var sec;
var npix;
var neoPixels = 64; // LED個数

async function connect() {

  microBitBle = await microBitBleFactory.connect();
  msg.innerHTML = "micro:bit BLE接続しました。";
  var i2cAccess = await microBitBle.requestI2CAccess();
  var i2cPort = i2cAccess.ports.get(1);
  var gpioAccess = await microBitBle.requestGPIOAccess();
  var mbGpioPorts = gpioAccess.ports;
  gpioPort0 = mbGpioPorts.get(0);
  await gpioPort0.export("out");

  // neopixelの初期化
  npix = new NEOPIXEL_I2C(i2cPort, 0x41);
  await npix.init(neoPixels);
  msg.innerHTML = "micro:bit neopixelを初期化しました。";

  // webSocketリレーの初期化
  // channel = await relay.subscribe("chirimenMbitSensors");
  // var relay = RelayServer("achex", "chirimenSocket");
  var relay = RelayServer(
      "websocket.in",
      "xcih0j9CXayDmCDEpHghnDSP4yEVyun92A3tFFyxsdmyDuOkiKwZNaWuSJ9A"
    );
    channel = await relay.subscribe("chirimenChuo");
  msg.innerText = "web socketリレーサービスに接続しました";
  channel.onmessage = getSign;
}

async function disconnect() {
  readEnable = false;
  await microBitBle.disconnect();
  msg.innerHTML = "micro:bit BLE接続を切断しました。";
}
async function getSign(sign) {
  msg.innerHTML = "Ringing chime!";
  await lightLED();
}

async function lightLED() {
  console.log("nPix:", npix);
  // await npix.setGlobal(0, 20, 20);

  var nLED = npix.N_LEDS;
  for (var i = 0; i < 27; i++) {
    var h = 300;
    var s = 1;
    var v = 1;
    var rgb = hsvToRgb(h, s, v);
    await npix.setPixel(i, rgb[0], rgb[1], rgb[2]);
  }
  await sleep(500);
  //red
  // await npix.setGlobal(10, 0, 0);
  // await sleep(1000);
  //green
  await npix.setGlobal(0, 10, 0);
  await sleep(500);
  //blue
  await npix.setGlobal(0, 0, 10);
  await sleep(500);

  //light blue
  await npix.setGlobal(0, 20, 20);
  await sleep(500);

  //purple
  await npix.setGlobal(20, 0, 20);
  await sleep(500);

  //yellow
  await npix.setGlobal(20, 20, 0);
  await sleep(500);

  //white
  await npix.setGlobal(20, 20, 20);
  await sleep(500);
  await npix.setGlobal(0, 0, 0);
}
function hsvToRgb(H, S, V) {
  //https://en.wikipedia.org/wiki/HSL_and_HSV#From_HSV

  H = H % 360;

  var C = V * S;
  var Hp = H / 60;
  var X = C * (1 - Math.abs((Hp % 2) - 1));

  var R, G, B;
  if (0 <= Hp && Hp < 1) {
    [R, G, B] = [C, X, 0];
  }
  if (1 <= Hp && Hp < 2) {
    [R, G, B] = [X, C, 0];
  }
  if (2 <= Hp && Hp < 3) {
    [R, G, B] = [0, C, X];
  }
  if (3 <= Hp && Hp < 4) {
    [R, G, B] = [0, X, C];
  }
  if (4 <= Hp && Hp < 5) {
    [R, G, B] = [X, 0, C];
  }
  if (5 <= Hp && Hp < 6) {
    [R, G, B] = [C, 0, X];
  }

  var m = V - C;
  [R, G, B] = [R + m, G + m, B + m];

  R = Math.floor(R * 255);
  G = Math.floor(G * 255);
  B = Math.floor(B * 255);

  return [R, G, B];
}


/* 
60分に一回, 自動で風鈴が鳴るプログラム
*/
var microBitBle;
var nextChime;
var readEnable;
var count = 0;
var gpioPort0, gpioPort2;
var sec;
var npix;
var neoPixels = 64; // LED個数

async function connect() {
  readEnable = true;
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
  var relay = RelayServer("achex", "chirimenSocket");
  channel = await relay.subscribe("chirimenMbitSensors");
  msg.innerText = "achex web socketリレーサービスに接続しました";
  playing();
}

async function disconnect() {
  readEnable = false;
  await microBitBle.disconnect();
  msg.innerHTML = "micro:bit BLE接続を切断しました。";
}

async function playing() {
  while (true) {
    var sensorData = await microBitBle.readSensor();
    sensorData.time = new Date().toString();
    channel.send(sensorData);

    var tp = sensorData.temperature;
    tim.innerHTML = sensorData.time;
    temp.innerHTML = tp;
    nxt.innerText = count;
    if (count == 10 && tp >= 27) {
      await ringChime();
      count = 0;
    }
    count += 1;
    await sleep(1000);
  }
}
async function ringChime() {
  lightLED();
  //10秒間モータを作動させる
  sec = 0;
  while (sec <= 10) {
    sec++;
    gpioPort0.write(1);
    await sleep(1000);
  }
  gpioPort0.write(0);
}
async function lightLED() {
  console.log("nPix:", npix);
  await npix.setGlobal(10, 0, 0);
  await sleep(300);
  await npix.setGlobal(0, 10, 0);
  await sleep(300);
  await npix.setGlobal(0, 0, 10);
  await sleep(300);
  await npix.setGlobal(0, 20, 20);
  await sleep(300);
  await npix.setGlobal(20, 0, 20);
  await sleep(300);
  await npix.setGlobal(20, 20, 0);
  await sleep(300);
  await npix.setGlobal(20, 20, 20);
  await sleep(300);
  await npix.setGlobal(0, 0, 0);
  // await sleep(300);
  // await npix.init(neoPixels);
}
function toggleLed(val) {
  // スイッチは Pull-up なので OFF で 1、LED は OFF で 0 と反転させる
  ledOnOff(val === 0 ? 1 : 0);
}

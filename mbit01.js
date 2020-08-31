/* 
60分に一回, 自動で風鈴が鳴るプログラム
*/
var microBitBle;
var nextChime;
var readEnable;
var sec = 0;
var gpioPort0, gpioPort1;
var adt7410;
var dt; // 風鈴の鳴る時間間隔(分)
var lt; // 前回風鈴がなった時刻

async function connect() {
  readEnable = true;
  microBitBle = await microBitBleFactory.connect();
  msg.innerHTML = "micro:bit BLE接続しました。";
  //  i2cアクセスを取得
  var i2cAccess = await microBitBle.requestI2CAccess();
  var i2cPort = i2cAccess.ports.get(1);
  adt7410 = new ADT7410(i2cPort, 0x48);
  await adt7410.init();
  readEnable = true;

  //  gpioアクセスを取得
  var gpioAccess = await microBitBle.requestGPIOAccess();
  var mbGpioPorts = gpioAccess.ports;
  gpioPort0 = mbGpioPorts.get(0);
  await gpioPort0.export("out");
  gpioPort1 = mbGpioPorts.get(1);
  await gpioPort1.export("out");

  // webSocketリレーの初期化
  var relay = RelayServer(
    "websocket.in",
    "xcih0j9CXayDmCDEpHghnDSP4yEVyun92A3tFFyxsdmyDuOkiKwZNaWuSJ9A"
  );
  channel = await relay.subscribe("chirimenChuo");
  msg.innerText = "web socketリレーサービスに接続しました";
  await sleep(3000);
  msg.innerText = "";
  // channel.onmessage = getMessage;
  set();
}
async function disconnect() {
  readEnable = false;
  await microBitBle.disconnect();
  msg.innerHTML = "micro:bit BLE接続を切断しました。";
}

async function set() {
  dt = delta.value;
  dl.innerHTML = dt;
  console.log("delta time:", dt);
  playing();
}

async function playing() {
  var start = new Date();
  printNextTime();
  while (readEnable) {
    if (sec % 5 == 0) {
      var tp = await adt7410.read();
      temp.innerHTML = Math.round(tp);
    }
    var time = new Date();
    tim.innerHTML =
      time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
    if (sec / 60 == dt && tp >= 25) {
      await ringChime();
      printNextTime();
    } else if (sec >= 60) {
      sec %= 60;
      printNextTime();
    }
    sec += 1;
    console.log(sec);
    await sleep(1000);
  }
}
function printNextTime() {
  start = new Date();
  var min = start.getMinutes() + Number(dt);
  var ho = start.getHours();
  var second = start.getSeconds();
  if (min >= 60) {
    min = min % 60;
    ho++;
    if (ho >= 24) {
      ho = ho % 24;
    }
  }
  sec = 0;
  nxt.innerHTML = ho + ":" + min + ":" + second;
}
async function ringChime() {
  //5秒間モータを作動させる
  message.innerHTML = '<img src="images/icon_furin.png">';
  console.log("ringing a chime");
  count = 0;
  channel.send("1");
  while (count <= 10) {
    count++;
    gpioPort0.write(1);
    gpioPort1.write(0);
    await sleep(1000);
  }
  gpioPort0.write(0);
  message.innerHTML = "     ";
}

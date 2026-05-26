const audio = new Audio('../audio/bg.mp3');
audio.loop = true;
audio.play();

function onButton1() {
  console.log('Entered menu');
}

function onButton2() {
  console.log('Entered settings');
}

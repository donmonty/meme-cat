const images = require("../content")

function getRandomPick(list) {
  return Math.floor(Math.random() * list.length);
}

function selectContent() {
  const contentIndex = getRandomPick(images);
  const pick = images[contentIndex];
  //console.log("//// SONG NAME: ", pick.name);
  return pick;
}

module.exports = selectContent;
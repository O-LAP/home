


var $jsTgt = $("#jsTgt");


async function openAfterAppend() {
  while (typeof Design == 'undefined') {
    await sleep(5);
  }
  OLAP.openDesign(Design);
}


async function loadDesignFromURL(designJSUrl) {
  var designJS = await jQuery.get(designJSUrl);
  var script = `<script type="text/javascript">${designJS}</script>`
  $jsTgt.append(script);
  openAfterAppend();
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function loadLatestDesignFromGithub() {
  var url = new URL(window.location.href);
  var gitAuthor = url.searchParams.get("a");
  var gitRepo = url.searchParams.get("r");
  var designJSUrl = `https://gitcdn.xyz/repo/${gitAuthor}/${gitRepo}/master/design/Design.js`;
  loadDesignFromURL(designJSUrl);
}


loadLatestDesignFromGithub();



var $jsTgt = $("#jsTgt");


async function openAfterAppend(gitAuthor, gitRepo) {
  while (typeof Design == 'undefined') {
    await sleep(5);
  }
  OLAP.openDesign(Design, gitAuthor, gitRepo);
}


async function loadDesignFromURL(designJSUrl) {
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function loadLatestDesignFromGithub() {
  var url = new URL(window.location.href);
  var gitAuthor = url.searchParams.get("a");
  var gitRepo = url.searchParams.get("r");
  var designJSUrl = `https://gitcdn.xyz/repo/${gitAuthor}/${gitRepo}/master/design/Design.js`;
  var designJS = await jQuery.get(designJSUrl);
  var script = `<script type="text/javascript">${designJS}</script>`
  $jsTgt.append(script);
  openAfterAppend(gitAuthor, gitRepo);
}


loadLatestDesignFromGithub();
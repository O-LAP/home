document.addEventListener('DOMContentLoaded', function(event) {
	run();
})



async function reloadolap() {

  if (typeof OLAP !== "undefined") {
    delete OLAP;
  }

  let OLAP_FW_SRC_URL = '/olap/js/OLAPFramework.js';
  let olapFwRsrc = await $.get(OLAP_FW_SRC_URL);
  eval.apply(window, [olapFwRsrc]);
}


async function reloaddesign() {

  if (typeof Design !== "undefined") {
    OLAP.clearDesign();
    delete Design;
  }

  let dsSrcFmTxtBox = await getDsSrcFmInpBox();
  // http://localhost:3000/?design-source=./Plato.js
  let dsSrcFmUrlDrct = await getDsSrcFmUrlDirect();
  // http://localhost:3000/app.html?a=amitlzkpa&r=o-lap_plato
  let dsSrcFmUrlGithub = await getDsSrcFmUrlGithub();

  let OLAP_DESIGN_SRC_URL = dsSrcFmTxtBox || dsSrcFmUrlDrct || dsSrcFmUrlGithub || '/Design.js';
  $('#design-source').val(OLAP_DESIGN_SRC_URL);
  let olapDsRsrc = await $.get(OLAP_DESIGN_SRC_URL);
  eval.apply(window, [olapDsRsrc]);

  if (dsSrcFmUrlGithub) {
    let url = new URL(window.location.href);
    let gitAuthor = url.searchParams.get("a") || null;
    let gitRepo = url.searchParams.get("r") || null;

    OLAP.openDesign(Design, gitAuthor, gitRepo);
  } else {
    OLAP.openDesign(Design);
  }

}


async function getDsSrcFmUrlGithub() {
  try {
    let url = new URL(window.location.href);
    let gitAuthor = url.searchParams.get("a");
    let gitRepo = url.searchParams.get("r");
    if (gitAuthor == null || gitRepo == null) return null;
    let designJSUrl = `https://raw.githubusercontent.com/${gitAuthor}/${gitRepo}/master/design/Design.js`;
    return designJSUrl;
  } catch(err) {
    return null;
  }
}


async function getDsSrcFmUrlDirect() {
  try {
    let url = new URL(window.location.href);
    let val = url.searchParams.get("design-source");
    return (val === '') ? null : val;
  } catch(err) {
    return null;
  }
}


async function getDsSrcFmInpBox() {
  try {
    let val = $('#design-source').val();
    return (val === '') ? null : val;
  } catch(err) {
    return null;
  }
}



async function run() {

  await reloadolap();

  await reloaddesign();

  $("#reload-design").on('click', function(event) {
    event.preventDefault();
    reloaddesign();
  });

}





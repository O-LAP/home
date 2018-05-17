


var $gall = $("#gall");
var $jsSandBox = $("#jsSandBox");


async function loadAllDesigns() {
	$gall.empty();
	for (var i = 0; i < OLAP_DesignCollection.length; i++) {
		await loadData(OLAP_DesignCollection[i]);
	}

};


async function loadData(gitUrl) {
	var gitAuth = gitUrl.split('/')[3];
	var gitRepo = gitUrl.split('/')[4];
	var displayImageUrl = `https://raw.githubusercontent.com/${gitAuth}/${gitRepo}/master/design/display.jpg`;
	var designUrl = `https://gitcdn.xyz/repo/${gitAuth}/${gitRepo}/master/design/Design.js`;
	await addDesignAsync(designUrl, gitAuth, gitRepo, displayImageUrl);
}


async function addDesignAsync(designUrl, gitAuth, gitRepo, displayImageUrl) {
	var design = await dlAndGetDesign(designUrl);
	var infoJson = design.info;
	Design = null;
	var cardHtml = 	`
					<div class="col l4 m6 s12">
						<a href="./app.html?a=${gitAuth}&r=${gitRepo}">
					        <div class="card">
								<div class="card-image">
									<img src="${displayImageUrl}">
									<span class="card-title black-text">
									<big>${name}</big>
									</br>
									<small>${infoJson["version"]}</small>
									</span>
								</div>
								<div class="card-content grey-text">
									<p>${infoJson["short_desc"]}</p>
									<p>${infoJson["designer"]}</p>
								</div>
					        </div>
				        </a>
				    </div>
					`;
	$gall.append(cardHtml);
}


async function dlAndGetDesign(designUrl) {
	var designJS = await jQuery.get(designUrl);
	var script = `<script type="text/javascript">${designJS}</script>`;
	$jsSandBox.append(script);
	while (typeof Design == 'undefined') {
		await sleep(5);
	}
	return Design;
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


loadAllDesigns();
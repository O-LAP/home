
function hasMethod(objToChk, methodName) {
	return objToChk && typeof objToChk[methodName] === "function";
}

function hasProperty(objToChk, propertyName) {
	return objToChk && typeof objToChk[propertyName] === "object";
}



class Slice {

	constructor(center, normal, name) {
		if (normal.x == 0 && normal.y == 0 && normal.z == 0) {
			throw "Normal can't be zero for a slice.";
		}
		this.name = name;
		this.center = center;
		this.normal = normal.normalize();
		this.plane = new THREE.Plane();
		this.plane.setFromNormalAndCoplanarPoint(this.normal, this.center).normalize();
		this.planeGeometry = new THREE.PlaneGeometry(10000, 10000);
		this.focalPoint = new THREE.Vector3().copy(this.plane.coplanarPoint(new THREE.Vector3())).add(this.plane.normal);
		this.planeGeometry.lookAt(this.focalPoint);
		this.planeMaterial = new THREE.MeshBasicMaterial({color: 0xeeeeee, side: THREE.DoubleSide, transparent: true, opacity: 0.2});
		this.dispPlane = new THREE.Mesh(this.planeGeometry, this.planeMaterial);
		this.dispPlane.position.set(this.center.x, this.center.y, this.center.z);
		this.debugViz = new THREE.PlaneHelper( this.plane, 50, 0xaaaaaa );
		this.debugCenter = new THREE.Mesh( new THREE.SphereGeometry( 12, 8, 8 ), new THREE.MeshBasicMaterial( {color: 0xff00ff, transparent: true, opacity: 0.5} ) );
		this.debugCenter.position.set(this.center.x, this.center.y, this.center.z);
		this.boundaryLines = new THREE.Object3D();
		this.grooveLines = new THREE.Object3D();
	}

	cutBoundaryLines(geom) {
		let m = [];
		OLAP.getAllMeshes(geom, m);

		let boundaryCuts = new THREE.Object3D();
		let lineMat = new THREE.LineBasicMaterial({ color: 0x000000 });
		let lineGeom;
		for (let i = 0; i < m.length; i++) {
			if(typeof m[i].dontslice == 'boolean' && m[i].dontslice) continue;
	        let intersects = new MODE.planeIntersect(m[i].geometry, this.plane);
	        let intersectingLineObjs = intersects.wireframe(lineMat);
	        let flattenedLines = [];
	        OLAP.getAllLines(intersectingLineObjs, flattenedLines);
	        let verts = [];
	        for(let j=0; j<flattenedLines.length; j++) {
	        	verts = flattenedLines[j].geometry.vertices;
	        	lineGeom = new THREE.Geometry();
	        	for (let j = 0; j < verts.length; j++) {
	        		lineGeom.vertices.push(intersectingLineObjs.localToWorld(verts[j]));
	        	}
	        	let ln = new THREE.Line(lineGeom, lineMat);
	        	boundaryCuts.add(ln);
	        }
		}
		this.boundaryLines = boundaryCuts;
	}

	cutGrooveLines(otherSliceSet) {
		let g = new THREE.Group();
		for (let i = 0; i < otherSliceSet.slices.length; i++) {
			let otherSlice = otherSliceSet.slices[i];
			if(this.name.includes("U")) {
				let projSrc = new THREE.Vector3(-this.center.x, 2000, otherSlice.center.z);
				let projDir = new THREE.Vector3(0, -1, 0);
				let lns = this.boundaryLines.children;
				let raycaster = new THREE.Raycaster(projSrc, projDir);
				raycaster.linePrecision = 0.05;
				let intersections = raycaster.intersectObjects( lns, true );
				if(intersections.length < 2) {
					continue;
				}
				let topPt = intersections[0].point;
				let botPt = intersections[1].point;
				let midPt = new THREE.Vector3((topPt.x+botPt.x)/2, (topPt.y+botPt.y)/2, (topPt.z+botPt.z)/2);
				let linMat = new THREE.LineBasicMaterial({ color: 0xff0000 });
				let linGeom = new THREE.Geometry();
				linGeom.vertices.push( topPt, midPt );
				g.add(new THREE.Line( linGeom, linMat ));
			}
			else {
				let projSrc = new THREE.Vector3(-otherSlice.center.x, -2000, this.center.z);
				let projDir = new THREE.Vector3(0, 1, 0);
				let lns = this.boundaryLines.children;
				let raycaster = new THREE.Raycaster(projSrc, projDir);
				raycaster.linePrecision = 0.05;
				let intersections = raycaster.intersectObjects( lns, true );
				if(intersections.length < 2) {
					continue;
				}
				let topPt = intersections[0].point;
				let botPt = intersections[1].point;
				let midPt = new THREE.Vector3((topPt.x+botPt.x)/2, (topPt.y+botPt.y)/2, (topPt.z+botPt.z)/2);
				let linMat = new THREE.LineBasicMaterial({ color: 0x0000ff });
				let linGeom = new THREE.Geometry();
				linGeom.vertices.push( topPt, midPt );
				g.add(new THREE.Line( linGeom, linMat ));
			}
		}
		let grooveCuts = new THREE.Object3D();
		grooveCuts.add(g);
		this.grooveLines = grooveCuts;
	}

	getSliceObject() {
		let retObj = new THREE.Object3D();
		retObj.add(this.boundaryLines);
		retObj.add(this.grooveLines);
		return retObj;
	}

}



class SliceSet {
	constructor(config, debug=false) {
		if(config.uDir) {
			this.start = new THREE.Vector3(config.start, 0, 0);
			this.end = new THREE.Vector3(config.end, 0, 0);
		}
		else {
			this.start = new THREE.Vector3(0, 0, config.start);
			this.end = new THREE.Vector3(0, 0, config.end);
		}
		// any slicer will have at least 2 slices; start and end
		this.cuts = (config.cuts < 2) ? 1 : config.cuts-1;
		this.debug = debug;

		this.name = (config.uDir) ? "U" : "V";

		this.cutsDir = new THREE.Vector3();
		this.cutsDir.subVectors( this.end, this.start ).normalize();

		let dist = this.end.distanceTo(this.start);
		let offset = dist / this.cuts;

		this.slices = [];
		for (let i = 0; i <= this.cuts; i++) {
			let dir = this.cutsDir.clone().normalize();
			dir.multiplyScalar(i * offset);
			let pos = this.start.clone();
			pos.add(dir);
			this.slices.push(new Slice(pos, this.cutsDir, this.name+i));
		}

	}


	getAllSlices(geom, otherSliceSet) {

		let retObj = new THREE.Object3D();
		for (let i = 0; i < this.slices.length; i++) {
			let s = this.slices[i];
			s.cutBoundaryLines(geom);
			s.cutGrooveLines(otherSliceSet);
			// retObj.add(s.dispPlane);
			// retObj.add(s.debugViz);
			retObj.add(s.getSliceObject());
		}

		return retObj;
	}

}




class SliceManager {
	constructor() {
		this.sliceSetU = null;
		this.sliceSetV = null;
	}

	addSliceSet(config) {
		if(config.uDir === 'undefined' || typeof config.uDir !== 'boolean') {
			console.log("Error with 'uDir' in slice-set config."); return;
		}
		if(config.start === 'undefined' || typeof config.start !== 'number') {
			console.log("Error with 'start' in slice-set config."); return;
		}
		if(config.end === 'undefined' || typeof config.end !== 'number') {
			console.log("Error with 'end' in slice-set config."); return;
		}
		if(config.cuts === 'undefined' || typeof config.cuts !== 'number') {
			console.log("Error with 'cuts' in slice-set config."); return;
		}
		if (config.uDir) this.sliceSetU = new SliceSet(config, true);
		else this.sliceSetV = new SliceSet(config, true);
	}

	getAllSlicesFromSet(geom) {
		let retObj = new THREE.Object3D();
		if(this.sliceSetU != null) retObj.add(this.sliceSetU.getAllSlices(geom, this.sliceSetV));
		if(this.sliceSetV != null) retObj.add(this.sliceSetV.getAllSlices(geom, this.sliceSetU));
		return retObj;
	}
}



class OLAPFramework {


	getAllLines(geom, addTo) {
		if (geom.type == "Line") addTo.push(geom);
		if(geom.children.length == 0) {
			return;
		}
		else {
			for (let i = 0; i < geom.children.length; i++) {
				this.getAllLines(geom.children[i], addTo);
			}
		}
	}

	getAllMeshes(geom, addTo) {
		if (geom.type == "Mesh") addTo.push(geom);
		if(geom.children.length == 0) {
			return;
		}
		else {
			for (let i = 0; i < geom.children.length; i++) {
				this.getAllMeshes(geom.children[i], addTo);
			}
		}
	}

	async checkMessage() {
		var url = "https://gitcdn.xyz/repo/O-LAP/home/master/olap/js/info.json";
		var infoJSON = await $.getJSON(url);
		if(this.version != infoJSON.latest_version) {
			console.log(`${infoJSON.latest_version} is available. Consider upgrading the framework.`);
		}
		if(infoJSON.message != "") console.log(infoJSON.message);
	}

	async downloadHumans() {
		let url, model, objLoader;
		url = "https://raw.githubusercontent.com/O-LAP/home/master/olap/files/denace.obj";
		model = await $.get(url);
		objLoader = new THREE.OBJLoader();
		objLoader.setPath(url);
	    objLoader.load(model, function (object) {
		    object.traverse( function ( child ) {
		        if ( child instanceof THREE.Mesh ) {
		            child.material = new THREE.MeshPhongMaterial( { side: THREE.DoubleSide, color: 0xBEBEBE, transparent: true, opacity: 0.3, shininess: 0.1, specular: 0x000000 } );
		        }
		    });
			OLAP.maleModel = new THREE.Object3D();
	    	OLAP.maleModel.add(object);
	    });
		url = "https://raw.githubusercontent.com/O-LAP/home/master/olap/files/bianca.obj";
		model = await $.get(url);
		objLoader = new THREE.OBJLoader();
		objLoader.setPath(url);
	    objLoader.load(model, function (object) {
		    object.traverse( function ( child ) {
		        if ( child instanceof THREE.Mesh ) {
		            child.material = new THREE.MeshPhongMaterial( { side: THREE.DoubleSide, color: 0xBEBEBE, transparent: true, opacity: 0.3, shininess: 0.1, specular: 0x000000 } );
		        }
		    });
			OLAP.femaleModel = new THREE.Object3D();
	    	OLAP.femaleModel.add(object);
	    });
	    OLAP.activeHumanGeom = new THREE.Object3D();
    	OLAP.activeHumanGeom.add(OLAP.maleModel);
	}

	updateHuman(isSeen) {
		this.scene.remove(this.activeHumanGeom);
	    this.activeHumanGeom = new THREE.Object3D();
		if(this.showGirl) {
	    	this.activeHumanGeom.add(this.femaleModel);
		}
		else {
	    	this.activeHumanGeom.add(this.maleModel);
		}
		if(this.showHumans) {
			this.scene.add(this.activeHumanGeom);
			let geomBB = new THREE.Box3();
			geomBB.expandByObject(this.geometry);
			let posV = new THREE.Vector3(geomBB.min.x, 0, geomBB.min.z);
			let offset = posV.clone().normalize().multiplyScalar(300);
			posV.add(offset);
			this.activeHumanGeom.position.set(posV.x, posV.y, posV.z);
		}
	}

	export() {
		let exporter = new THREE.OBJExporter();
		let exp = new THREE.Object3D();
		let g = OLAP.geometry.clone();
		exp.add(g);
		if (OLAP.showSec) exp.add(OLAP.sliceManager.getAllSlicesFromSet(g));
        let result = exporter.parse( exp );
        let file = new File([result], `olap_${this.loadedDesign.info.name}.obj`, {type: "text/plain"});
        saveAs(file);
	}

	constructor() {
		this.version = "1.0.0";
		this.scene = scene;
		this.inputs = {};
		this.$ui = $("#ui");
		this.$name = $("#design-name");
		this.$designer = $("#designer");
		this.$designmessage = $("#design-message");
		this.$version = $("#version");
		this.$license = $("#license");
		this.$short_desc = $("#short-desc");
		$("#download").on('click', function() {
			OLAP.export();
		});
		this.loadedDesign = null;
		this.inputVals = {};
		this.geometry = new THREE.Object3D();
		this.bounds = new THREE.Object3D();
		this.slices = new THREE.Object3D();
		this.sliceManager = new SliceManager();
		this.showSec = false;
		this.maleModel = new THREE.Object3D();
		this.femaleModel = new THREE.Object3D();
		this.activeHumanGeom = new THREE.Object3D();
		this.showHumans = false;
		this.showGirl = false;
		this.downloadHumans();

	    $('#rotate-switch').on('change', function(e) {
	      let isRot = $(this).is(':checked');
	      cameraControls.autoRotate = isRot;
	    });
	    $('#sections-switch').on('change', function(e) {
	      OLAP.showSec = $(this).is(':checked');
	      OLAP.updateGeom();
	    });
	    $('#human-switch').on('change', function(e) {
	    	OLAP.showHumans = $(this).is(':checked');
	    	OLAP.updateHuman();
	    });
	    $('#gender-switch').on('change', function(e) {
	    	OLAP.showGirl = ($(this).is(':checked'));
			OLAP.updateHuman();
	    });
	}

	openDesign(designObj) {

		this.checkMessage();

		if(!hasProperty(designObj, "info")) {
			console.log("Design file needs property 'info' containing design information.");
			console.log("Aborting design open.");
			return;
		}
		if(!hasProperty(designObj, "inputs")) {
			console.log("Design file needs property 'inputs' containing design inputs configuration.");
			console.log("Aborting design open.");
			return;
		}
		if(!hasProperty(designObj, "inputState")) {
			console.log("Design file needs property 'inputState' to pass down input values.");
			console.log("Aborting design open.");
			return;
		}
		if(!hasMethod(designObj, "init")) {
			console.log("Design file needs to implement 'init' method to initialize state.");
			console.log("Aborting design open.");
			return;
		}
		if(!hasMethod(designObj, "onParamChange")) {
			console.log("Design file needs to implement 'onParamChange' method to recieve updated parameter values.");
			console.log("Aborting design open.");
			return;
		}
		if(!hasMethod(designObj, "updateGeom")) {
			console.log("Design file needs to implement 'updateGeom' method to trigger design regeneration.");
			console.log("Aborting design open.");
			return;
		}

		this.clearUI();
		this.clearGeometry();
		this.loadedDesign = designObj;
		this.loadedDesign.init();
		this.loadUI();
		this.updateGeom();
	}

	clearUI() {
		this.$ui.empty();
	}

	clearGeometry() {
		if (this.geometry == null) return;
		scene.remove(this.geometry);
		this.geometry = null;
		scene.remove(this.slices);
		this.slices = null;
	}

	loadUI() {
		var params = this.loadedDesign.inputs;
		this.$name.text(this.loadedDesign.info.name);
		this.$designer.text(this.loadedDesign.info.designer);
		this.$designmessage.text(this.loadedDesign.info.message);
		this.$version.text(this.loadedDesign.info.version);
		this.$license.text(this.loadedDesign.info.license);
		this.$short_desc.text(this.loadedDesign.info.short_desc);
		for (let param in params) {
			this.inputVals[param] = this.loadedDesign.inputs[param].default;	// put the default value into curr state
			this.addUIItem(this.loadedDesign.inputs[param], param);				// add the ui item
			this.$ui.append('<div class="divider"></div>');
		}
	}

	updateGeom() {
		this.scene.remove(this.geometry);
		this.scene.remove(this.slices);
		this.geometry = new THREE.Object3D();
		this.bounds = new THREE.Object3D();
		var inpStateCopy = {};													// make a copy of input state to pass it to design object
		for(var key in this.inputVals) {
		    var value = this.inputVals[key];
		    inpStateCopy[key] = value;
		}
		this.loadedDesign.inputState = inpStateCopy;
		this.loadedDesign.onParamChange(inpStateCopy);
		this.sliceManager = new SliceManager();
		this.loadedDesign.updateGeom(this.geometry, this.sliceManager)
		this.scene.add(this.geometry);
		if(this.showSec) {
			this.slices = this.sliceManager.getAllSlicesFromSet(this.geometry);
			this.scene.add(this.slices);
		}
	}

	addUIItem(inpConfig, id) {
		if (typeof inpConfig === 'undefined' || typeof inpConfig.type === 'undefined') {
			console.log("Foll registered input doesn't have config: " + id + cnt);
			return;
		}
		let tipTxt = "";
		switch(inpConfig.type) {
			case "select":
				tipTxt = (typeof inpConfig.tip !== 'undefined') ? `<span class="grey-text">${inpConfig.tip}</span></br>` : "";
				var html = `<div class="input-field" id="${id}"><select>\n`;
				for(let s of inpConfig.choices) { html += `<option value="${s}">${s}</option>\n`; }
				html += `</select><label>${inpConfig.label}</label></div>\n${tipTxt}\n`;
				var p = this.$ui.append(html);
				$('select').formSelect();										// materilize initialization
				var fw = this;													// cache ref to framework for passing it to the event listening registration
				p.find('#' + id).on('change',function(e){
					fw.inputVals[id] = $('#'+id + ' :selected').text();			// update curr state
					fw.updateGeom();											// trigger an update
				});
				break;
			case "slider":
				tipTxt = (typeof inpConfig.tip !== 'undefined') ? `<span class="grey-text">${inpConfig.tip}</span></br>` : "";
				var html = `
						    <div class="range-field">
							  <p>${inpConfig.label}</p>
							  <span class="left">${inpConfig.min}</span>
							  <span class="right">${inpConfig.max}</span>
						      <input type="range" min="${inpConfig.min}" max="${inpConfig.max}" id="${id}" />
							  ${tipTxt}
						    </div>
							`;
				var q = this.$ui.append(html);
				var fw = this;													// cache ref to framework for passing it to the event listening registration
				q.find('#' + id).on('input',function(e){
					fw.inputVals[id] = $(this).val();							// update curr state
					fw.updateGeom();											// trigger an update
				});
				break;
			case "bool":
				tipTxt = (typeof inpConfig.tip !== 'undefined') ? `<span class="grey-text">${inpConfig.tip}</span></br>` : "";
				var html = `
						    <p>
						      <label>
						        <input type='checkbox' id="${id}"/>
						        <span>${inpConfig.label}</span>
						      </label></br>
							  ${tipTxt}
						    </p>
						    `;
				var r = this.$ui.append(html);
				var fw = this;													// cache ref to framework for passing it to the event listening registration
				r.find("#" + id).on('change',function(e){
					fw.inputVals[id] = $(this).is(":checked");					// update curr state
					fw.updateGeom();											// trigger an update
				});
				break;
		}
	}

}


var OLAP = new OLAPFramework();


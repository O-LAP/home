function rotPointAroundCentre(point, center, axis, theta) {
  point.sub(center);
  point.applyAxisAngle(axis, theta);
  point.add(center);
  let obj = new THREE.Mesh(
    new THREE.SphereGeometry(12, 8, 8),
    new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5,
    })
  );
  obj.position.set(point.x, point.y, point.z);
  obj.rotateOnAxis(axis, theta);
  return obj.position;
}

async function wait(ms) {
  console.log(`Waiting for ${ms} seconds...`);
  return new Promise((resolve, reject) => setTimeout(() => resolve(), ms));
}

//------------------------------------

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
    this.plane
      .setFromNormalAndCoplanarPoint(this.normal, this.center)
      .normalize();
    this.planeGeometry = new THREE.PlaneGeometry(10000, 10000);
    this.focalPoint = new THREE.Vector3()
      .copy(this.plane.coplanarPoint(new THREE.Vector3()))
      .add(this.plane.normal);
    this.planeGeometry.lookAt(this.focalPoint);
    this.planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xeeeeee,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    });
    this.dispPlane = new THREE.Mesh(this.planeGeometry, this.planeMaterial);
    this.dispPlane.position.set(this.center.x, this.center.y, this.center.z);
    this.debugViz = new THREE.PlaneHelper(this.plane, 50, 0xaaaaaa);
    this.debugCenter = new THREE.Mesh(
      new THREE.SphereGeometry(12, 8, 8),
      new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        transparent: true,
        opacity: 0.5,
      })
    );
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
      if (typeof m[i].dontslice == "boolean" && m[i].dontslice) continue;
      let intersects = new MODE.planeIntersect(m[i].geometry, this.plane);
      let intersectingLineObjs = intersects.wireframe(lineMat);
      let flattenedLines = [];
      OLAP.getAllLines(intersectingLineObjs, flattenedLines);
      let verts = [];
      for (let j = 0; j < flattenedLines.length; j++) {
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
      if (this.name.includes("U")) {
        let projSrc = new THREE.Vector3(
          -this.center.x,
          2000,
          otherSlice.center.z
        );
        let projDir = new THREE.Vector3(0, -1, 0);
        let lns = this.boundaryLines.children;
        let raycaster = new THREE.Raycaster(projSrc, projDir);
        raycaster.linePrecision = 0.05;
        let intersections = raycaster.intersectObjects(lns, true);
        if (intersections.length < 2) {
          continue;
        }
        let topPt = intersections[0].point;
        let botPt = intersections[1].point;
        let midPt = new THREE.Vector3(
          (topPt.x + botPt.x) / 2,
          (topPt.y + botPt.y) / 2,
          (topPt.z + botPt.z) / 2
        );
        let linMat = new THREE.LineBasicMaterial({ color: 0xff0000 });
        let linGeom = new THREE.Geometry();
        linGeom.vertices.push(topPt, midPt);
        g.add(new THREE.Line(linGeom, linMat));
      } else {
        let projSrc = new THREE.Vector3(
          -otherSlice.center.x,
          -2000,
          this.center.z
        );
        let projDir = new THREE.Vector3(0, 1, 0);
        let lns = this.boundaryLines.children;
        let raycaster = new THREE.Raycaster(projSrc, projDir);
        raycaster.linePrecision = 0.05;
        let intersections = raycaster.intersectObjects(lns, true);
        if (intersections.length < 2) {
          continue;
        }
        let topPt = intersections[0].point;
        let botPt = intersections[1].point;
        let midPt = new THREE.Vector3(
          (topPt.x + botPt.x) / 2,
          (topPt.y + botPt.y) / 2,
          (topPt.z + botPt.z) / 2
        );
        let linMat = new THREE.LineBasicMaterial({ color: 0x0000ff });
        let linGeom = new THREE.Geometry();
        linGeom.vertices.push(topPt, midPt);
        g.add(new THREE.Line(linGeom, linMat));
      }
    }
    let grooveCuts = new THREE.Object3D();
    grooveCuts.add(g);
    this.grooveLines = grooveCuts;
  }

  getInPosSliceObject() {
    let retObj = new THREE.Object3D();
    retObj.add(this.boundaryLines);
    retObj.add(this.grooveLines);
    return retObj;
  }

  // apply same rotation transformation to plane centre point as the plane to calculate the offset from ground plane
  // and use the calculated Y value to offset the cutlines along the Y axis to get all cutlines on the ground plane
  getFlattenedSliceObject() {
    let rotPt = this.center.clone();
    if (this.name.includes("U")) {
      rotPt = rotPointAroundCentre(
        rotPt,
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1, 0, 0),
        -Math.PI / 2
      );
      rotPt = rotPointAroundCentre(
        rotPt,
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 1),
        -Math.PI / 2
      );
    } else {
      rotPt = rotPointAroundCentre(
        rotPt,
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 1),
        -Math.PI / 2
      );
      rotPt = rotPointAroundCentre(
        rotPt,
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1, 0, 0),
        -Math.PI / 2
      );
    }
    let retObj = new THREE.Object3D();
    let flatBoundaryLines = this.boundaryLines.clone();
    let flatGrooveLines = this.grooveLines.clone();
    if (this.name.includes("U")) {
      flatBoundaryLines.position.y -= rotPt.y;
      flatBoundaryLines.rotation.x = -Math.PI / 2;
      flatBoundaryLines.rotation.y = -Math.PI / 2;
      flatGrooveLines.position.y -= rotPt.y;
      flatGrooveLines.rotation.x = -Math.PI / 2;
      flatGrooveLines.rotation.y = -Math.PI / 2;
    } else {
      flatBoundaryLines.position.y -= rotPt.y;
      flatBoundaryLines.rotation.x = -Math.PI / 2;
      // flatBoundaryLines.rotation.z = Math.PI/2;
      flatGrooveLines.position.y -= rotPt.y;
      flatGrooveLines.rotation.x = -Math.PI / 2;
      // flatGrooveLines.rotation.z = Math.PI/2;
    }
    retObj.add(flatBoundaryLines);
    retObj.add(flatGrooveLines);
    return retObj;
  }
}

class SliceSet {
  constructor(config) {
    if (config.uDir) {
      this.start = new THREE.Vector3(config.start, 0, 0);
      this.end = new THREE.Vector3(config.end, 0, 0);
    } else {
      this.start = new THREE.Vector3(0, 0, config.start);
      this.end = new THREE.Vector3(0, 0, config.end);
    }
    // any slicer will have at least 2 slices; start and end
    this.cuts = config.cuts < 2 ? 1 : config.cuts - 1;
    this.debug = false;

    this.name = config.uDir ? "U" : "V";

    this.cutsDir = new THREE.Vector3();
    this.cutsDir.subVectors(this.end, this.start).normalize();

    let dist = this.end.distanceTo(this.start);
    let offset = dist / this.cuts;

    this.slices = [];
    for (let i = 0; i <= this.cuts; i++) {
      let dir = this.cutsDir.clone().normalize();
      dir.multiplyScalar(i * offset);
      let pos = this.start.clone();
      pos.add(dir);
      this.slices.push(new Slice(pos, this.cutsDir, this.name + i));
    }
  }

  getAllInPosSlices(geom, otherSliceSet) {
    let retObj = new THREE.Object3D();
    for (let i = 0; i < this.slices.length; i++) {
      let s = this.slices[i];
      s.cutBoundaryLines(geom);
      s.cutGrooveLines(otherSliceSet);
      if (this.debug) {
        retObj.add(s.dispPlane);
        retObj.add(s.debugViz);
      }
      retObj.add(s.getInPosSliceObject());
    }
    return retObj;
  }

  getAllFlattenedSlices(geom, otherSliceSet) {
    let retObj = new THREE.Object3D();
    let thisSliceSetName = this.name;
    for (let i = 0; i < this.slices.length; i++) {
      let labelTxt = `${thisSliceSetName}_${i}`;

      let s = this.slices[i];
      s.cutBoundaryLines(geom);
      s.cutGrooveLines(otherSliceSet);
      if (this.debug) {
        retObj.add(s.dispPlane);
        retObj.add(s.debugViz);
      }
      let flattenedSliceObj = s.getFlattenedSliceObject();

      let txtLblMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      let textGeo = new THREE.TextGeometry(labelTxt, {
        font: OLAP.font,
        size: 40,
        height: 0,
      });
      textGeo = new THREE.BufferGeometry().fromGeometry(textGeo);
      let textMesh = new THREE.Mesh(textGeo, txtLblMat);
      textMesh.rotation.x = -Math.PI / 2;
      // textMesh.position.x = i * 1000;
      // textMesh.position.y = -140;
      textMesh.position.z = -140;
      // if (this.name.includes("V")) textMesh.position.z = 1000;
      flattenedSliceObj.add(textMesh);

      flattenedSliceObj.position.x = i * 1000;
      if (this.name.includes("V")) flattenedSliceObj.position.z = 1000;
      flattenedSliceObj.userData.label = labelTxt;

      retObj.add(flattenedSliceObj);
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
    if (config.uDir === "undefined" || typeof config.uDir !== "boolean") {
      console.log("Error with 'uDir' in slice-set config.");
      return;
    }
    if (config.start === "undefined" || typeof config.start !== "number") {
      console.log("Error with 'start' in slice-set config.");
      return;
    }
    if (config.end === "undefined" || typeof config.end !== "number") {
      console.log("Error with 'end' in slice-set config.");
      return;
    }
    if (config.cuts === "undefined" || typeof config.cuts !== "number") {
      console.log("Error with 'cuts' in slice-set config.");
      return;
    }
    if (config.uDir) this.sliceSetU = new SliceSet(config);
    else this.sliceSetV = new SliceSet(config);
  }

  getAllSlicesFromSet(geom) {
    let retObj = new THREE.Object3D();
    let inPosSlices = new THREE.Object3D();
    let flatSlices = new THREE.Object3D();
    if (this.sliceSetU != null) {
      inPosSlices.add(this.sliceSetU.getAllInPosSlices(geom, this.sliceSetV));
      flatSlices.add(
        this.sliceSetU.getAllFlattenedSlices(geom, this.sliceSetV)
      );
    }
    if (this.sliceSetV != null) {
      inPosSlices.add(this.sliceSetV.getAllInPosSlices(geom, this.sliceSetU));
      flatSlices.add(
        this.sliceSetV.getAllFlattenedSlices(geom, this.sliceSetU)
      );
    }
    flatSlices.position.set(1000, 0, 1000);
    retObj.add(inPosSlices);
    retObj.add(flatSlices);
    return retObj;
  }
}

class OLAPFramework {
  getAllLines(geom, addTo) {
    if (geom.type == "Line") addTo.push(geom);
    if (geom.children.length == 0) {
      return;
    } else {
      for (let i = 0; i < geom.children.length; i++) {
        this.getAllLines(geom.children[i], addTo);
      }
    }
  }

  getAllMeshes(geom, addTo) {
    if (geom.type == "Mesh") addTo.push(geom);
    if (geom.children.length == 0) {
      return;
    } else {
      for (let i = 0; i < geom.children.length; i++) {
        this.getAllMeshes(geom.children[i], addTo);
      }
    }
  }

  async checkMessage() {
    try {
      var url = "/olap/js/info.json";
      var infoJSON = await $.getJSON(url);
      if (this.version != infoJSON.latest_version) {
        console.log(
          `${infoJSON.latest_version} is available. Consider upgrading the framework.`
        );
      }
      if (infoJSON.message != "") console.log(infoJSON.message);
    } catch (e) {
      console.log("O-LAP update check failed.");
    }
  }

  async downloadHumans() {
    let url;
    let material = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      color: 0xbebebe,
      transparent: true,
      opacity: 0.3,
      shininess: 0.1,
      specular: 0x000000,
    });
    url = "/olap/files/denace.obj";
    await this.loadModel(
      url,
      (obj) => {
        OLAP.maleModel = obj;
      },
      (xhr) => {},
      (e) => {
        console.log("Failed loading male model");
      },
      material
    );
    url = "/olap/files/bianca.obj";
    await this.loadModel(
      url,
      (obj) => {
        OLAP.femaleModel = obj;
      },
      (xhr) => {},
      (e) => {
        console.log("Failed loading male model");
      },
      material
    );
    OLAP.activeHumanGeom = new THREE.Object3D();
    OLAP.activeHumanGeom.add(OLAP.maleModel);
  }

  updateHuman(isSeen) {
    this.scene.remove(this.activeHumanGeom);
    this.activeHumanGeom = new THREE.Object3D();
    if (this.showGirl) {
      this.activeHumanGeom.add(this.femaleModel);
    } else {
      this.activeHumanGeom.add(this.maleModel);
    }
    if (this.showHumans) {
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
    exp.add(OLAP.sliceManager.getAllSlicesFromSet(g));
    let result = exporter.parse(exp);
    let file = new File([result], `olap_${this.loadedDesign.info.name}.obj`, {
      type: "text/plain",
    });
    saveAs(file);
  }

  async order() {
    let name = $("#order-name").val();
    let address = $("#order-address").val();
    let contact = $("#order-contact").val();
    let message = $("#order-message").val();
    let exporter = new THREE.OBJExporter();
    let exp = new THREE.Object3D();
    let g = OLAP.geometry.clone();
    exp.add(g);
    exp.add(OLAP.sliceManager.getAllSlicesFromSet(g));
    let model = exporter.parse(exp);
    let params = this.loadedDesign.inputState;
    let ordDet = {
      name: name,
      address: address,
      contact: contact,
      message: message,
      model: model,
      params: params,
    };
    $.post(OLAP.dbBaseUrl + "/orders/add", ordDet).then(function (data) {
      if (data == "OK") {
        M.toast({
          html: "Order submitted. We will get back with more details.",
        });
      } else {
        M.toast({
          html: "Order failed. Please mail us the file at olapdesign@gmail.com.",
        });
      }
    });
  }

  async init() {
    let fL = new THREE.FontLoader();
    let that = this;
    this.font = null;
    fL.load("olap/fonts/helvetiker_regular.typeface.json", function (font) {
      that.font = font;
    });

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
    this.$commit_history = $("#commitHistory");
    // this.dbBaseUrl = `http://127.0.0.1:4000`;
    this.dbBaseUrl = `https://o-lap-database.herokuapp.com`;
    $("#download").on("click", function () {
      OLAP.export();
    });
    $("#order-submit-btn").on("click", function () {
      OLAP.order();
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

    $("#rotate-switch").on("change", function (e) {
      let isRot = $(this).is(":checked");
      cameraControls.autoRotate = isRot;
    });
    $("#sections-switch").on("change", function (e) {
      OLAP.showSec = $(this).is(":checked");
      OLAP.updateGeom();
    });
    $("#human-switch").on("change", function (e) {
      OLAP.showHumans = $(this).is(":checked");
      OLAP.updateHuman();
    });
    $("#gender-switch").on("change", function (e) {
      OLAP.showGirl = $(this).is(":checked");
      OLAP.updateHuman();
    });
  }

  async openDesign(designObj, gitAuthor, gitRepo) {
    this.checkMessage();

    if (!hasProperty(designObj, "info")) {
      console.log(
        "Design file needs property 'info' containing design information."
      );
      console.log("Aborting design open.");
      return;
    }
    if (!hasProperty(designObj, "inputs")) {
      console.log(
        "Design file needs property 'inputs' containing design inputs configuration."
      );
      console.log("Aborting design open.");
      return;
    }
    if (!hasProperty(designObj, "inputState")) {
      console.log(
        "Design file needs property 'inputState' to pass down input values."
      );
      console.log("Aborting design open.");
      return;
    }
    if (!hasMethod(designObj, "init")) {
      console.log(
        "Design file needs to implement 'init' method to initialize state."
      );
      console.log("Aborting design open.");
      return;
    }
    if (!hasMethod(designObj, "updateGeom")) {
      console.log(
        "Design file needs to implement 'updateGeom' method to trigger design regeneration."
      );
      console.log("Aborting design open.");
      return;
    }

    this.clearDesign();
    this.loadedDesign = designObj;
    await this.loadedDesign.init();
    await this.loadUI(gitAuthor, gitRepo);
    await this.updateGeom();
  }

  clearDesign() {
    this.clearUI();
    this.clearGeometry();
    this.loadedDesign = null;
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

  async loadUI(gitAuthor, gitRepo) {
    var params = this.loadedDesign.inputs;
    this.$name.text(this.loadedDesign.info.name);
    this.$designer.text(this.loadedDesign.info.designer);
    this.$designmessage.text(this.loadedDesign.info.message);
    this.$version.text(this.loadedDesign.info.version);
    this.$license.text(this.loadedDesign.info.license);
    this.$short_desc.text(this.loadedDesign.info.short_desc);
    for (let param in params) {
      this.inputVals[param] = this.loadedDesign.inputs[param].default; // put the default value into curr state
      this.addUIItem(this.loadedDesign.inputs[param], param); // add the ui item
      this.$ui.append('<div class="divider"></div>');
    }
    if (typeof gitAuthor == "undefined" || typeof gitRepo == "undefined") {
      console.log("Commit history not loaded in dev mode.");
      return;
    }
    let commHistURL = `https://api.github.com/repos/${gitAuthor}/${gitRepo}/commits`;
    let h = await jQuery.get(commHistURL);
    h.forEach((c) => {
      this.$commit_history.append(`
									<li class="collection-item blue-grey lighten-5">
										<div>
											<p>${c.commit.message}</p>
											<p class="right-align"><small>${c.committer.login}</small></p>
										</div>
									</li>
									`);
    });
  }

  async updateGeom() {
    this.scene.remove(this.geometry);
    this.scene.remove(this.slices);
    this.geometry = new THREE.Object3D();
    this.bounds = new THREE.Object3D();
    var inpStateCopy = {}; // make a copy of input state to pass it to design object
    for (var key in this.inputVals) {
      var value = this.inputVals[key];
      inpStateCopy[key] = value;
    }
    this.loadedDesign.inputState = inpStateCopy;
    this.sliceManager = new SliceManager();
    await this.loadedDesign.updateGeom(this.geometry, this.sliceManager);
    this.scene.add(this.geometry);
    if (this.showSec) {
      this.slices = this.sliceManager.getAllSlicesFromSet(this.geometry);
      this.scene.add(this.slices);
    }
  }

  addUIItem(inpConfig, id) {
    if (
      typeof inpConfig === "undefined" ||
      typeof inpConfig.type === "undefined"
    ) {
      return;
    }
    let tipTxt = "";
    switch (inpConfig.type) {
      case "select":
        tipTxt =
          typeof inpConfig.tip !== "undefined"
            ? `<span class="grey-text">${inpConfig.tip}</span></br>`
            : "";
        var html = `<div class="input-field" id="${id}"><select>\n`;
        for (let s of inpConfig.choices) {
          html += `<option value="${s}">${s}</option>\n`;
        }
        html += `</select><label>${inpConfig.label}</label></div>\n${tipTxt}\n`;
        var p = this.$ui.append(html);
        $("select").formSelect(); // materilize initialization
        var fw = this; // cache ref to framework for passing it to the event listening registration
        p.find("#" + id).on("change", async function (e) {
          fw.inputVals[id] = $("#" + id + " :selected").text(); // update curr state
          await fw.updateGeom(); // trigger an update
        });
        break;
      case "slider":
        tipTxt =
          typeof inpConfig.tip !== "undefined"
            ? `<span class="grey-text">${inpConfig.tip}</span></br>`
            : "";
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
        var fw = this; // cache ref to framework for passing it to the event listening registration
        q.find("#" + id).on("input", async function (e) {
          fw.inputVals[id] = $(this).val(); // update curr state
          await fw.updateGeom(); // trigger an update
        });
        break;
      case "bool":
        tipTxt =
          typeof inpConfig.tip !== "undefined"
            ? `<span class="grey-text">${inpConfig.tip}</span></br>`
            : "";
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
        var fw = this; // cache ref to framework for passing it to the event listening registration
        r.find("#" + id).on("change", async function (e) {
          fw.inputVals[id] = $(this).is(":checked"); // update curr state
          await fw.updateGeom(); // trigger an update
        });
        break;
      case "text":
        tipTxt =
          typeof inpConfig.tip !== "undefined"
            ? `<span class="grey-text">${inpConfig.tip}</span></br>`
            : "";
        var html = `
						    <p>
						      <label>
						        <input type='text' id="${id}"/>
						        <span>${inpConfig.label}</span>
						      </label></br>
							  ${tipTxt}
						    </p>
						    `;
        var r = this.$ui.append(html);
        var fw = this; // cache ref to framework for passing it to the event listening registration
        r.find("#" + id).on("input", async function (e) {
          fw.inputVals[id] = $(this).val(); // update curr state
          await fw.updateGeom(); // trigger an update
        });
        break;
    }
  }

  // load .obj models
  // url — A string containing the path/URL of the .obj file.
  // onLoad — (optional) A function to be called after the loading is successfully completed. The function receives the loaded Object3D as an argument.
  // onProgress — (optional) A function to be called while the loading is in progress. The function receives a XMLHttpRequest instance, which contains total and loaded bytes.
  // onError — (optional) A function to be called if an error occurs during loading. The function receives error as an argument.
  // material - (optional) Material to be applied to the model
  // ref: https://threejs.org/docs/#examples/loaders/OBJLoader
  async loadModel(url, onLoad, onProg, onErr, material) {
    // let model = await $.get(url);
    let objLoader = new THREE.OBJLoader();
    // objLoader.setPath(url);
    objLoader.load(
      url,
      (object) => {
        if (material) {
          object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
              child.material = material;
            }
          });
        }
        onLoad(object);
      },
      onProg,
      onErr
    );
  }
}

async function go() {
  OLAP = new OLAPFramework();
  await OLAP.init();
}

go();

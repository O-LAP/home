/**
 * A library of geometry focused tools for computational designers.
 * @author ekatzenstein
 * @namespace MODE
 */

var MODE = {
    VERSION: 'Alpha'
};



/**
 * Create bounding box based on an input plane.
 * @author ekatzenstein
 * @param   {THREE.Geometry/THREE.Mesh} geo   Geometry or Mesh to create bounding box
 * @param   {THREE.Plane/THREE.Vector3} plane Plane or normal vector to define bounding box plane
 * @property {THREE.Box3} BoxPoints    Bounding Box                                           
 * @returns {MODE.boundingBox}          Bounding Box with geometry properties
 * @property {THREE.BoxHelper} BBoxGeometry  Bounding Box Geometry
 * @constructor   
 * @memberof MODE  
 */
MODE.boundingBox = function (geo, plane) {
    return this.get(geo, plane);
}

MODE.boundingBox.prototype = {
        constructor: {},
        rotationVector: new THREE.Vector3(),
        geometry: new THREE.Geometry(),

        bbox: new THREE.Box3(),

        box: new THREE.BoxHelper(),
        get: function (geo, norm) {
            if (norm.normal != undefined) {
                norm = norm.normal;
            }
            if (geo.geometry != undefined) {
                geo = geo.geometry;
            }
            geo = geo.clone();
            this.rotationVector = new THREE.Vector3(norm.y, norm.x, norm.z);
            this.rotationVector.normalize();
            var rv = this.rotationVector;
            geo.vertices.forEach(function (d, i) {
                d.applyAxisAngle(rv, Math.PI / 2)
            })
            var tm = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({}))
            var tb = new THREE.BoxHelper(tm);
            tb.rotateOnAxis(this.rotationVector, -Math.PI / 2)
            this.box = tb;
            var tbb = new THREE.Box3()
            tbb.setFromObject(tm);
            this.bbox = tbb;
        }
    }
    /**
     * Intersect geometry with a plane - based off of [Paul Bourke's contouring algorithms]{@link    http://paulbourke.net/papers/conrec/}
     * @author ekatzenstein        
     * @param   {THREE.Geometry} geometry Geometry to intersect with plane
     * @param   {THREE.Plane}    plane   Plane or array of planes to intersect with geometry
     * @constructor   
     * @memberof MODE  
     */
MODE.planeIntersect = function (geo, planes) {
    return this.get(geo, planes);
}

MODE.planeIntersect.prototype = {
    constructor: {},
    orient: function (loc) {
        var subVec = new THREE.Vector3(0, 0, 1);
        var normVec = subVec.normalize();
        var multVec = normVec.multiplyScalar(loc)
        return multVec.z;
    },
    rotationVector: new THREE.Vector3(),
    geometry: new THREE.Geometry(),
    get: function (geo, planes) {
        geo = geo.clone();
        if (planes.constructor != Array) {
            planes = [planes]
        }
        var allCrvs = [];
        this.rotationVector = new THREE.Vector3(planes[0].normal.y, planes[0].normal.x, planes[0].normal.z);
        this.rotationVector.normalize();
        var rv = this.rotationVector;
        geo.vertices.forEach(function (d, i) {
            d.applyAxisAngle(rv, Math.PI / 2)
        })

        planes.forEach(function (d, i) {
            var tp = new THREE.Plane(new THREE.Vector3(0, 0, 1), d.constant);
            intersectPlane(geo, tp);
        })

        var shapes = [];
        allCrvs.forEach(function (d, i) {
            var polyShape = new THREE.Shape();
            d.forEach(function (e, j) {
                if (j == 0) {
                    polyShape.moveTo(e.x, e.y, e.z);
                } else {
                    polyShape.lineTo(e.x, e.y, e.z);
                }
            })
            polyShape.planeLoc = d.planeLoc

            shapes.push(polyShape)
        })
        this.crvs = allCrvs;
        this.shapes = shapes;


        function intersectPlane(geo, plane) {
            allLines = [];
            allPolylines = [];

            simpPLs = [];

            var A = plane.normal.x;
            var B = plane.normal.y;
            var C = plane.normal.z;
            var D = plane.constant;

            for (var i = 0; i < geo.faces.length; i++) {
                var f = geo.faces[i]
                var pa = geo.vertices[f.a];
                var pb = geo.vertices[f.b];
                var pc = geo.vertices[f.c];
                if (contourFace(pa, pb, pc, A, B, C, D) != 0 && contourFace(pa, pb, pc, A, B, C, D) != -1) {
                    allLines.push(contourFace(pa, pb, pc, A, B, C, D))
                }
            }

            var lineLists = []
            for (var i = 0; i < allLines.length; i++) {
                lineLists.push([allLines[i].start, allLines[i].end])
            }

            joinLines(lineLists, D);

            for (var s = 0; s < allPolylines.length; s++) {
                allPolylines[s].planeLoc = allPolylines.planeLoc;
                allCrvs.push(allPolylines[s])
            }

            function contourFace(pa, pb, pc, planeA, planeB, planeC, D) {
                var sideA = planeA * pa.x + planeB * pa.y + planeC * pa.z + D;
                var sideB = planeA * pb.x + planeB * pb.y + planeC * pb.z + D;
                var sideC = planeA * pc.x + planeB * pc.y + planeC * pc.z + D;

                var sA = Math.sign(sideA);
                var sB = Math.sign(sideB);
                var sC = Math.sign(sideC);

                var p1 = new THREE.Vector3();
                var p2 = new THREE.Vector3();


                if (sideA >= 0 && sideB >= 0 && sideC >= 0) {
                    return 0;
                } else if (sideA <= 0 && sideB <= 0 && sideC <= 0) {
                    return 0;
                } else if (sA != sB && sA != sC) {
                    p1.x = pa.x - sideA * (pc.x - pa.x) / (sideC - sideA);
                    p1.y = pa.y - sideA * (pc.y - pa.y) / (sideC - sideA);
                    p1.z = pa.z - sideA * (pc.z - pa.z) / (sideC - sideA);
                    p2.x = pa.x - sideA * (pb.x - pa.x) / (sideB - sideA);
                    p2.y = pa.y - sideA * (pb.y - pa.y) / (sideB - sideA);
                    p2.z = pa.z - sideA * (pb.z - pa.z) / (sideB - sideA);
                    var line = new THREE.Line3(p1, p2)
                    return line;
                } else if (sB != sA && sB != sC) {
                    p1.x = pb.x - sideB * (pc.x - pb.x) / (sideC - sideB);
                    p1.y = pb.y - sideB * (pc.y - pb.y) / (sideC - sideB);
                    p1.z = pb.z - sideB * (pc.z - pb.z) / (sideC - sideB);
                    p2.x = pb.x - sideB * (pa.x - pb.x) / (sideA - sideB);
                    p2.y = pb.y - sideB * (pa.y - pb.y) / (sideA - sideB);
                    p2.z = pb.z - sideB * (pa.z - pb.z) / (sideA - sideB);
                    var line = new THREE.Line3(p1, p2)
                    return line;
                } else if (sC != sB && sC != sA) {
                    p1.x = pc.x - sideC * (pa.x - pc.x) / (sideA - sideC);
                    p1.y = pc.y - sideC * (pa.y - pc.y) / (sideA - sideC);
                    p1.z = pc.z - sideC * (pa.z - pc.z) / (sideA - sideC);
                    p2.x = pc.x - sideC * (pb.x - pc.x) / (sideB - sideC);
                    p2.y = pc.y - sideC * (pb.y - pc.y) / (sideB - sideC);
                    p2.z = pc.z - sideC * (pb.z - pc.z) / (sideB - sideC);
                    var line = new THREE.Line3(p1, p2)
                    return line;
                } else {
                    return -1;
                }

            }
        }

        function joinLines(lines, constant) {
            var hit = 0;
            lineJoin(0)
            lines.planeLoc = -constant;
            allPolylines = lines;

            function lineJoin(i) {
                var tol = .0000001;
                hit = 0;
                var l = lines[i];
                for (var j = 0; j < lines.length; j++) {
                    if (i == Math.min(j, lines.length)) {
                        continue;
                    }
                    var l2 = lines[Math.min(j, lines.length)];
                    if (l[0].distanceTo(l2[0]) < tol) {
                        l.unshift(l2[1]);
                        lines.splice(Math.min(j, lines.length), 1);
                        j--
                        hit++;
                    } else if (l[0].distanceTo(l2[1]) < tol) {
                        l.unshift(l2[0]);
                        lines.splice(Math.min(j, lines.length), 1);
                        j--
                        hit++;
                    } else if (l[l.length - 1].distanceTo(l2[1]) < tol) {
                        l.push(l2[0]);
                        lines.splice(Math.min(j, lines.length), 1);
                        j--
                        hit++;
                    } else if (l[l.length - 1].distanceTo(l2[0]) < tol) {
                        l.push(l2[1]);
                        lines.splice(Math.min(j, lines.length), 1);
                        j--
                        hit++;
                    }
                    if (j == lines.length - 1) {
                        if (hit == 0) {
                            lineJoin(i + 1);
                        } else {
                            lineJoin(i);
                        }

                    }
                }
            }
        }
    },

    /**
     * Create a THREE.Object3D by extruding normal to the intersection shapes
     * @author ekatzenstein
     *             @param {material} material material to assign to extrusion object
     * @param   {Object} extrudeSettings Extrusion Settings (THREEjs)
     * @returns {THREE.Object3D} Extrusion object   
     * @returns {THREE.Object3D} Extrusion object   
     */

    extrude: function (material, extrudeSettings) {
        extrusions = new THREE.Object3D();
        var ob = this;
        var rv = this.rotationVector;
        this.shapes.forEach(function (d, i) {
            var polyGeom = new THREE.ExtrudeGeometry(d, extrudeSettings);
            polyMesh = new THREE.Mesh(polyGeom, material);
            polyMesh.position.z = ob.orient(d.planeLoc);
            extrusions.add(polyMesh);
        })

        extrusions.rotateOnAxis(rv, -Math.PI / 2)
        extrusions.updateMatrixWorld(true);
        this.extrusions = extrusions;
        return extrusions;
    },
    /**
     * Create a THREE.Object3D by generating a planar surface from intersection shapes
     * @author ekatzenstein
     * @param {material} material material to assign to surface object
     * @returns {THREE.Object3D} Surface object                       
     */
    surface: function (material) {
        srfs = new THREE.Object3D();
        var ob = this;
        var rv = this.rotationVector;
        var l = this.shapes.length;
        this.shapes.forEach(function (d, i) {
            var surfGeom = new THREE.ShapeGeometry(d);
            var newmat = material.clone();
            newmat.color = new THREE.Color("hsl(0, 0%, " + Math.round(i / l * 100) + "%)");
            var surfMesh = new THREE.Mesh(surfGeom, newmat);
            surfMesh.position.z = ob.orient(d.planeLoc);

            srfs.add(surfMesh);
        })
        srfs.rotateOnAxis(rv, -Math.PI / 2)
        srfs.updateMatrixWorld(true);
        this.surfaces = srfs;
        return srfs;
    },
    /**
     * Create a THREE.Object3D by generatingedge geometry from intersection shapes
     * @author ekatzenstein
     * @param {material} material line material to assign to wireframe object
     * @returns {THREE.Object3D} Wireframe object                        
     */
    wireframe: function (material) {
        wires = new THREE.Object3D();

        var ob = this;
        this.crvs.forEach(function (d, i) {
            var geo = new THREE.Geometry();
            geo.vertices = d;
            var line = new THREE.Line(geo, material)
            wires.add(line)
        })
        var rv = this.rotationVector;
        wires.rotateOnAxis(rv, -Math.PI / 2)
        wires.updateMatrixWorld(true);
        this.wires = wires;
        return wires;
    },

    /**
     * Create svg paths from intersection data - requires [d3.js]{@link    https://d3js.org/}
     * @author ekatzenstein
     * @param   {svg}      svg         D3 SVG to place the contour paths (fills bounds)
     * @param   {Array}    worldBounds bounding box bounds [minX,maxX,minY,maxY,minZ,maxZ]                               
     */
    toSVG: function (svg, worldBounds) {
        var w = svg.attr("height")
        svg.attr("width", w * ((worldBounds[1] - worldBounds[0]) / (worldBounds[3] - worldBounds[2])))




        svg.selectAll("path").remove();
        var scaleX = d3.scale.linear()
            .domain([worldBounds[0], worldBounds[1]])
            .range([0, parseFloat(svg.attr("width"))]);
        var scaleY = d3.scale.linear()
            .domain([worldBounds[3], worldBounds[2]])
            .range([0, parseFloat(svg.attr("height"))]);
        var scaleColor = d3.scale.linear().domain([worldBounds[4], worldBounds[5]]).range(["yellow", d3.rgb(47, 161, 214)]);

        this.crvs.forEach(function (d, i) {
            d.pts = [];
            d.forEach(function (e, j) {
                d.pts.push([scaleX(e.x), scaleY(e.y)])
            })
        })
        var line =
            d3.svg.line();
        svg.selectAll("path")
            .data(this.crvs).enter().append("path")

        svg.selectAll("path")
            .attr("d", function (d, i) {
                return line(d.pts);
            })
            .attr("fill", "none")
            .attr("stroke", function (d) {
                return scaleColor(d.planeLoc)
            })
    }

}


/**
 * Clear memory of mesh - [source]{@link http://stackoverflow.com/questions/33152132/three-js-collada-whats-the-proper-way-to-dispose-and-release-memory-garbag}
 * @param {object} node Mesh to remove
 * @instance
 * @global
 */
function disposeNode(node) {
    if (node instanceof THREE.Camera) {
        node = undefined;
    } else if (node instanceof THREE.Light) {
        node.dispose();
        node = undefined;
    } else if (node instanceof THREE.Mesh) {
        if (node.geometry) {
            node.geometry.dispose();
            node.geometry = undefined;
        }

        if (node.material) {
            if (node.material instanceof THREE.MeshFaceMaterial) {
                $.each(node.material.materials, function (idx, mtrl) {
                    if (mtrl.map) mtrl.map.dispose();
                    if (mtrl.lightMap) mtrl.lightMap.dispose();
                    if (mtrl.bumpMap) mtrl.bumpMap.dispose();
                    if (mtrl.normalMap) mtrl.normalMap.dispose();
                    if (mtrl.specularMap) mtrl.specularMap.dispose();
                    if (mtrl.envMap) mtrl.envMap.dispose();

                    mtrl.dispose(); // disposes any programs associated with the material
                    mtrl = undefined;
                });
            } else {
                if (node.material.map) node.material.map.dispose();
                if (node.material.lightMap) node.material.lightMap.dispose();
                if (node.material.bumpMap) node.material.bumpMap.dispose();
                if (node.material.normalMap) node.material.normalMap.dispose();
                if (node.material.specularMap) node.material.specularMap.dispose();
                if (node.material.envMap) node.material.envMap.dispose();

                node.material.dispose(); // disposes any programs associated with the material
                node.material = undefined;
            }
        }

        node = undefined;
    } else if (node instanceof THREE.Object3D) {
        node = undefined;
    }
} // disposeNode

/**
 * Clear memory of object - [source]{@link http://stackoverflow.com/questions/33152132/three-js-collada-whats-the-proper-way-to-dispose-and-release-memory-garbag}
 * @param {object}   node     Object to remove
 * @instance
 * @global
 */
function disposeObject(node) {
    disposeHierarchy(node, disposeNode);

    function disposeHierarchy(node, callback) {
        for (var i = node.children.length - 1; i >= 0; i--) {
            var child = node.children[i];
            disposeHierarchy(child, callback);
            callback(child);
        }
    }
}

/**
 * Remap a value from a source domain to a target domain - [source]{@link http://stackoverflow.com/questions/5649803/remap-or-map-function-in-javascript/5650012#5650012}
 * @param   {number} value   value to remap.
 * @param   {number} lowSrc  source domain lower bounds
 * @param   {number} highSrc source domain upperbounds
 * @param   {number} lowTar  target domain lower bounds
 * @param   {number} highTar target domain upperbounds
 * @returns {number} remapped value
 * @instance
 * @global
 */
function remap(value, lowSrc, highSrc, lowTar, highTar) {
        return lowTar + (highTar - lowTar) * (value - lowSrc) / (highSrc - lowSrc);
    }
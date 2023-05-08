import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

export class SceneViewer {

    static BACKGROUND_COLOR = 0xfce4ec;

    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.BACKGROUND_COLOR);
        this.scene.fog = new THREE.Fog(0xffffff, 200, 300);

        this.perspective = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000);
        this.perspective.position.set(30, 30, 30);
        this.perspective.zoom = 1;
        this.perspective.updateProjectionMatrix();

        this.ortho = new THREE.OrthographicCamera(-this.width / 2, this.width / 2, this.height / 2, -this.height / 2, 0.1, 1000);
        this.ortho.position.set(0, 30, 0);
        this.ortho.zoom = 10;
        this.ortho.updateProjectionMatrix();

        this.camera = this.perspective;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.autoUpdate = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x000000);
        this.renderer.lineWidth = 5;

        this.pcontrols = new OrbitControls(this.perspective, this.renderer.domElement);
        this.pcontrols.enableDamping = true;
        this.pcontrols.dampingFactor = 0.25;

        this.ocontrols = new OrbitControls(this.ortho, this.renderer.domElement);
        this.ocontrols.enableRotate = false;

        this.controls = this.pcontrols;

        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xbfd4d2, 0.8);
        this.scene.add(this.hemiLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.20);
        this.directionalLight.reverse = false;
        this.scene.add(this.directionalLight);

        this.animate = this.animate.bind(this);
        this.setSize = this.setSize.bind(this);

        this.setGrid();

        this.SELECTOR = new LineSelector(this);

        this.ANALYSER = new ModelAnalyser(this);

        this.ROTATOR = new ModelRotator(this);

        this.object = null;
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    add(element) {
        this.container = element;
        element.appendChild(this.renderer.domElement);
        window.addEventListener('resize', this.setSize);
    }

    setSize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
    }

    loadModel(contents, callback) {
        console.time('Model Load');

        const loader = new OBJLoader();
        const object = loader.parse(contents, callback);

        this.setScene(object);

        console.timeEnd('Model Load');
    }

    setScene(object) {

        this.object = object;

        this.clearScene();

        this.setGround();

        this.setLights();

        this.setOrigin(object);

        this.setMaterials(object);

        this.setGrid(object);

        this.updateLights(object);

        this.setCamera(object);

        this.scene.add(object);
    }

    //scene

    dispose() {
        this.clearScene();
        this.renderer.dispose();
        this.container.innerHTML = "";
    }

    clearScene() {

        this.SELECTOR.dispose();
        this.ANALYSER.dispose();
        this.ROTATOR.dispose();

        for (let i = this.scene.children.length - 1; i >= 0; i--) {
            const child = this.scene.children[i];
            this.scene.remove(child);
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((material) => {
                        material.dispose();
                    });
                } else {
                    child.material.dispose();
                }
            }
        }
    }

    setGround() {
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), new THREE.MeshPhongMaterial({ color: 0xffffff, depthWrite: false }));
        ground.rotation.x = - Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    setLights() {
        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.8);
        this.scene.add(this.hemiLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.20);
        this.directionalLight.reverse = false;
        this.scene.add(this.directionalLight);
    }

    //object

    setGrid(object) {
        this.grid = new THREE.GridHelper(10000, 10000, 0xdddddd, 0xdddddd);
        this.grid.renderOrder = 0;
        this.scene.add(this.grid);

        if (object) {
            const box = new THREE.Box3().setFromObject(object);
            const size = box.getSize(new THREE.Vector3());
            const max = Math.max(size.x, size.z);
            if (max > 100) {
                this.scene.fog = new THREE.Fog(0xffffff, max * 2, max * 10);
            }
            else {
                this.scene.fog = new THREE.Fog(0xffffff, 100, 300);
            }
        }
    }

    setMaterials(object) {
        const material = new THREE.MeshPhongMaterial({
            color: 0xf5f5f5,
            flatShading: false,
            shininess: 0.5,
            transparent: false,
            opacity: 1,
            side: THREE.DoubleSide,
        });

        material.receiveShadow = true;
        material.castShadow = true

        object.analyse = true;

        object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = material;
                child.castShadow = true;
                child.receiveShadow = true;
                child.analyse = true;
            }
        });
    }

    setOrigin(object) {
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.set(-center.x, object.position.y, -center.z);
        object.updateMatrix();
        object.updateMatrixWorld();
    }

    setCamera(object) {
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const max = Math.max(size.x, size.y, size.z);

        if (this.camera === this.perspective) {
            this.camera.position.set(max, max, max);
            this.camera.lookAt(center);
            this.camera.updateProjectionMatrix();
        } else if (this.camera === this.ortho) {
            this.camera.position.set(0, max, 0);
            this.camera.lookAt(center);
            this.camera.updateProjectionMatrix();
        }

        if (this.camera === this.perspective) {
            this.controls = this.pcontrols;
        } else {
            this.controls = this.ocontrols;
        }

        this.controls.reset();
        this.controls.target.copy(center);
        this.controls.update();
    }

    updateLights(object) {
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const max = Math.max(size.x, size.y, size.z);
        const distance = max * 1.5;

        this.hemiLight.position.copy(center).add(new THREE.Vector3(0, max, 0));

        const direction = this.directionalLight.reverse ? new THREE.Vector3(1, 1, -1).normalize() : new THREE.Vector3(-1, 1, 1).normalize();
        const lightPosition = center.clone().add(direction.multiplyScalar(max));
        this.directionalLight.position.copy(lightPosition);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize = new THREE.Vector2(2048, 2048);
        this.directionalLight.shadow.mapSize.setScalar(2048);
        this.directionalLight.shadow.camera.near = 1;
        this.directionalLight.shadow.camera.far = distance * 6;
        this.directionalLight.shadow.camera.left = -distance;
        this.directionalLight.shadow.camera.right = distance;
        this.directionalLight.shadow.camera.top = distance;
        this.directionalLight.shadow.camera.bottom = -distance;
        this.directionalLight.shadow.normalBias = 0.0005;
        this.directionalLight.shadow.bias = -0.0005;
        this.renderer.shadowMap.needsUpdate = true;
    }

    //tools

    resetView() {
        if (this.object) {
            this.setCamera(this.object);
        }
    }

    rotateLight() {
        if (this.object) {
            this.directionalLight.reverse = !this.directionalLight.reverse;
            this.updateLights(this.object);
        }
    }

    swapCamera() {

        if (this.camera === this.perspective) {
            this.camera = this.ortho;
        } else {
            this.camera = this.perspective;
        }

        if (this.object) {
            this.setCamera(this.object);
        }
    }

    getImage() {
        this.renderer.render(this.scene, this.camera);
        return this.renderer.domElement.toDataURL("image/png");
    }

}

export class LineSelector {
    constructor(scene) {
        this.viewer = scene;
        this.scene = scene.scene;
        this.renderer = scene.renderer;
        this.mouse = new THREE.Vector2();
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.snap = true;
        this.start = null;
        this.end = null;
        this.line = null;
        this.crosshair = null;
        this.crossLine = null;
        this.text = null;
    }

    startSelection() {
        this.dispose();
        this.renderer.domElement.addEventListener("mousedown", this.onMouseDown);
        this.renderer.domElement.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("keydown", this.onKeyDown);
    }

    stopSelection() {
        this.renderer.domElement.removeEventListener("mousedown", this.onMouseDown);
        this.renderer.domElement.removeEventListener("mousemove", this.onMouseMove);
        window.removeEventListener("keydown", this.onKeyDown);
        if (this.crosshair !== null) {
            this.crosshair.dispose();
        }
        if (this.crossLine !== null) {
            this.crossLine.dispose();
        }
    }

    onKeyDown = (event) => {
        if (event.key === "Escape" || event.keyCode === 27) {
            this.dispose();
            this.stopSelection();
        }
    }

    onMouseDown(event) {
        if (event.button === 0) {
            this.getMousePosition(event);
            const position = this.getPointOnPlane();
            if (position === null) {
                return;
            }
            if (this.start !== null) {
                this.end = new SelectionPoint(this.scene, position);
                this.line = new SelectionLine(this.scene, this.start.point, this.end.point);
                this.line.plane.drawArrows();
                SelectionText.loadFont('assets/fonts/helvetiker_regular.typeface.json', font => {
                    this.text = new SelectionText(this.scene, this.start.point, font, "TEST");
                    this.text.alignToLine(this.line);
                });
                this.stopSelection();
            }
            else {
                this.start = new SelectionPoint(this.scene, position);
            }
        }
    }

    onMouseMove(event) {
        this.getMousePosition(event);
        const position = this.getPointOnPlane();
        if (position === null) {
            return;
        }

        if (this.crosshair === null) {
            this.crosshair = new SelectionPoint(this.scene, position);
        }

        this.crosshair.update(position);

        if (this.start !== null) {
            if (this.crossLine === null) {
                this.crossLine = new SelectionLine(this.scene, this.start.point, position);
            }
            this.crossLine.update(this.start.point, position);
        }
    }

    getMousePosition(event) {
        this.camera = this.viewer.camera;
        const rect = this.renderer.domElement.getBoundingClientRect();

        if (this.camera.type === 'OrthographicCamera') {
            const widthHalf = rect.width / 2;
            const heightHalf = rect.height / 2;

            this.mouse.x = ((event.clientX - rect.left) - widthHalf) / widthHalf;
            this.mouse.y = -((event.clientY - rect.top) - heightHalf) / heightHalf;
        } else {
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        }
    }

    getPointOnPlane() {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(this.mouse, this.camera);
        const intersection = new THREE.Vector3();
        const point = raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), intersection);
        if (this.snap) {
            point.x = Math.round(point.x);
            point.y = Math.round(point.y);
            point.z = Math.round(point.z);
        }
        return point;
    }

    dispose() {
        this.renderer.domElement.removeEventListener("mousedown", this.onMouseDown);
        this.renderer.domElement.removeEventListener("mousemove", this.onMouseMove);
        window.removeEventListener("keydown", this.onKeyDown);
        if (this.start !== null) {
            this.start.dispose();
            this.start = null;
        }
        if (this.end !== null) {
            this.end.dispose();
            this.end = null;
        }
        if (this.line !== null) {
            this.line.dispose();
            this.line = null;
        }
        if (this.crosshair !== null) {
            this.crosshair.dispose();
            this.crosshair = null;
        }
        if (this.crossLine !== null) {
            this.crossLine.dispose();
            this.crossLine = null;
        }
        if (this.text !== null) {
            this.text.dispose();
            this.text = null;
        }
    }

    enableSnap() {
        this.snap = !this.snap;
    }
}

export class ModelRotator {
    constructor(scene) {
        this.scene = scene.scene;
        this.camera = scene.camera;
        this.renderer = scene.renderer;
        this.start = null;
        this.end = null;
        this.mouse = new THREE.Vector2();
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.point = null;
        this.edges = null;
    }

    startSelection() {

        this.dispose();

        const objects = this.scene.children.filter(object => object.hasOwnProperty('analyse'));

        if (objects.length == 0) {
            return;
        }

        this.renderer.domElement.addEventListener("mousedown", this.onMouseDown);
        this.renderer.domElement.addEventListener("mousemove", this.onMouseMove);

        THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
        THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
        THREE.Mesh.prototype.raycast = acceleratedRaycast;

        objects[0].children.forEach((c) => {
            if (c.isMesh) {
                c.geometry.computeBoundsTree();
            }
        });
    }

    stopSelection() {

        const objects = this.scene.children.filter(object => object.hasOwnProperty('analyse'));

        if (objects.length === 0) {
            this.dispose();
            return;
        }

        this.renderer.domElement.removeEventListener("mousedown", this.onMouseDown);
        this.renderer.domElement.removeEventListener("mousemove", this.onMouseMove);

        THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
        THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
        THREE.Mesh.prototype.raycast = acceleratedRaycast;

        objects[0].children.forEach((c) => {
            if (c.isMesh) {
                c.geometry.disposeBoundsTree();
            }
        });

        this.rotateObject(objects);

        this.dispose();
    }

    createEdges(mesh) {
        const edges = new THREE.EdgesGeometry(mesh.geometry, 10);
        edges.applyMatrix4(mesh.matrixWorld);
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
        const edgesMesh = new THREE.LineSegments(edges, edgesMaterial);
        this.edges = edgesMesh;
    }

    onMouseDown(event) {
        if (event.button === 0) {
            if (this.point == null || this.point.point == null) {
                this.dispose();
                return;
            }
            if (this.start !== null) {
                this.end = new SelectionPoint(this.scene, this.point.point, 0.1);
                this.stopSelection();
            }
            else {
                this.start = new SelectionPoint(this.scene, this.point.point, 0.1);;
            }
        }
    }

    onMouseMove(event) {
        this.getMousePosition(event);
        const position = this.getPointOnMesh();
        if (position == null) {
            return;
        }
        if (this.point == null) {
            this.point = new SelectionPoint(this.scene, position, 0.1);
        }
        this.point.update(position);
    }

    getPointOnMesh() {
        THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
        THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
        THREE.Mesh.prototype.raycast = acceleratedRaycast;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(this.mouse, this.camera);
        const objects = this.scene.children.filter(object => object.hasOwnProperty('analyse'));
        const intersects = raycaster.intersectObjects(objects[0].children, true);
        if (intersects.length > 0) {
            return this.getClosestVertex(intersects);
        }
        return null;
    }

    getClosestVertex(intersects) {

        const intersection = intersects[0];

        const vA = new THREE.Vector3();
        const vB = new THREE.Vector3();
        const vC = new THREE.Vector3();

        const face = intersection.face;
        const geometry = intersection.object.geometry;
        const position = geometry.attributes.position;

        vA.fromBufferAttribute(position, face.a);
        vB.fromBufferAttribute(position, face.b);
        vC.fromBufferAttribute(position, face.c);

        const matrix = intersection.object.matrixWorld;

        vA.applyMatrix4(matrix);
        vB.applyMatrix4(matrix);
        vC.applyMatrix4(matrix);

        const intersectionPoint = intersection.point;

        const distanceA = intersectionPoint.distanceTo(vA);
        const distanceB = intersectionPoint.distanceTo(vB);
        const distanceC = intersectionPoint.distanceTo(vC);

        let closestVertex = vA;
        let closestDistance = distanceA;

        if (distanceB < closestDistance) {
            closestVertex = vB;
            closestDistance = distanceB;
        }

        if (distanceC < closestDistance) {
            closestVertex = vC;
            closestDistance = distanceC;
        }

        return closestVertex;
    }

    getMousePosition(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    getAngle() {
        if (this.start == null || this.end == null) {
            return 0;
        }

        const start = this.start.point;
        const end = this.end.point;

        const angle = Math.atan2(end.z - start.z, end.x - start.x);
        return angle;
    }

    rotateObject(objects) {
        const angle = this.getAngle();

        const axis = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);

        const offset = objects[0].position.clone().sub(this.start.point);

        objects[0].applyQuaternion(quaternion);

        const rotatedOffset = offset.clone().applyQuaternion(quaternion);
        objects[0].position.copy(this.start.point).add(rotatedOffset);

        objects[0].updateMatrixWorld();
    }

    dispose() {
        this.renderer.domElement.removeEventListener("mousedown", this.onMouseDown);
        this.renderer.domElement.removeEventListener("mousemove", this.onMouseMove);

        if (this.start !== null) {
            this.start.dispose();
            this.start = null;
        }
        if (this.end !== null) {
            this.end.dispose();
            this.end = null;
        }
        if (this.point !== null) {
            this.point.dispose();
            this.point = null;
        }
        if (this.line !== null) {
            this.line = null;
        }
        if (this.edges !== null) {
            this.scene.remove(this.edges);
            this.edges.geometry.dispose();
            this.edges = null;
        }
    }
}

export class SelectionPoint extends THREE.Mesh {
    constructor(scene, position, size = 0.2) {
        const geometry = new THREE.SphereGeometry(size, 36, 36);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        super(geometry, material);
        this.point = position;
        this.update(position);
        this.scene = scene;
        this.scene.add(this);
    }

    update(position) {
        this.position.copy(position);
        this.point = position;
    }

    dispose() {
        this.scene.remove(this);
        this.geometry.dispose();
        this.material.dispose();
    }
}

export class SelectionLine extends THREE.Line {
    constructor(scene, start, end) {
        const points = [start, end];
        const material = new THREE.LineDashedMaterial({
            color: 0xff0000,
            dashSize: 1,
            gapSize: 1,
            polygonOffset: true,
            polygonOffsetFactor: -1,
        });

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        super(geometry, material);
        this.computeLineDistances();
        this.start = start;
        this.end = end;
        this.length = start.distanceTo(end);
        this.scene = scene;
        this.scene.add(this);
        this.plane = new SelectionPlane(this.scene, this.start, this.end);
        this.renderOrder = 999;
        this.onBeforeRender = function (renderer) { renderer.clearDepth(); };
    }

    isParallelToGrid() {
        const direction = this.end.clone().sub(this.start).normalize();
        const angle = Math.abs(Math.atan2(direction.x, direction.z));
        return angle === 0 || angle === Math.PI || angle === Math.PI / 2;
    }

    updateColor() {
        if (this.isParallelToGrid()) {
            this.material.color.set(0x00ff00);
        } else {
            this.material.color.set(0xff0000);
        }
    }

    update(start, end) {
        this.start = start;
        this.end = end;
        this.geometry.attributes.position.setXYZ(0, start.x, start.y, start.z);
        this.geometry.attributes.position.setXYZ(1, end.x, end.y, end.z);
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.computeBoundingBox();
        this.geometry.computeBoundingSphere();
        this.plane.update(start, end);
        this.updateColor();
    }

    dispose() {
        this.scene.remove(this);
        this.geometry.dispose();
        this.material.dispose();
        if (this.plane) {
            this.plane.dispose();
            this.plane = null;
        }
    }
}

export class SelectionPlane extends THREE.Mesh {
    constructor(scene, start, end) {
        const width = start.distanceTo(end);
        const height = 16;
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide,
        });
        super(geometry, material);
        this.start = start;
        this.end = end;
        this.scene = scene;
        this.scene.add(this);
        this.update(start, end);
    }

    drawArrows() {
        const center = new THREE.Vector3();
        this.geometry.computeBoundingBox();
        this.geometry.boundingBox.getCenter(center);

        const arrow = new THREE.ArrowHelper(this.normal, center, 1.5, 0xff0000, 0.5, 0.5);
        this.add(arrow);
    }

    update(start, end) {
        const width = start.distanceTo(end);
        const height = 16;
        const geometry = new THREE.PlaneGeometry(width, height);
        this.geometry = geometry;
        const up = new THREE.Vector3(0, 1, 0);
        const direction = up.clone().cross(end.clone().sub(start).normalize()).normalize();
        const position = start.clone().add(end).multiplyScalar(0.5).add(new THREE.Vector3(0, 8, 0));
        this.position.copy(position);
        this.lookAt(position.clone().add(direction));
    }

    dispose() {
        this.scene.remove(this);
        this.geometry.dispose();
        this.material.dispose();
    }
}

export class SelectionText extends THREE.Mesh {
    constructor(scene, position, font, text) {
        const geometry = new TextGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        super(geometry, material);
        this.font = font;
        this.text = text;
        this.update(position);
        this.updateText(text);
        this.scene = scene;
        this.scene.add(this);
    }

    static loadFont(fontFile, callback) {
        const loader = new FontLoader();
        loader.load(fontFile, font => {
            callback(font);
        });
    }

    update(position) {
        this.position.copy(position);
    }

    updateText(text) {
        this.geometry.dispose();
        this.geometry = new TextGeometry(text, {
            font: this.font,
            size: 0.5,
            height: 0.01,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelOffset: 0,
            bevelSegments: 5
        });
        this.geometry.rotateX(-Math.PI / 2);
    }

    alignToLine(line) {
        const start = line.start;
        const end = line.end;
        const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        this.position.copy(center);
        this.lookAt(end);
        this.rotateY(-Math.PI / 2);
        this.updateText(line.length.toFixed(2) + " m")
    }

    dispose() {
        this.scene.remove(this);
        this.geometry.dispose();
        this.material.dispose();
    }
}

export class ModelAnalyser {
    constructor(scene, distance = 0.1, height = 16, max = 16) {
        this.scene = scene.scene;
        this.distance = distance;
        this.height = height;
        this.depth = max;
        this.rays = [];
        this.results = null;
        this.min = null;
        this.max = null;
        this.isRunning = false;
    }

    startAnalyse(line, distance, height, max) {

        this.dispose();

        const objects = this.scene.children.filter(object => object.hasOwnProperty('analyse'));

        if (objects.length === 0) {
            return;
        }

        if (line === null) {
            return;
        }

        this.distance = distance > 0 ? distance : 0.1;
        this.height = height > 0 ? height : this.getSceneHeight();
        this.depth = max > 0 ? max : Infinity;

        this.dispose();

        const rays = this.createRaysOnLine(line, this.distance);
        const grid = this.getRayGrid(rays, this.distance);

        const intersections = this.getIntersections(objects, grid);

        const clean = this.removeInfiniteColumns(intersections);

        this.results = this.subdivideList(clean);
    }

    dispose() {
        this.rays.forEach(ray => {
            ray.dispose();
        });
        this.rays = [];
        this.results = null;
        this.min = null;
        this.max = null;
        this.depth = 16;
        this.distance = 0.1;
        this.height = 16;
    }

    getStart(line) {
        const points = line.geometry.attributes.position.array;
        const start = new THREE.Vector3(points[0], points[1], points[2]);
        return start;
    }

    getEnd(line) {
        const points = line.geometry.attributes.position.array;
        const end = new THREE.Vector3(points[3], points[4], points[5]);
        return end;
    }

    getNormal(line) {
        const start = this.getStart(line);
        const end = this.getEnd(line);
        const direction = end.clone().sub(start).normalize();
        const normal = new THREE.Vector3(-direction.z, 0, direction.x);
        return normal;
    }

    createRaysOnLine(line, distance) {
        const rays = [];
        const start = this.getStart(line);
        const end = this.getEnd(line);
        const direction = this.getNormal(line).multiplyScalar(-1);
        const length = start.distanceTo(end);
        const rayCount = Math.floor(length / distance);
        for (let i = 0; i <= rayCount; i++) {
            const origin = start.clone().lerp(end, i / rayCount);
            const ray = new AnalysisRay(this.scene, origin, direction);
            rays.push(ray);
        }
        return rays;
    }

    getRayGrid(rays, distance) {
        const grid = [];
        const rayCount = Math.floor(this.height / distance);
        for (let i = 0; i < rayCount; i++) {
            const copy = rays.map(ray => {
                const raycopy = ray.copy(distance * i);
                this.rays.push(raycopy);
                return raycopy;
            });
            grid.push(copy);
        }
        return grid;
    }

    getSceneHeight() {
        const box = new THREE.Box3().setFromObject(this.scene);
        const size = box.getSize(new THREE.Vector3());
        return size.y + 1;
    }

    getIntersections(objects, rays) {
        let results = [];

        THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
        THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
        THREE.Mesh.prototype.raycast = acceleratedRaycast;

        objects[0].children.forEach((c) => {
            if (c.isMesh) {
                c.geometry.computeBoundsTree();
            }
        });

        for (let n = 0; n < rays.length; n++) {
            const row = rays[n];
            let distances = [];
            for (let i = 0; i < row.length; i++) {
                const ray = row[i];
                const draw = (this.distance < 1 && i % (1 / this.distance) === 0 && n % (1 / this.distance) == 0) || this.distance >= 1;
                const distance = ray.intersect(objects, draw);
                this.GetMinMax(distance);
                distances.push(distance);
            }
            results.push(distances);
        }

        for (let n = 0; n < rays.length; n++) {
            const row = rays[n];
            for (let i = 0; i < row.length; i++) {
                const ray = row[i];
                if (ray.distance !== undefined && ray.distance < this.min + this.depth) {
                    ray.showPoint();
                }
            }
        }

        objects[0].children.forEach((c) => {
            if (c.isMesh) {
                c.geometry.disposeBoundsTree();
            }
        });

        return results;
    }

    removeInfiniteColumns(matrix) {
        if (!matrix || !matrix.length || !matrix[0].length) {
            return [];
        }

        let leftIndex = 0;
        let rightIndex = matrix[0].length - 1;

        function isColumnInfinite(matrix, colIndex) {
            return matrix.every(row => row[colIndex] === Infinity);
        }

        while (leftIndex <= rightIndex && isColumnInfinite(matrix, leftIndex)) {
            leftIndex++;
        }

        while (rightIndex >= leftIndex && isColumnInfinite(matrix, rightIndex)) {
            rightIndex--;
        }

        return matrix.map(row => row.slice(leftIndex, rightIndex + 1));
    }

    GetMinMax(distance) {
        if (this.min === null) {
            this.min = distance;
        }
        if (distance < this.min) {
            this.min = distance;
        }
        if (this.max === null) {
            this.max = distance;
        }
        if (distance > this.max) {
            this.max = distance;
        }
    }

    getValue(value) {
        if (value == Infinity || value == undefined || value > this.min + this.depth) return this.min + this.depth;
        return value;
    }

    subdivideList(values) {
        const results = [];
        for (let row = 0; row < values.length; row++) {
            for (let column = 0; column < values[row].length; column++) {
                const value = this.getValue(values[row][column]);
                const cellX = column;
                const cellY = row;
                const str = `${value}\n\{${cellY};${cellX}\}`;
                results.push(str);
            }
        }
        return results;
    }
}

export class AnalysisPoint extends THREE.Mesh {
    constructor(scene, position) {
        const geometry = new THREE.SphereGeometry(0.15, 36, 36);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        super(geometry, material);
        this.point = position;
        this.update(position);
        this.scene = scene;
        this.isVisible = false;
    }

    show() {
        this.scene.add(this);
        this.isVisible = true;
    }

    hide() {
        this.scene.remove(this);
        this.isVisible = false;
    }

    update(position) {
        this.position.copy(position);
    }

    dispose() {
        this.scene.remove(this);
        this.geometry.dispose();
        this.material.dispose();
    }
}

export class AnalysisRay extends THREE.Line {
    constructor(scene, origin, direction) {
        const length = 1000;
        const unitVector = new THREE.Vector3().copy(direction).normalize();
        const endPoint = new THREE.Vector3().copy(unitVector).multiplyScalar(length).add(origin);
        const points = [origin, endPoint];
        const material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        super(geometry, material);
        this.origin = origin;
        this.direction = direction;
        this.point = null;
        this.ray = new THREE.Raycaster(origin, direction);
        this.ray.firstHitOnly = true;
        this.scene = scene;
        this.isVisible = false;
        this.distance = 0;
    }

    show() {
        this.scene.add(this);
        this.isVisible = true;
    }

    hide() {
        this.scene.remove(this);
        this.isVisible = false;
    }

    showPoint() {
        if (this.point !== null) {
            this.point.show();
        }
    }

    hidePoint() {
        if (this.point !== null) {
            this.point.hide();
        }
    }

    dispose() {
        this.scene.remove(this);
        this.geometry.dispose();
        this.material.dispose();
        if (this.point !== null) {
            this.point.dispose();
            this.point = null;
        }
    }

    intersect(objects, draw = true) {
        const mesh = objects[0].children[0]
        const intersections = this.ray.intersectObject(mesh);
        const distance = intersections.length > 0 ? intersections[0].distance : Infinity;
        if (distance !== Infinity && distance > 0 && draw) {
            this.point = new AnalysisPoint(this.scene, intersections[0].point);
        }
        this.distance = distance;
        return distance;
    }

    copy(distance) {
        const origin = this.origin.clone();
        const direction = this.direction.clone();
        origin.y += distance;
        return new AnalysisRay(this.scene, origin, direction);
    }
}
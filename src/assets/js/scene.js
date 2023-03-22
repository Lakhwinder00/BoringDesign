import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from  "../../../node_modules/three-mesh-bvh";

export class SceneViewer {

    static BACKGROUND_COLOR = 0xfce4ec;

    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.BACKGROUND_COLOR);
        this.scene.fog = new THREE.Fog(0xffffff, 200, 500);

        this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000);
        this.camera.position.set(30, 30, 30);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.autoUpdate = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x000000);
        this.renderer.lineWidth = 5;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;

        this.composer = new EffectComposer(this.renderer);
        const ssaoPass = new SSAOPass(this.scene, this.camera, this.width, this.height);
        ssaoPass.kernelRadius = 0.01;

        this.composer.addPass(ssaoPass);

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

    add(element) {
        this.container = element;
        element.appendChild(this.renderer.domElement);
        window.addEventListener('resize', this.setSize);
    }

    setSize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.width = width;
        this.height = height;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.controls.update();
        this.composer.render();
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

        this.setOrigin(object);

        this.setMaterials(object);

        this.setGround();

        this.setGrid(object);

        this.setLights();

        this.updateLights(object);

        this.setCamera(object);

        this.scene.add(object);

        this.drawGizmo(5);
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

    setFog(object) {
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        this.scene.fog = new THREE.Fog(0xffffff, maxSize * 3, maxSize * 5);
    }

    setGrid(object) {

        let radius = 100;
        let decay = 35.5;

        if (object) {
            const box = new THREE.Box3().setFromObject(object);
            const size = box.getSize(new THREE.Vector3());
            const maxSize = Math.max(size.x, size.z);
            if (maxSize > radius) {
                radius = maxSize * 1.2;
            }
        }

        this.grid = new THREE.GridHelper(10000, 10000, 0x000000, 0x000000);
        this.grid.renderOrder = 0;

        const material = new THREE.ShaderMaterial({
            uniforms: {
                center: { value: new THREE.Vector3(0, 0, 0) },
                radius: { value: radius },
                fogColor: { value: this.scene.fog.color },
                fogNear: { value: this.scene.fog.near },
                fogFar: { value: this.scene.fog.far }
            },
            vertexShader: `
                            varying vec3 vPos;

                            void main() {
                                vPos = position;
                                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                            }
                        `,
            fragmentShader: `
                            uniform vec3 center;
                            uniform float radius;
                            uniform vec3 fogColor;
                            uniform float fogNear;
                            uniform float fogFar;
                            varying vec3 vPos;

                            void main() {
                                float dist = length(vPos - center);
                                float alpha = smoothstep(radius - ${decay}, radius, dist);
                                vec3 color = mix(vec3(0.8, 0.8, 0.8), vec3(1.0, 1.0, 1.0), alpha);

                                #ifdef USE_FOG
                                    float fogFactor = smoothstep(fogNear, fogFar, length(vPos));
                                    color = mix(color, fogColor, fogFactor);
                                #endif

                                gl_FragColor = vec4(color, 1.0);
                            }
                        `
        });

        material.opacity = 0.1;
        material.transparent = true;

        this.grid.material = material;

        this.scene.add(this.grid);
    }

    setMaterials(object) {
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            flatShading: true,
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
        const x = max;
        const y = max;
        const z = max;
        this.controls.target.copy(center);
        this.camera.position.set(x, y, z);
        this.camera.up.set(0, 1, 0);
        this.camera.lookAt(this.scene.position);
        this.camera.updateProjectionMatrix();
    }

    scaleObject(object) {
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        if (maxSize > 200) {
            object.scale.setScalar(0.01);
        }
    }

    setGround() {
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), new THREE.MeshPhongMaterial({ color: 0xffffff, depthWrite: false }));
        ground.rotation.x = - Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    updateLights(object) {
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        const distance = maxSize * 1.5;

        this.hemiLight.position.copy(center).add(new THREE.Vector3(0, maxSize, 0));

        const direction = this.directionalLight.reverse ? new THREE.Vector3(1, 1, -1).normalize() : new THREE.Vector3(-1, 1, 1).normalize();
        const lightPosition = center.clone().add(direction.multiplyScalar(maxSize));
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

    setLights() {
        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xbfd4d2, 0.8);
        this.scene.add(this.hemiLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.20);
        this.directionalLight.reverse = false;
        this.scene.add(this.directionalLight);
    }

    resetView() {
        if (this.object) {
            this.setCamera(this.object, this.camera);
        }
    }

    drawGizmo(size) {
        const redMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const greenMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const blueMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });

        const xLineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(size, 0, 0)]);
        const xLine = new THREE.Line(xLineGeometry, redMaterial);
        this.scene.add(xLine);

        const yLineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, size, 0)]);
        const yLine = new THREE.Line(yLineGeometry, greenMaterial);
        this.scene.add(yLine);

        const zLineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, size)]);
        const zLine = new THREE.Line(zLineGeometry, blueMaterial);
        this.scene.add(zLine);
    }

    drawBoundingBoxWireframe(object) {
        const box = new THREE.Box3().setFromObject(object);

        const vertices = [
            new THREE.Vector3(box.min.x, box.min.y, box.min.z),
            new THREE.Vector3(box.max.x, box.min.y, box.min.z),
            new THREE.Vector3(box.max.x, box.min.y, box.max.z),
            new THREE.Vector3(box.min.x, box.min.y, box.max.z),
            new THREE.Vector3(box.min.x, box.max.y, box.min.z),
            new THREE.Vector3(box.max.x, box.max.y, box.min.z),
            new THREE.Vector3(box.max.x, box.max.y, box.max.z),
            new THREE.Vector3(box.min.x, box.max.y, box.max.z),
        ];

        const indices = [
            0, 1, 1, 2, 2, 3, 3, 0,
            4, 5, 5, 6, 6, 7, 7, 4,
            0, 4, 1, 5, 2, 6, 3, 7
        ];

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices.flatMap(v => [v.x, v.y, v.z])), 3));
        geometry.setIndex(indices);

        const material = new THREE.LineBasicMaterial({ color: 0x000000 });

        const wireframe = new THREE.LineSegments(geometry, material);
        this.scene.add(wireframe);
    }

    rotateLight() {
        if (this.object) {
            this.directionalLight.reverse = !this.directionalLight.reverse;
            this.updateLights(this.object);
        }
    }

    rotateGrid() {
        this.grid.rotation.y += Math.PI / 10;
    }
}

export class LineSelector {
    createline=false;
    constructor(scene) {
        this.scene = scene.scene;
        this.camera = scene.camera;
        this.renderer = scene.renderer;
        this.mouse = new THREE.Vector2();
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.snap = false;
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
    }

    stopSelection() {
        this.createline=true;
        this.renderer.domElement.removeEventListener("mousedown", this.onMouseDown);
        this.renderer.domElement.removeEventListener("mousemove", this.onMouseMove);
        if (this.crosshair !== null) {
            this.crosshair.dispose();
        }
        if (this.crossLine !== null) {
            this.crossLine.dispose();
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
                SelectionText.loadFont('assets/fonts/helvetiker_regular.typeface.json', font => {
                    this.text = new SelectionText(this.scene, this.start.point, font, "TEST");
                    this.text.alignToLine(this.line);
                });
                this.stopSelection();
            }
            else {
                this.start = new SelectionPoint(this.scene, position);;
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
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
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
        this.createline=false;
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
            linewidth: 5
        });
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        super(geometry, material);
        this.renderOrder = 1;
        this.computeLineDistances();
        this.start = start;
        this.end = end;
        this.length = start.distanceTo(end);
        this.scene = scene;
        this.scene.add(this);
    }

    update(start, end) {
        this.geometry.attributes.position.setXYZ(0, start.x, start.y, start.z);
        this.geometry.attributes.position.setXYZ(1, end.x, end.y, end.z);
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.computeBoundingBox();
        this.geometry.computeBoundingSphere();
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
    analyses=false;
    constructor(scene, distance = 0.1, height = 16, max = 16) {
        this.scene = scene.scene;
        this.camera = scene.camera;
        this.renderer = scene.renderer;
        this.distance = distance;
        this.height = height;
        this.depth = max;
        this.rays = [];
        this.results = null;
        this.min = null;
        this.max = null;
        this.isRunning = false;
    }

    startAnalyse(line, distance, height, max, log) {
        this.dispose();

        const objects = this.scene.children.filter(object => object.hasOwnProperty('analyse'));

        if (objects.length === 0) {
           // log("no objects to analyse");
            return;
        }

        if (line === null) {
            return;
        }
        
        this.distance = distance > 0 ? distance : 0.1;
        this.height = height > 0 ? height : this.getSceneHeight();
        this.depth = max > 0 ? max : Infinity;

        //log("distance: " + this.distance);
       // log("height: " + this.height);
       // log("max depth: " + this.depth);

        this.dispose();
        this.analyses=true;
        var startTime = performance.now();

        const rays = this.createRaysOnLine(line, this.distance);
        const grid = this.getRayGrid(rays, this.distance);

        const intersections = this.getIntersections(objects, grid);

        var endTime = performance.now();

        var duration = endTime - startTime;

       // log('duration: ' + Math.round(duration) + 'ms');

       // log("intersections: " + intersections.length * intersections[0].length);

        this.results = this.subdivideList(intersections);
    }

    dispose() {
        this.analyses=false
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
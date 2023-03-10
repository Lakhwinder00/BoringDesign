import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { ToastrService } from 'ngx-toastr';
import { UtilService } from '../services/util.service';
@Component({
  selector: 'app-process-file',
  templateUrl: './process-file.component.html',
  styleUrls: ['./process-file.component.scss'],
})
export class ProcessFileComponent implements OnInit, AfterViewInit {
  fileOutput: any;
  public parseObj: any;
  public files: any;
  public isDisplay: boolean = false;
  public isUpload: boolean = true;
  public filename: any;
  public offset: any;
  public isLoadFile:boolean=false;
  @ViewChild('mainCanvas', { static: false })
  rendererContainer!: ElementRef;
  private light: THREE.AmbientLight | any;
  cameraDefaults = {
    posCamera: new THREE.Vector3(0.0, 25.0, 0.0),
    posCameraTarget: new THREE.Vector3(0, 0, 0),
    near: 0.1,
    far: 10000,
    fov: 45,
    aspectRatio: 4 / 3,
  };

  renderer: THREE.Renderer | any;
  scene: THREE.Scene | any;
  camera: THREE.PerspectiveCamera | any;
  controls: OrbitControls | any;

  constructor(private toasterService: ToastrService,private utilService:UtilService) {
    this.utilService.getClickEvent().subscribe(() => { 
      this.CancelFile()})
  }

  // User this part for Upload 3d model file
  ShowFile() {
    if (this.filename == '' || this.filename == undefined) {
      this.toasterService.error('Please upload .obj file only');
    } else {
      this.isUpload = false;
      this.isDisplay = true;
      this.filename = '';
    }
  }
  CancelFile() {
    this.isUpload = true;
    this.isDisplay = false;
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
  }
  public config: DropzoneConfigInterface = {
    autoProcessQueue: false,
    clickable: true,
    //acceptedFiles: 'image/*',
    previewTemplate: '<div style="display:none"></div>',
    uploadMultiple: false,
    dictDefaultMessage: '',
    maxFiles: 1,
  };
  uploadedFileName: string = '';

  public onUploadError(args: any): void {
    console.log('onUploadError:', args);
  }

  public onUploadSuccess(args: any): void {
    console.log('onUploadSuccess:', args);
  }

  // call this function uplad the files
  fileAdded(file: File): void {
    this.parseObj = null;
    this.filename = file.name;
    let ext=this.filename.split(".");
    if(ext!=undefined && ext!=null && ext[1]=="obj")
    {
      this.isLoadFile=true;
      var reader = new FileReader();
      reader.onload = (e: any) => {
        // The file's text will be printed here
        this.parseObj = e.target.result;
        setTimeout(()=>{ 
          this.loadCube(this.scene, this.renderer);
          this.isLoadFile=false;
        },1000)
      };
      reader.readAsText(file);
    }else{
      this.toasterService.error("Please upload .obj file only")
    }
    //  console.log('onFileAdded:', file);
    //  this.uploadedFileName = file.name;
  }
  ngOnInit() {
    this.initGL();
  }
  ngAfterViewInit() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.rendererContainer.nativeElement,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(800, 600, false);
  }

  // Use this function making the 3d model
  loadCube(scene: any, renderer: any) {
    let container: any;
    let mouseX = 0,
      mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 1, 1).normalize();
    scene.add(light);
    container = document.createElement('div');
    document.body.appendChild(container);
    const camera = new THREE.PerspectiveCamera(
      this.cameraDefaults.fov,
      this.cameraDefaults.aspectRatio,
      this.cameraDefaults.near,
      this.cameraDefaults.far
    );

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    scene.add(camera);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    const objLoader = new OBJLoader();

    const object = objLoader.parse(this.parseObj as string);
    var box = new THREE.Box3().setFromObject(object);
    var middle = new THREE.Vector3();
    var size = new THREE.Vector3();
    box.getSize(size);
    const fov = camera.fov * (Math.PI / 180);
    const fovh = 2 * Math.atan(Math.tan(fov / 2) * camera.aspect);
    let dx = size.z / 2 + Math.abs(size.x / 2 / Math.tan(fovh / 2));
    let dy = size.z / 2 + Math.abs(size.y / 2 / Math.tan(fov / 2));
    let cameraZ = Math.max(dx, dy);
    if (this.offset !== undefined && this.offset !== 0) cameraZ *= this.offset;

    camera.position.set(0, 0, cameraZ);

    // set the far plane of the camera so that it easily encompasses the whole object
    const minZ = box.min.z;
    const cameraToFarEdge = minZ < 0 ? -minZ + cameraZ : cameraZ - minZ;

    camera.far = cameraToFarEdge * 3;
    camera.updateProjectionMatrix();

    if (controls !== undefined) {
      // set camera to rotate around the center
      controls.target = new THREE.Vector3(0, 0, 0);

      // prevent camera from zooming out far enough to create far plane cutoff
      controls.maxDistance = cameraToFarEdge * 2;
    }
    var center = new THREE.Vector3();
    box.getSize(new THREE.Vector3()).length;
    box.getCenter(center);
    object.position.sub(center); // center the model
    object.rotation.y = Math.PI; // rotate the model

    this.scene.add(object);

    window.addEventListener('resize', onWindowResize, false);
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);
      document.addEventListener('mousemove', onDocumentMouseMove);
      window.addEventListener('resize', onWindowResize);
      render();
    }

    const stats = Stats();
    document.body.appendChild(stats.dom);
    function onDocumentMouseMove(event: any) {
      mouseX = (event.clientX - windowHalfX) / 2;
      mouseY = (event.clientY - windowHalfY) / 2;
    }
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      render();
      stats.update();
    }

    function render() {
      renderer.render(scene, camera);
    }
    animate();
  }
  // call this function set the camera postion
  initGL() {
    this.scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    ); // Specify camera type like this
    camera.position.set(0, 2.5, 2.5); // Set position like this
    camera.lookAt(new THREE.Vector3(0, 0, 0)); // Set look at coordinate like this
  }
}

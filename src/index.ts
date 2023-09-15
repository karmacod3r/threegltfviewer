import * as THREE from 'three';

// (<any>window).THREE = THREE;
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {KTX2Loader} from "three/examples/jsm/loaders/KTX2Loader";
import {REVISION} from "three";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {SAOPass} from "three/examples/jsm/postprocessing/SAOPass";
import {OutputPass} from "three/examples/jsm/postprocessing/OutputPass";
import GUI from "three/examples/jsm/libs/lil-gui.module.min";
import Stats from "three/examples/jsm/libs/stats.module";

let camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    controls: OrbitControls,
    renderer: THREE.WebGLRenderer,
    composer: EffectComposer,
    stats: Stats,
    model: THREE.Group,
    saoPass: SAOPass,
    isDragging: boolean = false;

function init(): void {
    // setup //
    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.autoClear = true;
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.25,
        20
    );
    camera.position.set(-1.8, 1.5, 2.7);
    camera.clear()

    /// post processsing ///
    composer = new EffectComposer( renderer );
    const renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );
    saoPass = new SAOPass( scene, camera );
    saoPass.params.saoIntensity = 0.1;
    composer.addPass( saoPass );
    const outputPass = new OutputPass();
    composer.addPass( outputPass );

    /// controls ///
    controls = new OrbitControls(camera, renderer.domElement);
    // controls.addEventListener('change', render); // use if there is no animation loop
    controls.addEventListener('start', () => isDragging = true);
    controls.addEventListener('end', () => isDragging = false);
    controls.minDistance = 0.5;
    controls.maxDistance = 10;
    controls.target.set(0, 0.6, 0);
    controls.update();
    renderer.render(scene, camera);

    scene.background = new THREE.Color(0x444444);
    // skybox
    new RGBELoader()
        .setPath('assets/')

        .load('venice_sunset_1k.hdr', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;

            // scene.background = texture;
            scene.environment = texture;

            render();
        });

    // model
    const loader = new GLTFLoader().setPath('assets/');

    let draco = new DRACOLoader().setDecoderPath('assets/')
    draco.setDecoderConfig({type: 'js'});
    draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(draco)

    const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`
    let ktx2Loader = new KTX2Loader().setTranscoderPath(`${THREE_PATH}/examples/jsm/libs/basis/`);

    loader.setKTX2Loader(ktx2Loader.detectSupport(renderer))

    loader.load('KTM_SX_250_2023.glb', function (gltf) {
        model = gltf.scene as THREE.Group;
        scene.add(gltf.scene);

        render();
    });


    /// lighting ///

    const light = new THREE.AmbientLight(0xffffff);
    light.position.set(10, 10, 10);
    scene.add(light);

    const sun = new THREE.DirectionalLight(0xffffff);
    sun.position.set(10, 10, 10);
    scene.add(sun);

    // Init gui
    stats = new Stats();
    container.appendChild( stats.dom );

/*    const gui = new GUI();
    gui.add( saoPass.params, 'output', {
        'Default': SAOPass.OUTPUT.Default,
        'SAO Only': SAOPass.OUTPUT.SAO,
        'Normal': SAOPass.OUTPUT.Normal
    } ).onChange( function ( value ) {

        saoPass.params.output = value;

    } );
    gui.add( saoPass.params, 'saoBias', - 1, 1 );
    gui.add( saoPass.params, 'saoIntensity', 0, 1 );
    gui.add( saoPass.params, 'saoScale', 0, 10 );
    gui.add( saoPass.params, 'saoKernelRadius', 1, 100 );
    gui.add( saoPass.params, 'saoMinResolution', 0, 1 );
    gui.add( saoPass.params, 'saoBlur' );
    gui.add( saoPass.params, 'saoBlurRadius', 0, 200 );
    gui.add( saoPass.params, 'saoBlurStdDev', 0.5, 150 );
    gui.add( saoPass.params, 'saoBlurDepthCutoff', 0.0, 0.1 );
    gui.add( saoPass, 'enabled' );*/

/// test-geometry ///

    /*
        const boxGeometry = new THREE.Mesh(
            new THREE.BoxGeometry(100, 100, 100),
            new THREE.MeshBasicMaterial({color: 0xff0000})
        );
        scene.add(boxGeometry);
    */

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();
}

function animate() {
    requestAnimationFrame( animate );

    stats.begin();
    render();
    stats.end();
}

function render(): void {
    saoPass.enabled = !isDragging;
    composer.render();
}

init();
animate();

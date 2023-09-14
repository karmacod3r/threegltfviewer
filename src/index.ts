import * as THREE from 'three';

// (<any>window).THREE = THREE;
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {KTX2Loader} from "three/examples/jsm/loaders/KTX2Loader";
import {REVISION} from "three";

let camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer;

function init(): void {
// setup //
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

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

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render); // use if there is no animation loop
    controls.minDistance = 0.5;
    controls.maxDistance = 10;
    controls.target.set(0, 0.6, 0);
    controls.update();
    controls.update();
    renderer.render(scene, camera);

    scene.background = new THREE.Color(0x444444);
    // skybox
/*
        new RGBELoader()
            .setPath('assets/')

            .load('venice_sunset_1k.hdr', (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;

                // scene.background = texture;
                scene.environment = texture;

                render();
            });
*/

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

function render(): void {
    renderer.render(scene, camera);
}

init();

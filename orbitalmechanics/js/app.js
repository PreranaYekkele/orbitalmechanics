window.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('renderCanvas');
    var engine = new BABYLON.Engine(canvas, true);
    var scene = createScene();
    var simulationRunning = true;
    var speedFactor = 1;
    var earth;
    var axisMeshes = [];

    function createScene() {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3.Black();

        var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 20, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);

        earth = BABYLON.Mesh.CreateSphere("earth", 32, 10, scene);
        var earthMaterial = new BABYLON.StandardMaterial("earthMaterial", scene);
        earthMaterial.diffuseTexture = new BABYLON.Texture("assets/images/earth.jpg", scene);
        earth.material = earthMaterial;

        return scene;
    }

    function toggleAxis() {
        if (axisMeshes.length) {
            axisMeshes.forEach(mesh => mesh.dispose());
            axisMeshes = [];
        } else {
            createAxis(scene, 50);
        }
    }

    function createAxis(scene, size) {
        var makeAxis = function(size, color) {
            var axis = BABYLON.Mesh.CreateLines("axis", [ 
                BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), 
                new BABYLON.Vector3(size * 0.95, 0.05 * size, 0), 
                new BABYLON.Vector3(size, 0, 0), 
                new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
            ], scene);
            axis.color = color;
            return axis;
        };

        axisMeshes.push(makeAxis(size, new BABYLON.Color3(1, 0, 0))); // X axis in red
        axisMeshes.push(makeAxis(size, new BABYLON.Color3(0, 1, 0))); // Y axis in green
        axisMeshes.push(makeAxis(size, new BABYLON.Color3(0, 0, 1))); // Z axis in blue
    }

    window.toggleSimulation = function() {
        simulationRunning = !simulationRunning;
        console.log(simulationRunning ? "Simulation started" : "Simulation paused");
    };

    window.setSpeedFactor = function(factor) {
        speedFactor = factor;
        console.log(`Speed factor set to ${factor}x`);
    };

    engine.runRenderLoop(function () {
        if (simulationRunning) {
            scene.render();
            earth.rotation.y += 0.001 * speedFactor;
        }
    });

    window.addEventListener('resize', function () {
        engine.resize();
    });
});

function resetSimulation() {
    // Logic to reset the simulation
    console.log("Simulation reset");
}

function toggleVolume() {
    // Logic to toggle volume (currently just a placeholder)
    console.log("Volume toggled");
}

function showInfo() {
    // Logic to show information modal or panel
    console.log("Info displayed");
}

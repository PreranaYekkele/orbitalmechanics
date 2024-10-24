window.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('renderCanvas');
    var engine = new BABYLON.Engine(canvas, true);
    var scene = createScene();
    var simulationRunning = true;
    var speedFactor = 1;
    var earth;
    var orbits = [];

    function createScene() {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3.Black();

        var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 4, 20, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
        light.intensity = 0.75;

        earth = BABYLON.Mesh.CreateSphere("earth", 32, 10, scene);
        var earthMaterial = new BABYLON.StandardMaterial("earthMaterial", scene);
        earthMaterial.diffuseTexture = new BABYLON.Texture("assets/images/earth.jpg", scene);
        earth.material = earthMaterial;

        createAxis(50);  // Initialize axes on the scene
        return scene;
    }

    function createAxis(size) {
        // Generate axes in the scene for reference
        var axisX = BABYLON.MeshBuilder.CreateLines("axisX", {
            points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0)],
            colors: [new BABYLON.Color4(1, 0, 0, 1), new BABYLON.Color4(1, 0, 0, 1)]
        }, scene);
        var axisY = BABYLON.MeshBuilder.CreateLines("axisY", {
            points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0)],
            colors: [new BABYLON.Color4(0, 1, 0, 1), new BABYLON.Color4(0, 1, 0, 1)]
        }, scene);
        var axisZ = BABYLON.MeshBuilder.CreateLines("axisZ", {
            points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size)],
            colors: [new BABYLON.Color4(0, 0, 1, 1), new BABYLON.Color4(0, 0, 1, 1)]
        }, scene);
    }

    function addOrbit() {
        var orbitParams = {
            semiMajorAxis: parseFloat(document.getElementById('semiMajorAxis').value),
            eccentricity: parseFloat(document.getElementById('eccentricity').value),
            inclination: parseFloat(document.getElementById('inclination').value),
            argumentOfPeriapsis: parseFloat(document.getElementById('argumentOfPeriapsis').value),
            longitudeOfAscendingNode: parseFloat(document.getElementById('longitudeOfAscendingNode').value),
            trueAnomaly: parseFloat(document.getElementById('trueAnomaly').value)
        };

        var newOrbit = createOrbit(orbitParams);
        orbits.push(newOrbit);
        document.getElementById('orbitParameters').style.display = 'block';  // Display parameters panel upon adding an orbit
    }

    function createOrbit(params) {
        var path = calculateOrbitPath(params);
        var orbit = BABYLON.MeshBuilder.CreateLines("orbit", { points: path }, scene);
        orbit.color = new BABYLON.Color3(1, 1, 1);
        return orbit;
    }

    function calculateOrbitPath(params) {
        var path = [];
        var steps = 360;
        for (var i = 0; i <= steps; i++) {
            var angle = (i / steps) * 2 * Math.PI;
            var r = params.semiMajorAxis * (1 - params.eccentricity * params.eccentricity) / (1 + params.eccentricity * Math.cos(angle));
            var x = r * Math.cos(angle);
            var y = r * Math.sin(angle);
            path.push(new BABYLON.Vector3(x, 0, y));
        }
        return path;
    }

    function updateOrbit() {
        orbits.forEach((orbit, index) => {
            var params = {
                semiMajorAxis: parseFloat(document.getElementById('semiMajorAxis').value),
                eccentricity: parseFloat(document.getElementById('eccentricity').value),
                inclination: parseFloat(document.getElementById('inclination').value),
                argumentOfPeriapsis: parseFloat(document.getElementById('argumentOfPeriapsis').value),
                longitudeOfAscendingNode: parseFloat(document.getElementById('longitudeOfAscendingNode').value),
                trueAnomaly: parseFloat(document.getElementById('trueAnomaly').value)
            };
            var newPath = calculateOrbitPath(params);
            orbit = BABYLON.MeshBuilder.CreateLines("orbit", { points: newPath, instance: orbit });
        });
    }

    document.getElementById('semiMajorAxis').addEventListener('input', updateOrbit);
    document.getElementById('eccentricity').addEventListener('input', updateOrbit);
    document.getElementById('inclination').addEventListener('input', updateOrbit);
    document.getElementById('argumentOfPeriapsis').addEventListener('input', updateOrbit);
    document.getElementById('longitudeOfAscendingNode').addEventListener('input', updateOrbit);
    document.getElementById('trueAnomaly').addEventListener('input', updateOrbit);

    window.toggleSimulation = function() {
        simulationRunning = !simulationRunning;
        console.log(simulationRunning ? "Simulation started" : "Simulation paused");
    };

    window.setSpeedFactor = function(factor) {
        speedFactor = factor;
        console.log(`Speed factor set to ${factor}x`);
    };

    engine.runRenderLoop(function() {
        if (simulationRunning) {
            scene.render();
            earth.rotation.y += 0.001 * speedFactor;
        }
    });

    window.addEventListener('resize', function() {
        engine.resize();
    });
});

function resetSimulation() {
    
    location.reload();  
}

function toggleVolume() {
    console.log("Volume toggled");
}

function showInfo() {
    alert("Orbital Mechanics Visualization\nAdjust parameters to see changes.");
}

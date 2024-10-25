var scene;
var orbits = []; // Array to hold all the orbits
var simulationRunning = true;
var speedFactor = 1;
var earth;
var canvas = document.getElementById('renderCanvas');
var engine = new BABYLON.Engine(canvas, true);

window.addEventListener('DOMContentLoaded', function() {
    scene = createScene();
    document.getElementById('addOrbitButton').addEventListener('click', function() {
        const params = getOrbitParams();
        orbits.forEach((orbit, index) => updateOrbitVisualization(index, params));
        document.getElementById('orbitParameters').style.display = 'block';
    });
    setupParameterListeners();
    engine.runRenderLoop(function () {
        if (simulationRunning) {
            scene.render();
            earth.rotation.y += 0.001 * speedFactor;
        }
    });
    window.addEventListener('resize', function() {
        engine.resize();
    });
});

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

function getOrbitParams() {
    return {
        name: document.getElementById('orbitName').value,
        semiMajorAxis: parseFloat(document.getElementById('semiMajorAxis').value),
        eccentricity: parseFloat(document.getElementById('eccentricity').value),
        inclination: parseFloat(document.getElementById('inclination').value),
        argumentOfPeriapsis: parseFloat(document.getElementById('argumentOfPeriapsis').value),
        longitudeOfAscendingNode: parseFloat(document.getElementById('longitudeOfAscendingNode').value),
        trueAnomaly: parseFloat(document.getElementById('trueAnomaly').value)
    };
}

function updateOrbitVisualization(orbitIndex, params) {
    if (orbits[orbitIndex]) {
        orbits[orbitIndex].dispose(); // Dispose of the current orbit visualization if it exists
    }

    orbits[orbitIndex] = createOrbit(params, orbitIndex);
}

function createOrbit(params, orbitIndex) {
    var path = calculateOrbitPath(params, orbitIndex);
    var orbit = BABYLON.MeshBuilder.CreateLines("orbit" + orbitIndex, { points: path }, scene);
    switch (orbitIndex) {
        case 0: // White orbit
            orbit.color = new BABYLON.Color3(1, 1, 1);
            break;
        case 1: // Green orbit
            orbit.color = new BABYLON.Color3(0, 1, 0);
            break;
        case 2: // Blue orbit
            orbit.color = new BABYLON.Color3(0, 0, 1);
            break;
    }
    return orbit;
}

function calculateOrbitPath(params, orbitIndex) {
    var path = [];
    var steps = 360;
    var radiansPerStep = (2 * Math.PI) / steps;

    for (var i = 0; i <= steps; i++) {
        var angle = radiansPerStep * i;
        var r = params.semiMajorAxis * (1 - params.eccentricity * params.eccentricity) / (1 + params.eccentricity * Math.cos(angle));
        var x = r * Math.cos(angle);
        var y = r * Math.sin(angle);
        var z = 0; // For simplicity in this example

        if (orbitIndex === 0) {
            // No additional transformations for the white orbit
        } else if (orbitIndex === 1) {
            // Apply inclination transformation for the green orbit
            var inclinedY = y * Math.cos(params.inclination);
            z = y * Math.sin(params.inclination);
            y = inclinedY;
        } else if (orbitIndex === 2) {
            // Apply longitude of ascending node transformation for the blue orbit
            var cosLAN = Math.cos(params.longitudeOfAscendingNode);
            var sinLAN = Math.sin(params.longitudeOfAscendingNode);
            var tempX = x * cosLAN - y * sinLAN;
            y = x * sinLAN + y * cosLAN;
            x = tempX;
        }

        path.push(new BABYLON.Vector3(x, y, z));
    }

    return path;
}

function setupParameterListeners() {
    ['semiMajorAxis', 'eccentricity', 'argumentOfPeriapsis', 'trueAnomaly'].forEach(param => {
        document.getElementById(param).addEventListener('input', () => updateOrbitVisualization(0, getOrbitParams()));
    });
    document.getElementById('inclination').addEventListener('input', () => updateOrbitVisualization(1, getOrbitParams()));
    document.getElementById('longitudeOfAscendingNode').addEventListener('input', () => updateOrbitVisualization(2, getOrbitParams()));
}


window.resetSimulation = function() {
    location.reload();
};

window.toggleSimulation = function() {
    simulationRunning = !simulationRunning;
    console.log(simulationRunning ? "Simulation started" : "Simulation paused");
};

window.setSpeedFactor = function(factor) {
    speedFactor = factor;
    console.log(`Speed factor set to ${factor}x`);
};


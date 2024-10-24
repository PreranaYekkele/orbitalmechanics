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
        addOrbit(getOrbitParams());
        document.getElementById('orbitParameters').style.display = 'block';
    });

    setupEventListeners(); // Setup listeners for orbit parameters

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

function setupEventListeners() {
    document.querySelectorAll('.orbit-param').forEach(input => {
        input.addEventListener('input', updateOrbit);
    });
}

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

function addOrbit(params) {
    var newOrbit = createOrbit(params);
    orbits.push(newOrbit);
}

function updateOrbit() {
    orbits.forEach((orbit, index) => {
        orbit.dispose(); // Remove current orbit
        orbits[index] = createOrbit(getOrbitParams()); // Recreate orbit with updated parameters
    });
}

function createOrbit(params) {
    var path = calculateOrbitPath(params);
    var orbit = BABYLON.MeshBuilder.CreateLines("orbit", { points: path }, scene);
    orbit.color = new BABYLON.Color3(1, 1, 1);
    return orbit;
}

function calculateOrbitPath(params) {
    var path = [];
    var steps = 360; // The number of points to calculate the ellipse
    for (var i = 0; i <= steps; i++) {
        var angle = (i / steps) * 2 * Math.PI;
        var r = params.semiMajorAxis * (1 - params.eccentricity * params.eccentricity) / (1 + params.eccentricity * Math.cos(angle));
        var x = r * Math.cos(angle);
        var y = r * Math.sin(angle);
        path.push(new BABYLON.Vector3(x, 0, y));
    }
    return path;
}

function resetSimulation() {
    console.log("Simulation reset");
    location.reload();  // Simplest way to reset everything
}

function toggleVolume() {
    console.log("Volume toggled");
}

function showInfo() {
    alert("Orbital Mechanics Visualization\nAdjust parameters to see changes.");
}

window.toggleSimulation = function() {
    simulationRunning = !simulationRunning;
    console.log(simulationRunning ? "Simulation started" : "Simulation paused");
};

window.setSpeedFactor = function(factor) {
    speedFactor = factor;
    console.log(`Speed factor set to ${factor}x`);
};

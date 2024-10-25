var scene;
var orbits = []; // Array to hold all the orbits
var simulationRunning = true;
var speedFactor = 1;
var earth;
var canvas = document.getElementById('renderCanvas');
var engine = new BABYLON.Engine(canvas, true);
let orbitPlane = null;


// New global variables for launch feature
var launchStations = [];
var satellites = [];
var selectedLaunchStation = null;

// Constants
const EARTH_RADIUS = 5; // Earth radius in scene units
const G = 6.67430e-11; // Gravitational constant
const EARTH_MASS = 5.972e24; // Earth mass in kg

// window.addEventListener('DOMContentLoaded', function() {
//     scene = createScene();
//     document.getElementById('addOrbitButton').addEventListener('click', function() {
//         const params = getOrbitParams();
//         orbits.forEach((orbit, index) => updateOrbitVisualization(index, params));
//         document.getElementById('orbitParameters').style.display = 'block';
//     });
//     setupParameterListeners();
//     engine.runRenderLoop(function () {
//         if (simulationRunning) {
//             scene.render();
//             earth.rotation.y += 0.001 * speedFactor;
//         }
//     });
//     window.addEventListener('resize', function() {
//         engine.resize();
//     });
// });

window.addEventListener('DOMContentLoaded', function() {
    scene = createScene();
    setupEventListeners();
    engine.runRenderLoop(function () {
        if (simulationRunning) {
            updateSimulation();
            scene.render();
            earth.rotation.y += 0.001 * speedFactor;
        }
    });
    window.addEventListener('resize', function() {
        engine.resize();
    });
});

function setupEventListeners() {
    document.getElementById('addOrbitButton').addEventListener('click', function() {
        const params = getOrbitParams();
        orbits.forEach((orbit, index) => updateOrbitVisualization(index, params));
        document.getElementById('orbitParameters').style.display = 'block';
    });
    
    document.getElementById('addlaunchButton').addEventListener('click', function(event) {
        event.stopPropagation();

        const launchName = document.getElementById('launchName').value;
        if (launchName) {
            createLaunchStation(launchName);
        }

    });
    
    document.getElementById('fire').addEventListener('click', launchSatellite);
    
    setupParameterListeners();
}

function createLaunchStation(name) {
    const omega = parseFloat(document.getElementById('omega').value) || 0;
    const phi = parseFloat(document.getElementById('phi').value) || 0;
    const lambda = parseFloat(document.getElementById('lambda').value) || 0;

    // Convert spherical coordinates to Cartesian
    const theta = (90 - phi) * (Math.PI / 180);
    const lon = lambda * (Math.PI / 180);
    
    const position = new BABYLON.Vector3(
        EARTH_RADIUS * Math.sin(theta) * Math.cos(lon),
        EARTH_RADIUS * Math.cos(theta),
        EARTH_RADIUS * Math.sin(theta) * Math.sin(lon)
    );

    // Create launch station visualization
    const station = BABYLON.MeshBuilder.CreateBox(name, {
        height: 0.2,
        width: 0.2,
        depth: 0.2
    }, scene);
    
    station.position = position;
    station.rotation = new BABYLON.Vector3(0, lon, theta);

    // Create material for the launch station
    const material = new BABYLON.StandardMaterial(name + "_material", scene);
    material.diffuseColor = new BABYLON.Color3(1, 0, 0);
    station.material = material;

    const launchStation = {
        name: name,
        mesh: station,
        position: position,
        omega: omega,
        phi: phi,
        lambda: lambda
    };

    launchStations.push(launchStation);
    selectedLaunchStation = launchStation;

    if(!orbitPlane){
        createFilledOrbit();
    }
    updateFilledOrbit();
    
    updateLaunchInfo();
    document.getElementById('launchSection').style.display = 'block';
    return launchStation;

}

function launchSatellite() {
    if (!selectedLaunchStation) return;

    // Get launch parameters
    const radialDv = parseFloat(document.querySelector('td:first-child').textContent) || 0;
    const normalDv = parseFloat(document.querySelector('td:nth-child(2)').textContent) || 0;
    const tangentialDv = parseFloat(document.querySelector('td:nth-child(3)').textContent) || 0;

    // Create satellite visualization
    const satellite = BABYLON.MeshBuilder.CreateSphere("satellite", {
        diameter: 0.2
    }, scene);

    // Position satellite at launch station
    satellite.position = selectedLaunchStation.position.clone();

    // Calculate initial velocity components
    const escapeVelocity = Math.sqrt(2 * G * EARTH_MASS / (EARTH_RADIUS * 1000));
    const initialVelocity = new BABYLON.Vector3(
        radialDv * escapeVelocity,
        normalDv * escapeVelocity,
        tangentialDv * escapeVelocity
    );

    // Create material for the satellite
    const material = new BABYLON.StandardMaterial("satellite_material", scene);
    material.diffuseColor = new BABYLON.Color3(0, 1, 0);
    satellite.material = material;

    // Add satellite to tracking array
    satellites.push({
        mesh: satellite,
        velocity: initialVelocity,
        trail: []
    });
}

function updateSimulation() {
    const dt = 0.016 * speedFactor; // Time step

    satellites.forEach(satellite => {
        // Update position based on velocity
        satellite.mesh.position.addInPlace(satellite.velocity.scale(dt));

        // Calculate gravitational force
        const distanceVector = satellite.mesh.position.clone();
        const distance = distanceVector.length();
        const forceMagnitude = G * EARTH_MASS / (distance * distance);
        const force = distanceVector.normalize().scale(-forceMagnitude);

        // Update velocity based on gravitational force
        satellite.velocity.addInPlace(force.scale(dt));

        // Update trail
        satellite.trail.push(satellite.mesh.position.clone());
        if (satellite.trail.length > 100) {
            satellite.trail.shift();
        }

        // Update trail visualization
        if (satellite.trailMesh) {
            satellite.trailMesh.dispose();
        }
        satellite.trailMesh = BABYLON.MeshBuilder.CreateLines("trail", {
            points: satellite.trail
        }, scene);
        satellite.trailMesh.color = new BABYLON.Color3(0, 1, 0);
    });
}

function updateLaunchInfo() {
    if (!selectedLaunchStation) return;

    const height = 0;
    const velocity = Math.sqrt(G * EARTH_MASS / (EARTH_RADIUS * 1000 + height));
    const acceleration = G * EARTH_MASS / Math.pow(EARTH_RADIUS * 1000 + height, 2);

    document.querySelector('#launchInfo .left-part').textContent = `h=${height.toFixed(4)}km`;
    document.querySelector('#launchInfo .right-part').textContent = 'a=${acceleration.toFixed(4)}g';
    document.querySelector('#launchInfo:nth-child(5) .left-part').textContent = 'v=${velocity.toFixed(2)}m/s';
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
    ['omega', 'phi', 'lambda'].forEach(param => {
        document.getElementById(param).addEventListener('input', updateFilledOrbit);
    });
}

function createFilledOrbit() {
    // Dispose the previous orbit plane if it exists
    if (orbitPlane) orbitPlane.dispose();

    // Create a disc with a radius (adjustable)
    orbitPlane = BABYLON.MeshBuilder.CreateDisc("orbitPlane", {
        radius: 40,  // Adjust this radius as per the orbit size you want
        tessellation: 64,  // Smoothness of the disc
        sideOrientation: BABYLON.Mesh.DOUBLESIDE  // Show both sides
    }, scene);

    // Create a green material for the filled plane
    const orbitMaterial = new BABYLON.StandardMaterial("orbitMaterial", scene);
    orbitMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);  // Green color
    orbitMaterial.alpha = 0.5;  // Make it semi-transparent if needed
    orbitPlane.material = orbitMaterial;

    // Initial position of the plane (near the Earth)
    orbitPlane.position = new BABYLON.Vector3(0, EARTH_RADIUS + 5, 0);
}

function updateFilledOrbit() {
    if (!orbitPlane) return;  // If the orbit plane is not created yet

    const omega = parseFloat(document.getElementById('omega').value) || 0;
    const phi = parseFloat(document.getElementById('phi').value) || 0;
    const lambda = parseFloat(document.getElementById('lambda').value) || 0;

    // Convert to radians
    const omegaRad = omega * (Math.PI / 180);
    const phiRad = phi * (Math.PI / 180);
    const lambdaRad = lambda * (Math.PI / 180);

    // Apply rotations based on omega, phi, and lambda to tilt the filled orbit
    orbitPlane.rotation.x = phiRad;    // Pitch
    orbitPlane.rotation.y = lambdaRad; // Yaw
    orbitPlane.rotation.z = omegaRad;  // Roll

    // Optionally adjust position if needed, but keeping it near the Earth
    orbitPlane.position = selectedLaunchStation ? selectedLaunchStation.position.clone() : new BABYLON.Vector3(0, EARTH_RADIUS + 1, 0);
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

window.toggleLaunchElements = function() {
    const launchSection = document.getElementById('launchSection');
    const controlTable = document.getElementById('control-table');
    
    if (launchSection.style.display === 'none') {
        launchSection.style.display = 'block';
        controlTable.style.display = 'block';
    } 
};

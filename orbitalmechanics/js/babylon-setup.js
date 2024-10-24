function createOrbit(scene, semiMajorAxis, eccentricity) {
    var points = [];
    var numPoints = 100; // Number of points in the path
    var a = semiMajorAxis;
    var b = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity); // Semi-minor axis

    for (var i = 0; i < numPoints; i++) {
        var angle = (2 * Math.PI * i) / numPoints;
        var x = a * Math.cos(angle);
        var z = b * Math.sin(angle);
        points.push(new BABYLON.Vector3(x, 0, z));
    }

    var path3D = new BABYLON.Path3D(points);
    var curve = path3D.getCurve();
    var orbit = BABYLON.MeshBuilder.CreateLines("orbit", {points: curve}, scene);
    return orbit;
}


window.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('renderCanvas');
    var engine = new BABYLON.Engine(canvas, true);

    var createScene = function() {
        var scene = new BABYLON.Scene(engine);
        var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

        // Additional elements like spheres or paths for orbits can be added here
        

        return scene;
    };

    var scene = createScene();

    engine.runRenderLoop(function() {
        scene.render();
    });

    window.addEventListener('resize', function() {
        engine.resize();
    });
});


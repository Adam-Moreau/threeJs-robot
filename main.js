import * as THREE from 'three';

// Get the canvas element
const canvas = document.querySelector('.webgl');

// Create a new Three.js scene
const scene = new THREE.Scene();

// Function to convert degrees to radians
const degreesToRadians = (degrees) => {
    return degrees * (Math.PI / 180);
}

// Object to store the canvas size
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Function to generate random numbers
const random = (min, max, float = false) => {
    const val = Math.random() * (max - min) + min;

    if (float) {
        return val;
    }

    return Math.floor(val);
}

// Create a WebGL renderer and attach it to the canvas
const renderer = new THREE.WebGLRenderer({ canvas });

// Function to handle rendering
const render = () => {
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.render(scene, camera);
}

// Create a perspective camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.x = 0.5;
camera.position.z = 5;
scene.add(camera);

// Listen for window resize events and update camera aspect ratio
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
});

// Create a material
const material = new THREE.MeshLambertMaterial({ color: 0xffffff });

// Create ambient light
const lightAmbient = new THREE.AmbientLight(0x9eaeff, 0.5);
scene.add(lightAmbient);

// Create directional light
const lightDirectional = new THREE.DirectionalLight(0xffffff, 0.8);
scene.add(lightDirectional);
lightDirectional.position.set(5, 5, 5);

// Define a class for the figure
class Figure {
    constructor(params) {
        this.params = {
            x: 0,
            y: 0,
            z: 0,
            ry: 0, // Initial rotation around Y-axis
            targetRotation: 0, // Desired rotation around Y-axis
            armRotation: 0, // Desired rotation of arms
            ...params
        }

        // Create a group for the figure and add it to the scene
        this.group = new THREE.Group();
        scene.add(this.group);

        // Set the initial position according to params
        this.group.position.x = this.params.x;
        this.group.position.y = this.params.y;
        this.group.position.z = this.params.z;

        // Material settings for the head
        this.headHue = random(0, 360);
        this.headLightness = random(40, 65);
        this.headMaterial = new THREE.MeshLambertMaterial({ color: `hsl(${this.headHue}, 30%, ${this.headLightness}%)` });

        // Material settings for the body
        this.bodyHue = random(0, 360);
        this.bodyMaterial = new THREE.MeshLambertMaterial({ color: `hsl(${this.bodyHue}, 85%, 50%)` });

        this.arms = [];
    }

    // Method to create the body
    createBody() {
        this.body = new THREE.Group();
        const geometry = new THREE.BoxGeometry(1, 1.5, 1);
        const bodyMain = new THREE.Mesh(geometry, this.bodyMaterial);

        this.body.add(bodyMain);
        this.group.add(this.body);

        this.createLegs();
    }

    // Method to create the head
    createHead() {
        this.head = new THREE.Group();
        const geometry = new THREE.SphereGeometry(0.8, 32, 16);
        const headMain = new THREE.Mesh(geometry, this.headMaterial);
        this.head.add(headMain);

        this.group.add(this.head);
        this.head.position.y = 1.65;

        this.createEyes();
    }

    // Method to create the arms
    createArms() {
        const height = 0.85;
        const armSpacing1 = 0.1; // Adjust this value to control the space for Arm 1
        const armSpacing2 = 0.1; // Adjust this value to control the space for Arm 2
    
        for (let i = 0; i < 2; i++) {
            const armGroup = new THREE.Group();
            const geometry = new THREE.BoxGeometry(0.25, height, 0.25);
            const arm = new THREE.Mesh(geometry, this.headMaterial);
            const m = i % 2 === 0 ? 1 : -1;
    
            armGroup.add(arm);
            this.body.add(armGroup);
    
            // Adjust the position of each arm independently
            if (i === 0) {
                arm.position.y = height * -0.5 - armSpacing1; // Space for Arm 1
            } else {
                arm.position.y = height * -0.5 - armSpacing2; // Space for Arm 2
            }
    
            armGroup.position.x = m * 0.8;
            armGroup.position.y = 0.6;
    
            armGroup.rotation.z = degreesToRadians(30 * m);
            console.log(`Arm ${i + 1} position: x=${armGroup.position.x}, y=${armGroup.position.y}, z=${armGroup.position.z}`);
    
            this.arms.push(armGroup);
        }
    }
    


    // Method to create the eyes
    createEyes() {
        const eyes = new THREE.Group();
        const geometry = new THREE.SphereGeometry(0.15, 12, 8);
        const material = new THREE.MeshLambertMaterial({ color: 0x44445c });

        for (let i = 0; i < 2; i++) {
            const eye = new THREE.Mesh(geometry, material);
            const m = i % 2 === 0 ? 1 : -1;

            eyes.add(eye);
            eye.position.x = 0.36 * m;
        }

        this.head.add(eyes);

        eyes.position.y = -0.1;
        eyes.position.z = 0.7;
    }

    // Method to create the legs
    createLegs() {
        const geometry = new THREE.CylinderGeometry(0.20, 0.12, 0.75);
        const legSpacing = 0.3; // Adjust this value to control the space between legs

        for (let i = 0; i < 2; i++) {
            const leg = new THREE.Mesh(geometry, this.headMaterial);
            const m = i % 2 === 0 ? 1 : -1;

            leg.position.x = m * 0.30; // Keep this value as-is for horizontal spacing

            this.group.add(leg);
            leg.position.y = -1 - legSpacing; // Adjust the position to add space

            this.body.add(leg);
        }
    }



    // Method to animate the figure's bounce
    bounce() {
        this.group.rotation.y = this.params.ry;
        this.group.position.y = this.params.y;
        this.arms.forEach((arm, index) => {
            const m = index % 2 === 0 ? 1 : -1;
            arm.rotation.z = this.params.armRotation * m;
        });
    }

    // Method to set the direction of the figure
    direction() {
        // Set the rotation around Y-axis to the desired target rotation
        this.group.rotation.y = this.params.targetRotation;

        // You can also update other properties like position if needed
        this.group.position.y = this.params.y;
    }

    // Method to initialize the figure
    init() {
        this.createBody();
        this.createHead();
        this.createArms();
    }
}

// Create a new Figure instance
const figure = new Figure();
figure.init(); // Initialize the figure immediately

let isAnimating = false; // Flag to track animation state

// Listen for keyboard events
document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && !isAnimating) { // Check if not already animating
        isAnimating = true; // Set the flag to true to block further animations

        const timeline = gsap.timeline({ repeat: 1, yoyo: true });
        // Animation for 'y' (position)

        timeline.to(figure.params, {
            y: 1.5,
            armRotation: degreesToRadians(90),
            duration: 0.3,
            onComplete: () => {
                // Set the arms back to their original position
                const armReturnTimeline = gsap.timeline();
                armReturnTimeline.to(figure.params, {
                    armRotation: degreesToRadians(0), // Return arms to original rotation
                    duration: 0.3,
                    onComplete: () => {
                        isAnimating = false; // Set the flag to false when animation completes
                    },
                });
            },
        });
    }

    if (event.code === "ArrowLeft") {
        const maxLeftRotation = degreesToRadians(-90); // Define the maximum left rotation angle
        if (figure.params.ry > maxLeftRotation) {
            const timeline = gsap.timeline({ repeat: 0 });

            // Calculate the new rotation angle
            const newRotation = Math.max(figure.params.ry + degreesToRadians(-90), maxLeftRotation);

            // Animation for 'ry' (rotation around the y-axis) with ease
            timeline.to(figure.params, {
                ry: newRotation,
                duration: 0.1,
                ease: "power2.out", // Use an easing function for smoother transitions
                onUpdate: () => {
                    // Update the renderer to see the changes
                    render();
                },
            });
        }
    }

    if (event.code === "ArrowRight") {
        const maxRightRotation = degreesToRadians(90); // Define the maximum right rotation angle
        if (figure.params.ry < maxRightRotation) {
            const timeline = gsap.timeline({ repeat: 0 });

            // Calculate the new rotation angle
            const newRotation = Math.min(figure.params.ry + degreesToRadians(90), maxRightRotation);

            // Animation for 'ry' (rotation around the y-axis) with ease
            timeline.to(figure.params, {
                ry: newRotation,
                duration: 0.1,
                ease: "power2.out", // Use an easing function for smoother transitions
                onUpdate: () => {
                    // Update the renderer to see the changes
                    render();
                },
            });
        }
    }


});

// Add a ticker to continuously update the figure's direction and bounce
gsap.ticker.add(() => {
    figure.direction();
    figure.bounce();
    render();
});

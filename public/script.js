document.addEventListener('DOMContentLoaded', () => {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const symbols = data.symbols;
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth * 0.9, window.innerHeight * 0.8); // 90% width, 80% height
            document.getElementById('soot-3d').appendChild(renderer.domElement);

            // Add lights
            const ambientLight = new THREE.AmbientLight(0x404040);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(0, 1, 0);
            scene.add(directionalLight);

            // Create 3D objects for symbols
            const symbolObjects = symbols.map(symbol => {
                const geometry = new THREE.SphereGeometry(0.5, 32, 32);
                const textureLoader = new THREE.TextureLoader();
                const material = new THREE.MeshBasicMaterial({
                    map: textureLoader.load(symbol.image_url),
                    transparent: true
                });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10);
                mesh.userData = { symbol: symbol };
                scene.add(mesh);
                return mesh;
            });

            // Physics simulation for spatial layout (simple repulsion)
            function updatePositions() {
                symbolObjects.forEach(obj => {
                    symbolObjects.forEach(other => {
                        if (obj !== other) {
                            const dx = obj.position.x - other.position.x;
                            const dy = obj.position.y - other.position.y;
                            const dz = obj.position.z - other.position.z;
                            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                            if (distance < 2) {
                                const force = 0.1 * (2 - distance) / distance;
                                obj.position.x += force * dx;
                                obj.position.y += force * dy;
                                obj.position.z += force * dz;
                            }
                        }
                    });
                });
            }

            // Camera controls
            camera.position.z = 15;
            const controls = new THREE.OrbitControls(camera, renderer.domElement);

            // Add details popup
            const details = d3.select('body').append('div')
                .attr('class', 'details');

            // Raycaster for interaction
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();

            function onMouseMove(event) {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            }

            function onClick(event) {
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(symbolObjects);
                if (intersects.length > 0) {
                    const symbol = intersects[0].object.userData.symbol;
                    details.style('display', 'block')
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 10) + 'px')
                        .html(`
                            <h3>${symbol.symbol_name}</h3>
                            <p>Type: ${symbol.type}</p>
                            <p>Ideology: ${symbol.ideology}</p>
                            <p>Color: ${symbol.layers.color || 'N/A'}</p>
                            <p>Origin: ${symbol.origin_story}</p>
                        `);
                }
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('click', onClick);

            details.on('mouseleave', () => details.style('display', 'none'));

            // Filter and search functionality
            const searchInput = document.getElementById('search-input');
            const filterType = document.getElementById('filter-type');
            const filterIdeology = document.getElementById('filter-ideology');

            function filterAndUpdate() {
                let filtered = symbols;
                const searchTerm = searchInput.value.toLowerCase();

                if (searchTerm) {
                    filtered = filtered.filter(d =>
                        d.symbol_name.toLowerCase().includes(searchTerm) ||
                        d.type.toLowerCase().includes(searchTerm) ||
                        d.ideology.toLowerCase().includes(searchTerm) ||
                        (d.layers.color && d.layers.color.toLowerCase().includes(searchTerm))
                    );
                }

                if (filterType.value) {
                    filtered = filtered.filter(d => d.type === filterType.value);
                }

                if (filterIdeology.value) {
                    filtered = filtered.filter(d => d.ideology === filterIdeology.value);
                }

                // Update 3D objects
                symbolObjects.forEach((obj, i) => {
                    if (filtered.some(f => f.symbol_id === obj.userData.symbol.symbol_id)) {
                        obj.visible = true;
                    } else {
                        obj.visible = false;
                    }
                });
            }

            searchInput.addEventListener('input', filterAndUpdate);
            filterType.addEventListener('change', filterAndUpdate);
            filterIdeology.addEventListener('change', filterAndUpdate);

            // Animation loop
            function animate() {
                requestAnimationFrame(animate);
                updatePositions();
                controls.update();
                renderer.render(scene, camera);
            }
            animate();

            // Handle window resize
            window.addEventListener('resize', () => {
                renderer.setSize(window.innerWidth * 0.9, window.innerHeight * 0.8);
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
            });
        })
        .catch(error => console.error('Error loading data:', error));
});

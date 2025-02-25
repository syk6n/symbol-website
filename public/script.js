document.addEventListener('DOMContentLoaded', () => {
    const symbolContainer = document.getElementById('symbol-container');
    const searchBox = document.getElementById('search-box');
    const categoryButtons = document.querySelectorAll('.category-button');

    let symbolsData = [];  // Store the fetched data
    let visibleSymbols = []; // Store currently visible symbols

    // Fetch data from JSON file
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            symbolsData = data.symbols;
            visibleSymbols = [...symbolsData]; // Initially, show all symbols

            renderSymbols();  // Render initial set of symbols

            // Event listener for category buttons
            categoryButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Remove active class from other buttons
                    categoryButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');

                    const category = button.dataset.category;
                    if (category === 'overview') {
                        visibleSymbols = [...symbolsData]; // Show all
                    } else if (category === 'name') {
                        visibleSymbols = symbolsData.filter(symbol => symbol.symbol_name); // filter by name
                    }
                    else {
                        visibleSymbols = symbolsData.filter(symbol => symbol.type === category); //Example
                    }

                    renderSymbols(); // Re-render symbols based on the filter
                });
            });

            // Search functionality (basic)
            searchBox.addEventListener('input', () => {
                const searchTerm = searchBox.value.toLowerCase();
                visibleSymbols = symbolsData.filter(symbol =>
                    symbol.symbol_name.toLowerCase().includes(searchTerm) ||
                    symbol.type.toLowerCase().includes(searchTerm) ||  //Search Type
                    symbol.ideology.toLowerCase().includes(searchTerm) //Search Ideology
                );
                renderSymbols();
            });

        })
        .catch(error => console.error('Error fetching data:', error));

    // Function to render symbols in the container
    function renderSymbols() {
        symbolContainer.innerHTML = '';  // Clear existing symbols

        visibleSymbols.forEach(symbol => {
            const symbolDiv = document.createElement('div');
            symbolDiv.className = 'symbol';
            symbolDiv.draggable = true;  // Make it draggable

            symbolDiv.innerHTML = `
                <img src="${symbol.image_url}" alt="${symbol.symbol_name}">
                <h3>${symbol.symbol_name}</h3>
            `;

            // Random positioning (Sootworld style)
            const randomX = Math.random() * 80; // Adjust range as needed (percentage)
            const randomY = Math.random() * 80; // Adjust range as needed
            symbolDiv.style.left = `${randomX}%`;
            symbolDiv.style.top = `${randomY}%`;

            symbolContainer.appendChild(symbolDiv);

            // Drag and drop event listeners
            let isDragging = false;
            let offsetX = 0;
            let offsetY = 0;

            symbolDiv.addEventListener('dragstart', (e) => {
                isDragging = true;
                symbolDiv.classList.add('dragging');
                offsetX = e.clientX - symbolDiv.offsetLeft;
                offsetY = e.clientY - symbolDiv.offsetTop;
            });

            symbolDiv.addEventListener('dragend', () => {
                isDragging = false;
                symbolDiv.classList.remove('dragging');
            });

            symbolContainer.addEventListener('dragover', (e) => {
                e.preventDefault(); // Necessary to allow dropping
            });

            symbolContainer.addEventListener('drop', (e) => {
                if (isDragging) {
                    symbolDiv.style.left = (e.clientX - offsetX - symbolContainer.offsetLeft) + 'px';
                    symbolDiv.style.top = (e.clientY - offsetY - symbolContainer.offsetTop) + 'px';
                }
            });
        });
    }
});

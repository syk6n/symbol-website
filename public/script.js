document.addEventListener('DOMContentLoaded', () => {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const symbols = data.symbols;
            const parties = data.parties;
            const timelineEvents = data.timelineEvents;

            // Symbol Library
            const symbolGrid = document.getElementById('symbol-grid');
            symbols.forEach(symbol => {
                const card = document.createElement('div');
                card.className = 'symbol-card';
                card.innerHTML = `
                    <img src="${symbol.image_url}" alt="${symbol.symbol_name}" style="max-width: 100%;">
                    <h3>${symbol.symbol_name}</h3>
                    <p>Type: ${symbol.type}</p>
                    <p>Region: ${symbol.region}</p>
                    <p>Ideology: ${symbol.ideology}</p>
                    <a href="#deconstruct" onclick="deconstructSymbol(${symbol.symbol_id})">Deconstruct</a>
                `;
                symbolGrid.appendChild(card);
            });

            // Comparison Feature
            const compareGrid = document.getElementById('compare-grid');
            const typeFilter = document.getElementById('symbol-filter-type');
            const regionFilter = document.getElementById('symbol-filter-region');
            const ideologyFilter = document.getElementById('symbol-filter-ideology');

            function filterSymbols() {
                compareGrid.innerHTML = '';
                symbols.filter(symbol => 
                    (!typeFilter.value || symbol.type === typeFilter.value) &&
                    (!regionFilter.value || symbol.region === regionFilter.value) &&
                    (!ideologyFilter.value || symbol.ideology === ideologyFilter.value)
                ).forEach(symbol => {
                    const card = document.createElement('div');
                    card.className = 'compare-card';
                    card.innerHTML = `
                        <input type="checkbox" name="compare" value="${symbol.symbol_id}">
                        <img src="${symbol.image_url}" alt="${symbol.symbol_name}" style="max-width: 100%;">
                        <h3>${symbol.symbol_name}</h3>
                        <p>Type: ${symbol.type}</p>
                        <p>Region: ${symbol.region}</p>
                        <p>Ideology: ${symbol.ideology}</p>
                    `;
                    compareGrid.appendChild(card);
                });
            }

            typeFilter.addEventListener('change', filterSymbols);
            regionFilter.addEventListener('change', filterSymbols);
            ideologyFilter.addEventListener('change', filterSymbols);
            filterSymbols();

            // Symbol Deconstructor
            const deconstructSelect = document.getElementById('deconstruct-symbol');
            symbols.forEach(symbol => {
                const option = document.createElement('option');
                option.value = symbol.symbol_id;
                option.textContent = symbol.symbol_name;
                deconstructSelect.appendChild(option);
            });

            window.deconstructSymbol = function(symbolId) {
                const symbol = symbols.find(s => s.symbol_id === symbolId);
                const details = document.getElementById('deconstruct-details');
                details.innerHTML = `
                    <h3>${symbol.symbol_name}</h3>
                    <img src="${symbol.image_url}" alt="${symbol.symbol_name}" style="max-width: 100%;">
                    <h4>Layers:</h4>
                    <ul>
                        ${Object.entries(symbol.layers).map(([key, value]) => `<li>${key}: ${value.meaning || value}</li>`).join('')}
                    </ul>
                    <p>Origin Story: ${symbol.origin_story}</p>
                    <p>Cultural Adaptation: ${symbol.cultural_adaptation}</p>
                    <p>Evolution Notes: ${symbol.evolution_notes}</p>
                `;
            };

            // Party Evolution Timeline
            const timelineSlider = document.getElementById('timeline-slider');
            const timelineEventsDiv = document.getElementById('timeline-events');

            function updateTimeline(year) {
                timelineEventsDiv.innerHTML = '';
                timelineEvents.filter(event => event.year <= year).forEach(event => {
                    const symbol = symbols.find(s => s.symbol_id === event.symbol_id);
                    const party = parties.find(p => p.party_id === event.party_id);
                    const eventDiv = document.createElement('div');
                    eventDiv.className = 'timeline-event';
                    eventDiv.style.left = `${((event.year - 1950) / (2025 - 1950)) * 100}%`;
                    eventDiv.innerHTML = `
                        <img src="${event.icon_url}" alt="${event.event_description}">
                        <p>${event.year}<br>${party.party_name}: ${event.event_description}</p>
                    `;
                    timelineEventsDiv.appendChild(eventDiv);
                });
            }

            timelineSlider.addEventListener('input', () => updateTimeline(parseInt(timelineSlider.value)));
            updateTimeline(1950);
        })
        .catch(error => console.error('Error loading data:', error));
});
// Initialize the map
const map = L.map('map').setView([30.7333, 76.7794], 13);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Define attraction types and colors
const attractionTypes = {
    restaurant: { icon: 'utensils', color: '#e63946' },
    historical: { icon: 'landmark', color: '#f77f00' },
    toilet: { icon: 'toilet', color: '#6a4c93' },
    shopping: { icon: 'shopping-bag', color: '#457b9d' },
    museum: { icon: 'university', color: '#588157' },
    religious: { icon: 'pray', color: '#9d4edd' },
    park: { icon: 'tree', color: '#2a9d8f' }
};

// Create custom icon function
function createCustomIcon(type) {
    return L.divIcon({
        className: 'custom-icon',
        html: `
            <div style="
                background: ${attractionTypes[type].color};
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 16px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                border: 2px solid white;
            ">
                <i class="fas fa-${attractionTypes[type].icon}"></i>
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
    });
}

// Attractions data
const attractions = [
    {
        id: 1,
        name: "The Taj Chandigarh",
        location: [30.7350, 76.7786],
        type: "restaurant",
        price: "high",
        image: "https://media-cdn.tripadvisor.com/media/photo-s/1b/4a/2b/1e/the-taj-chandigarh.jpg",
        description: "Upscale hotel with elegant dining options.",
        website: "https://www.tajhotels.com/",
        openingHours: "7:00 AM - 11:00 PM",
        rating: "4.5/5"
    },
    {
        id: 2,
        name: "Rock Garden",
        location: [30.7606, 76.8004],
        type: "park",
        image: "https://www.chandigarhtourism.gov.in/images/places-to-visit/headers/rock-garden-chandigarh-header.jpg",
        description: "Sculpture garden built with industrial waste.",
        website: "https://www.chandigarhtourism.gov.in/rock-garden",
        openingHours: "9:00 AM - 7:00 PM",
        rating: "4.6/5"
    },
    {
        id: 3,
        name: "Capitol Complex",
        location: [30.7589, 76.8017],
        type: "historical",
        image: "https://www.chandigarhtourism.gov.in/images/places-to-visit/headers/capitol-complex-chandigarh-header.jpg",
        description: "UNESCO World Heritage Site.",
        website: "https://whc.unesco.org/en/list/1321",
        openingHours: "9:00 AM - 5:00 PM",
        rating: "4.7/5"
    },
    {
        id: 4,
        name: "Public Toilet - Sector 17",
        location: [30.7365, 76.7872],
        type: "toilet",
        description: "Clean public toilet facility.",
        openingHours: "6:00 AM - 10:00 PM"
    },
    {
        id: 5,
        name: "Elante Mall",
        location: [30.7136, 76.7688],
        type: "shopping",
        image: "https://content.jdmagicbox.com/comp/chandigarh/20/0172p172std172/list-of-shopping-malls-in-chandigarh-elante-mall-chandigarh-sector-20-1-1m5f0.jpg",
        description: "One of the largest malls in North India.",
        website: "https://www.elantemall.com/",
        openingHours: "10:00 AM - 10:00 PM",
        rating: "4.4/5"
    },
    {
        id: 6,
        name: "Government Museum",
        location: [30.7603, 76.8003],
        type: "museum",
        image: "https://www.chandigarhtourism.gov.in/images/places-to-visit/headers/government-museum-and-art-gallery-chandigarh-header.jpg",
        description: "Gandhara sculptures and Pahari paintings.",
        website: "https://www.chandigarhtourism.gov.in/government-museum-and-art-gallery",
        openingHours: "10:00 AM - 4:30 PM",
        rating: "4.1/5"
    },
    {
        id: 7,
        name: "ISKCON Temple",
        location: [30.6969, 76.8018],
        type: "religious",
        image: "https://www.chandigarhtourism.gov.in/images/places-to-visit/headers/iskcon-temple-chandigarh-header.jpg",
        description: "Beautiful Hare Krishna temple.",
        website: "https://www.iskconchandigarh.com/",
        openingHours: "4:30 AM - 8:30 PM",
        rating: "4.5/5"
    }
];

// Store all markers and list items
const allMarkers = [];
const allListItems = [];

// Initialize filters for both desktop and mobile
function initializeFilters() {
    const desktopFilters = document.getElementById('filter-options');
    const mobileFilters = document.getElementById('mobile-filter-grid');
    
    Object.keys(attractionTypes).forEach(type => {
        const typeData = attractionTypes[type];
        
        // Create common inner HTML for the filter option
        const filterHTML = `
            <input type="checkbox" class="filter" value="${type}" checked>
            <span class="filter-label"><i class="fas fa-${typeData.icon}"></i> ${type.charAt(0).toUpperCase() + type.slice(1)}</span>
        `;
        
        // Desktop filter element
        const desktopFilter = document.createElement('label');
        desktopFilter.className = 'filter-option';
        desktopFilter.innerHTML = filterHTML;
        desktopFilters.appendChild(desktopFilter);
        
        // Mobile filter element
        const mobileFilter = document.createElement('label');
        mobileFilter.className = 'filter-option';
        mobileFilter.innerHTML = filterHTML;
        mobileFilters.appendChild(mobileFilter);
    });
    
    // Attach a single change event listener to each filter input to sync the two groups
    syncFilters();
}

// Synchronize desktop and mobile filter checkboxes with the same value
function syncFilters() {
    // For each checkbox, when changed update all checkboxes with the same value.
    document.querySelectorAll('.filter').forEach(filter => {
        filter.addEventListener('change', e => {
            const { value, checked } = e.target;
            // Update all checkboxes that share the same value.
            document.querySelectorAll(`.filter[value="${value}"]`).forEach(cb => {
                cb.checked = checked;
            });
            updateVisibleAttractions();
        });
    });
}

// Initialize attraction list and markers
function initializeAttractions() {
    const listContainer = document.getElementById('attractions-list');
    
    attractions.forEach(attraction => {
        // Create marker
        const marker = L.marker(attraction.location, {
            icon: createCustomIcon(attraction.type)
        });

        // Create popup content
        let popupContent = `
            <h3>${attraction.name}</h3>
            ${attraction.image ? `<img src="${attraction.image}" alt="${attraction.name}" style="width:100%;height:150px;object-fit:cover;border-radius:8px;margin-bottom:10px;">` : ''}
            <div style="display:flex;gap:10px;margin-bottom:10px;flex-wrap:wrap;">
                <span><i class="fas fa-${attractionTypes[attraction.type].icon}"></i> ${attraction.type.charAt(0).toUpperCase() + attraction.type.slice(1)}</span>
        `;
        
        if (attraction.type === 'restaurant') {
            popupContent += `<span><i class="fas fa-rupee-sign"></i> ${
                attraction.price === 'high' ? '₹₹₹ (Expensive)' : 
                attraction.price === 'medium' ? '₹₹ (Moderate)' : '₹ (Budget)'
            }</span>`;
        }
        
        if (attraction.rating) {
            popupContent += `<span><i class="fas fa-star"></i> ${attraction.rating}</span>`;
        }
        
        if (attraction.openingHours) {
            popupContent += `<span><i class="fas fa-clock"></i> ${attraction.openingHours}</span>`;
        }
        
        popupContent += `</div>
            <p style="margin-bottom:10px;">${attraction.description}</p>
        `;
        
        if (attraction.website) {
            popupContent += `<a href="${attraction.website}" target="_blank" style="display:inline-block;background:#4361ee;color:white;padding:5px 10px;border-radius:5px;text-decoration:none;"><i class="fas fa-external-link-alt"></i> Official Website</a>`;
        }
        
        marker.bindPopup(popupContent);
        
        // Store marker with its type and id
        allMarkers.push({
            marker: marker,
            type: attraction.type,
            id: attraction.id
        });

        // Create list item
        const item = document.createElement('div');
        item.className = 'attraction-item';
        item.dataset.id = attraction.id;
        item.dataset.type = attraction.type;
        
        let priceHtml = '';
        if (attraction.type === 'restaurant') {
            const priceClass = attraction.price === 'high' ? 'price-high' : 
                             attraction.price === 'medium' ? 'price-medium' : 'price-low';
            priceHtml = `<span class="price-indicator ${priceClass}">${
                attraction.price === 'high' ? '₹₹₹ (Expensive)' : 
                attraction.price === 'medium' ? '₹₹ (Moderate)' : '₹ (Budget)'
            }</span>`;
        }
        
        item.innerHTML = `
            <h4>${attraction.name} ${priceHtml}</h4>
            <div class="attraction-meta">
                <span><i class="fas fa-${attractionTypes[attraction.type].icon}"></i> ${attraction.type.charAt(0).toUpperCase() + attraction.type.slice(1)}</span>
                ${attraction.rating ? `<span><i class="fas fa-star"></i> ${attraction.rating}</span>` : ''}
            </div>
            ${attraction.image ? `<img src="${attraction.image}" alt="${attraction.name}" class="attraction-image">` : ''}
        `;
        
        item.addEventListener('click', () => {
            map.setView(attraction.location, 16);
            marker.openPopup();
        });
        
        listContainer.appendChild(item);
        allListItems.push(item);
    });
    
    updateVisibleAttractions();
}

// Update visible attractions based on selected filters and the search term
function updateVisibleAttractions() {
    // Get unique selected types (from both desktop and mobile)
    const selectedTypes = [...new Set(
      Array.from(document.querySelectorAll('.filter:checked')).map(f => f.value)
    )];
    
    const searchTerm = document.getElementById('search').value.toLowerCase();
    let visibleCount = 0;
    
    // Update map markers visibility
    allMarkers.forEach(markerObj => {
        const attraction = attractions.find(a => a.id === markerObj.id);
        const matchesType = selectedTypes.includes(markerObj.type);
        const matchesSearch = attraction.name.toLowerCase().includes(searchTerm);
        
        if (matchesType && matchesSearch) {
            markerObj.marker.addTo(map);
            visibleCount++;
        } else {
            markerObj.marker.remove();
        }
    });
    
    // Update list items visibility
    allListItems.forEach(item => {
        const matchesType = selectedTypes.includes(item.dataset.type);
        const matchesSearch = item.querySelector('h4').textContent.toLowerCase().includes(searchTerm);
        
        if (matchesType && matchesSearch) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
    
    updateAttractionCount(visibleCount);
}

// Update the displayed count of visible attractions
function updateAttractionCount(count) {
    document.getElementById('count').textContent = `(${count})`;
}

// Search functionality
document.getElementById('search').addEventListener('input', () => {
    updateVisibleAttractions();
});

// Select All/Deselect All functionality (Desktop)
document.getElementById('select-all').addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(filter => {
        filter.checked = true;
    });
    updateVisibleAttractions();
});

document.getElementById('deselect-all').addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(filter => {
        filter.checked = false;
    });
    updateVisibleAttractions();
});

// Select All/Deselect All functionality (Mobile)
document.getElementById('select-all-mobile').addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(filter => {
        filter.checked = true;
    });
    updateVisibleAttractions();
});

document.getElementById('deselect-all-mobile').addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(filter => {
        filter.checked = false;
    });
    updateVisibleAttractions();
});

// Mobile filters toggle (if needed)
document.getElementById('filter-toggle').addEventListener('click', () => {
    document.getElementById('mobile-filters').classList.toggle('active');
});

// Locate user functionality
document.getElementById('locate-btn').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const userLocation = [position.coords.latitude, position.coords.longitude];
                map.setView(userLocation, 15);
                
                L.marker(userLocation, {
                    icon: L.divIcon({
                        className: 'user-location-icon',
                        html: '<div style="background: #4361ee; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 3px rgba(67,97,238,0.5);"></div>',
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    }),
                    zIndexOffset: 1000
                }).addTo(map).bindPopup('Your location').openPopup();
            },
            error => {
                alert('Unable to get your location: ' + error.message);
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
    }
});

// Initialize the app
initializeFilters();
initializeAttractions();

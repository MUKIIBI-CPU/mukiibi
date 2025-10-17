// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map
    const map = L.map('map').setView([0.3476, 32.5825], 12);

    // Store the initial view for reset functionality
    const initialView = {
        center: [0.3476, 32.5825],
        zoom: 12
    };

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add scale control to bottom left
    L.control.scale({
        imperial: false,
        position: 'bottomleft'
    }).addTo(map);

    // Updated Legend with Location Icons - MOVED INSIDE
    const legend = L.control({position: 'bottomleft'});

    legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'map-legend');
    div.style.backgroundColor = 'white';
    div.style.padding = '20px';
    div.style.border = '2px solid rgba(0,0,0,0.2)';
    div.style.borderRadius = '5px';
    div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
    div.innerHTML = `
        <h3>HEALTHCARE CENTERS</h3>
        <div class="legend-item">
            <div class="legend-icon hospital" style="color: #ff0000ff;">
                <i class="fas fa-hospital"></i>
            </div>
            <span>Hospital</span>
        </div>
        <div class="legend-item">
            <div class="legend-icon clinic" style="color: #0015ffff;">
                <i class="fas fa-clinic-medical"></i>
            </div>
            <span>Clinic</span>
        </div>
        <div class="legend-item">
            <div class="legend-icon health-center" style="color: #00ff26ff;">
                <i class="fas fa-first-aid"></i>
            </div>
            <span>Health Center</span>
        </div>
        <div class="legend-item">
            <div class="legend-icon dispensary" style="color: #f2ff00ff;">
                <i class="fas fa-pills"></i>
            </div>
            <span>Dispensary</span>
        </div>
        <div class="legend-item">
            <div class="legend-icon user-location" style="color: #fb00ffff;">
                <i class="fas fa-location-arrow"></i>
            </div>
            <span>Your Location</span>
        </div>
    `;
    return div;
    };
    legend.addTo(map); // This should work now because map exists

    // Create custom icons using the exact Font Awesome icons from your legend
    function getIcon(type) {
        let iconClass, color;
        
        switch(type.toLowerCase()) {
            case 'hospital': 
                iconClass = 'fas fa-hospital';
                color = '#ff0000ff'; 
                break;
            case 'clinic': 
                iconClass = 'fas fa-clinic-medical';
                color = '#0015ffff'; 
                break;
            case 'health center': 
                iconClass = 'fas fa-first-aid';
                color = '#00ff26ff'; 
                break;
            case 'dispensary': 
                iconClass = 'fas fa-pills';
                color = '#f2ff00ff'; 
                break;
            default: 
                iconClass = 'fas fa-first-aid';
                color = '#fb00ffff';
        }

        return L.divIcon({
            className: 'custom-icon',
            html: `<div style="color: ${color}; font-size: 24px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); background: rgba(255,255,255,0.8); border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;"><i class="${iconClass}"></i></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    }

    // Add markers for each health center with enhanced popups
    const markers = [];
    healthCenters.forEach(center => {
        const marker = L.marker([center.lat, center.lng], { icon: getIcon(center.type) })
            .addTo(map)
            .bindPopup(`
                <div style="min-width: 280px; max-height: 400px; overflow-y: auto;">
                    <h3 style="margin: 0 0 10px 0; color: #1a6dbb; border-bottom: 2px solid #1a6dbb; padding-bottom: 5px;">${center.name}</h3>
                    
                    <div style="margin-bottom: 10px;">
                        <p style="margin: 0 0 5px 0;"><strong>🏥 Type:</strong> ${center.type}</p>
                        <p style="margin: 0 0 5px 0;"><strong>📞 Contact:</strong> ${center.contact}</p>
                    </div>
                    
                    <div style="margin-bottom: 10px;">
                        <p style="margin: 0 0 8px 0; font-style: italic; color: #555;">${center.description}</p>
                    </div>
                    
                    <div style="margin-bottom: 10px;">
                        <h4 style="margin: 0 0 8px 0; color: #2c3e50; font-size: 1em;">🩺 Services Offered:</h4>
                        <ul style="margin: 0; padding-left: 20px; font-size: 0.9em;">
                            ${center.services.map(service => `<li style="margin-bottom: 3px;">${service}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 8px; border-radius: 5px; margin-top: 10px;">
                        <small style="color: #666;">Click outside to close this popup</small>
                    </div>
                </div>
            `);
        
        markers.push({
            marker: marker,
            data: center
        });
    });

    // Populate the sidebar with health centers
    const healthCenterList = document.getElementById('health-center-list');
    healthCenters.forEach((center, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'health-center-item';
        listItem.innerHTML = `
            <div class="health-center-name">${center.name}</div>
            <div class="health-center-type">${center.type}</div>
            <div class="health-center-contact">${center.contact}</div>
        `;
        
        listItem.addEventListener('click', () => {
            // Remove active class from all items
            document.querySelectorAll('.health-center-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked item
            listItem.classList.add('active');
            
            // Open the marker popup and center the map
            markers[index].marker.openPopup();
            map.setView([center.lat, center.lng], 15);
        });
        
        healthCenterList.appendChild(listItem);
    });

    // Search functionality
    const searchBox = document.getElementById('search-box');
    searchBox.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        // Filter markers and list items
        markers.forEach((markerObj, index) => {
            const center = markerObj.data;
            const listItem = healthCenterList.children[index];
            
            if (center.name.toLowerCase().includes(searchTerm)) {
                markerObj.marker.addTo(map);
                listItem.style.display = 'block';
            } else {
                map.removeLayer(markerObj.marker);
                listItem.style.display = 'none';
            }
        });
    });

    // Current location functionality
    const currentLocationBtn = document.getElementById('current-location-btn');
    let userLocationMarker = null;

    currentLocationBtn.addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // Remove previous location marker if exists
                    if (userLocationMarker) {
                        map.removeLayer(userLocationMarker);
                    }
                    
                    // Add marker for current location with the location arrow icon
                    userLocationMarker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            className: 'current-location-icon',
                            html: `<div style="color: #000000ff; font-size: 24px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); background: rgba(255,255,255,0.8); border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-location-arrow"></i></div>`,
                            iconSize: [30, 30],
                            iconAnchor: [15, 15]
                        })
                    })
                    .addTo(map)
                    .bindPopup('Your current location')
                    .openPopup();
                    
                    // Add a circle to show accuracy
                    L.circle([lat, lng], {
                        color: '#9b59b6',
                        fillColor: '#9b59b6',
                        fillOpacity: 0.1,
                        radius: position.coords.accuracy
                    }).addTo(map);
                    
                    // Center map on current location
                    map.setView([lat, lng], 14);
                },
                function(error) {
                    let errorMessage = 'Unable to retrieve your location. ';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage += 'Please allow location access to use this feature.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage += 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage += 'The request to get your location timed out.';
                            break;
                        default:
                            errorMessage += 'An unknown error occurred.';
                    }
                    alert(errorMessage);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    });

    // Reset view functionality
    const resetViewBtn = document.getElementById('reset-view-btn');
    resetViewBtn.addEventListener('click', function() {
        map.setView(initialView.center, initialView.zoom);
        
        // Remove user location marker if exists
        if (userLocationMarker) {
            map.removeLayer(userLocationMarker);
            userLocationMarker = null;
        }
    });

    // Footer functionality
    // Print Map functionality
    const printMapBtn = document.getElementById('print-map-btn');
    if (printMapBtn) {
        printMapBtn.addEventListener('click', function() {
            printMap();
        });
    }

    // Share Map functionality
    const shareMapBtn = document.getElementById('share-map-btn');
    if (shareMapBtn) {
        shareMapBtn.addEventListener('click', function() {
            shareMap();
        });
    }

    // Print Map Function
    function printMap() {
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            alert('Map element not found!');
            return;
        }

        // Create a print-friendly version
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Kampala Health Centers Map</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .print-header { text-align: center; margin-bottom: 20px; }
                    .print-header h1 { color: #1a6dbb; margin-bottom: 10px; }
                    .print-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                    .emergency-contacts { background: #fff3cd; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                    .map-container { width: 100%; height: 500px; border: 2px solid #ddd; }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>Kampala Health Centers Map</h1>
                    <p>Generated on ${new Date().toLocaleDateString()}</p>
                </div>
                
                <div class="print-info">
                    <h3>About This Map</h3>
                    <p>Interactive map showing healthcare facilities in Kampala, Uganda. Find hospitals, clinics, health centers, and dispensaries.</p>
                </div>
                
                <div class="emergency-contacts">
                    <h3>Emergency Contacts</h3>
                    <p><strong>Emergency:</strong> +256-800-111-222</p>
                    <p><strong>Ministry of Health:</strong> +256-414-342-000</p>
                </div>
                
                <div class="map-container">
                    <img src="https://maps.googleapis.com/maps/api/staticmap?center=0.3476,32.5825&zoom=12&size=800x500&maptype=roadmap&markers=color:red%7C0.3476,32.5825" 
                         alt="Kampala Map" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                
                <div style="margin-top: 20px; text-align: center; color: #666;">
                    <p>&copy; 2024 Kampala Health Centers Map. For the interactive version, visit the web application.</p>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load then print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }

    // Share Map Function
    function shareMap() {
        const mapData = {
            title: 'Kampala Health Centers Map',
            text: 'Check out this interactive map of healthcare facilities in Kampala, Uganda.',
            url: window.location.href
        };

        if (navigator.share) {
            // Use Web Share API if available
            navigator.share(mapData)
                .then(() => console.log('Map shared successfully'))
                .catch(error => console.log('Error sharing:', error));
        } else if (navigator.clipboard) {
            // Fallback: Copy URL to clipboard
            navigator.clipboard.writeText(window.location.href)
                .then(() => {
                    alert('Map URL copied to clipboard!');
                })
                .catch(error => {
                    // Fallback: Show URL for manual copy
                    prompt('Copy this URL to share:', window.location.href);
                });
        } else {
            // Final fallback
            prompt('Copy this URL to share:', window.location.href);
        }
    }
}); // END OF DOMContentLoaded
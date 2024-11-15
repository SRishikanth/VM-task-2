
class MapApp {
  constructor(mapId, distanceInfoId, userId) {
    this.userId = userId;
    this.map = L.map(mapId).setView([11.1271, 78.6569], 7);  
    this.distanceInfoElement = document.getElementById(distanceInfoId);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    this.markers = [];
    this.polyline = L.polyline([], { color: 'blue' }).addTo(this.map);  // Default color is blue

    this.loadDrawingHistory();

    this.map.on('click', this.onMapClick.bind(this));
  }

  // This function will allow resetting the map and user ID without reloading the page
  resetMap(userId) {
    this.userId = userId;

    // Remove all existing markers and polylines
    this.markers.forEach(marker => {
      this.map.removeLayer(marker);
    });
    this.markers = [];
    this.polyline.setLatLngs([]);

    // Reload the drawing history for the new user
    this.loadDrawingHistory();
  }

  onMapClick(e) {
    const { lat, lng } = e.latlng;
    this.addOrRemoveMarker(lat, lng);
  }

  addOrRemoveMarker(lat, lng) {
    const newMarker = L.marker([lat, lng]).addTo(this.map);
    this.markers.push(newMarker);

    newMarker.on('click', () => {
      this.map.removeLayer(newMarker);
      this.markers = this.markers.filter(marker => marker !== newMarker);
      this.updatePolylineAndDistance();
      this.saveDrawingHistory();  // Save updated markers to DB after removal
    });

    this.updatePolylineAndDistance();
    this.saveDrawingHistory();  // Save updated markers to DB after addition
  }

  updatePolylineAndDistance() {
    const latlngs = this.markers.map(marker => marker.getLatLng());
    this.polyline.setLatLngs(latlngs);

    let totalDistance = 0;
    for (let i = 1; i < latlngs.length; i++) {
      totalDistance += latlngs[i - 1].distanceTo(latlngs[i]) / 1000;  
    }

    this.distanceInfoElement.innerText = `Total Distance: ${totalDistance.toFixed(2)} km`;
  }

  saveDrawingHistory() {
    if (!this.userId) return;
    const markerPositions = this.markers.map(marker => marker.getLatLng());
    const data = {
      userId: this.userId,
      markers: markerPositions
    };

    fetch('http://localhost:3000/saveDrawing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)  
    })
    .then(response => {
      if (response.ok) {
        console.log('Drawing data saved successfully');
      } else {
        console.log('Error saving data');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  loadDrawingHistory() {
    if (!this.userId) return;

    // Clear existing markers from the map
    this.markers.forEach(marker => {
      this.map.removeLayer(marker);
    });
    this.markers = []; // Clear the markers array

    fetch(`http://localhost:3000/loadDrawing/${this.userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('No data found or server error');
        }
        return response.json();
      })
      .then(data => {
        if (data.markers && Array.isArray(data.markers)) {
          data.markers.forEach(({ lat, lng }) => {
            // Check if a marker already exists at this position to avoid duplicates
            if (!this.markers.some(marker => {
              const pos = marker.getLatLng();
              return pos.lat === lat && pos.lng === lng;
            })) {
              const marker = L.marker([lat, lng]).addTo(this.map);
              this.markers.push(marker);

              marker.on('click', () => {
                this.map.removeLayer(marker);
                this.markers = this.markers.filter(m => m !== marker);
                this.updatePolylineAndDistance();
                this.saveDrawingHistory(); // Save updated markers after removal
              });
            }
          });

          this.updatePolylineAndDistance();
        } else {
          console.error('Unexpected data format:', data);
        }
      })
      .catch(error => {
        console.error('Error loading data:', error);
      });
  }

  // New function to change polyline color
  changePolylineColor(color) {
    this.polyline.setStyle({ color: color });
  }

  // New function to toggle between dashed and solid polyline
  togglePolylineDashed() {
    const currentDashArray = this.polyline.options.dashArray;
    if (currentDashArray) {
      // If it is currently dashed, make it solid
      this.polyline.setStyle({ dashArray: null });
    } else {
      // If it is solid, make it dashed
      this.polyline.setStyle({ dashArray: '5, 10' }); // Dash pattern: 5px solid, 10px gap
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  let app;  // Declare app variable outside so it can be reused

  document.getElementById('start-app').addEventListener('click', () => {
    const userId = document.getElementById('user-id-input').value.trim();
    
    if (userId) {
      if (app) {
        app.resetMap(userId);  // Reset the map for a new user ID
      } else {
        app = new MapApp('map', 'distance-info', userId);  // Initialize the map if it's the first time
      }
    } else {
      alert('Please enter a valid User ID.');
    }
  });

  // Add event listener to change polyline color
  document.getElementById('change-color').addEventListener('click', () => {
    const newColor = prompt("Enter the color for the polyline (e.g., 'red', 'green', 'yellow'):").trim();
    if (newColor) {
      if (app) {
        app.changePolylineColor(newColor);  // Change polyline color dynamically
      } else {
        alert('Please start the app first!');
      }
    }
  });

  // Add event listener to toggle dashed polyline
  document.getElementById('toggle-dash').addEventListener('click', () => {
    if (app) {
      app.togglePolylineDashed();  // Toggle polyline dashed style
    } else {
      alert('Please start the app first!');
    }
  });
});






































// class MapApp {
//   constructor(mapId, distanceInfoId, userId) {
//     this.userId = userId;
//     this.map = L.map(mapId).setView([11.1271, 78.6569], 7);  
//     this.distanceInfoElement = document.getElementById(distanceInfoId);

//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       maxZoom: 19,
//     }).addTo(this.map);

//     this.markers = [];
//     this.polyline = L.polyline([], { color: 'blue' }).addTo(this.map);  // Default color is blue

//     this.loadDrawingHistory();

//     this.map.on('click', this.onMapClick.bind(this));
//   }

//   // This function will allow resetting the map and user ID without reloading the page
//   resetMap(userId) {
//     this.userId = userId;

//     // Remove all existing markers and polylines
//     this.markers.forEach(marker => {
//       this.map.removeLayer(marker);
//     });
//     this.markers = [];
//     this.polyline.setLatLngs([]);

//     // Reload the drawing history for the new user
//     this.loadDrawingHistory();
//   }

//   onMapClick(e) {
//     const { lat, lng } = e.latlng;
//     this.addOrRemoveMarker(lat, lng);
//   }

//   addOrRemoveMarker(lat, lng) {
//     const newMarker = L.marker([lat, lng]).addTo(this.map);
//     this.markers.push(newMarker);

//     newMarker.on('click', () => {
//       this.map.removeLayer(newMarker);
//       this.markers = this.markers.filter(marker => marker !== newMarker);
//       this.updatePolylineAndDistance();
//       this.saveDrawingHistory();  // Save updated markers to DB after removal
//     });

//     this.updatePolylineAndDistance();
//     this.saveDrawingHistory();  // Save updated markers to DB after addition
//   }

//   updatePolylineAndDistance() {
//     const latlngs = this.markers.map(marker => marker.getLatLng());
//     this.polyline.setLatLngs(latlngs);

//     let totalDistance = 0;
//     for (let i = 1; i < latlngs.length; i++) {
//       totalDistance += latlngs[i - 1].distanceTo(latlngs[i]) / 1000;  
//     }

//     this.distanceInfoElement.innerText = `Total Distance: ${totalDistance.toFixed(2)} km`;
//   }

//   saveDrawingHistory() {
//     if (!this.userId) return;
//     const markerPositions = this.markers.map(marker => marker.getLatLng());
//     const data = {
//       userId: this.userId,
//       markers: markerPositions
//     };

//     fetch('http://localhost:3000/saveDrawing', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(data)  
//     })
//     .then(response => {
//       if (response.ok) {
//         console.log('Drawing data saved successfully');
//       } else {
//         console.log('Error saving data');
//       }
//     })
//     .catch(error => {
//       console.error('Error:', error);
//     });
//   }

//   loadDrawingHistory() {
//     if (!this.userId) return;

//     // Clear existing markers from the map
//     this.markers.forEach(marker => {
//       this.map.removeLayer(marker);
//     });
//     this.markers = []; // Clear the markers array

//     fetch(`http://localhost:3000/loadDrawing/${this.userId}`)
//       .then(response => {
//         if (!response.ok) {
//           throw new Error('No data found or server error');
//         }
//         return response.json();
//       })
//       .then(data => {
//         if (data.markers && Array.isArray(data.markers)) {
//           data.markers.forEach(({ lat, lng }) => {
//             // Check if a marker already exists at this position to avoid duplicates
//             if (!this.markers.some(marker => {
//               const pos = marker.getLatLng();
//               return pos.lat === lat && pos.lng === lng;
//             })) {
//               const marker = L.marker([lat, lng]).addTo(this.map);
//               this.markers.push(marker);

//               marker.on('click', () => {
//                 this.map.removeLayer(marker);
//                 this.markers = this.markers.filter(m => m !== marker);
//                 this.updatePolylineAndDistance();
//                 this.saveDrawingHistory(); // Save updated markers after removal
//               });
//             }
//           });

//           this.updatePolylineAndDistance();
//         } else {
//           console.error('Unexpected data format:', data);
//         }
//       })
//       .catch(error => {
//         console.error('Error loading data:', error);
//       });
//   }

//   // New function to change polyline color
//   changePolylineColor(color) {
//     this.polyline.setStyle({ color: color });
//   }
// }

// document.addEventListener('DOMContentLoaded', () => {
//   let app;  // Declare app variable outside so it can be reused

//   document.getElementById('start-app').addEventListener('click', () => {
//     const userId = document.getElementById('user-id-input').value.trim();
    
//     if (userId) {
//       if (app) {
//         app.resetMap(userId);  // Reset the map for a new user ID
//       } else {
//         app = new MapApp('map', 'distance-info', userId);  // Initialize the map if it's the first time
//       }
//     } else {
//       alert('Please enter a valid User ID.');
//     }
//   });

//   // Add event listener to change polyline color
//   document.getElementById('change-color').addEventListener('click', () => {
//     const newColor = prompt("Enter the color for the polyline (e.g., 'red', 'green', 'yellow'):").trim();
//     if (newColor) {
//       if (app) {
//         app.changePolylineColor(newColor);  // Change polyline color dynamically
//       } else {
//         alert('Please start the app first!');
//       }
//     }
//   });
// });

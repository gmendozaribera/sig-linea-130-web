/**
 * Realizar una solicitud AJAX y devolver el objeto XMLHttpRequest
 * 
 * @param {string} route La ruta del recurso a cargar (ej: "/ruta/1")
 * @param {function} callback La función que maneja el cambio de estado (evento "onreadystatechanged")
 * @returns {XMLHttpRequest} El objeto XHR para realizar otras operaciones
 */
function ajaxGetRequest(route, callback) {
  ajaxRequest = new XMLHttpRequest();
  ajaxRequest.onreadystatechange = () => {
    if (ajaxRequest.readyState == 4 && ajaxRequest.status == 200) {
      callback(JSON.parse(ajaxRequest.responseText));
    }
    console.log(`[INFO] Request status: readystate=${ajaxRequest.readyState}; http status=${ajaxRequest.status}`);
  };
  ajaxRequest.open('GET', route, true);
  ajaxRequest.send(null);
}

/** 
 *  Obtiene las caracteristicas de un shapefile especificado como array y las carga
 *  a la instancia del mapa especificado.
 * 
 *  @param {string} filename El nombre del archivo a ser obtenido via una peticion ajax
 *  @param {Leaflet map} mapInstance La instancia del mapa a la cual agregar las caracteristicas
 *  @param {string} color El color del cual se debe dibujar la característica. Default: 'blue'
 */
function loadPolylinesShpToMap(filename, map, color = 'blue') {
  const drawingOpts = {
    style: function (feature) {
      return { color: color }
    }
  };
  try {
    // ajaxGetRequest(`http://localhost:5000/get-geojson/${filename}`, (geoJsonArr) => {
    ajaxGetRequest(`${window.location.origin}/get-geojson/${filename}`, (geoJsonArr) => {
      for (i = 0; i < geoJsonArr.length; i++) {
        const numPts = geoJsonArr[i].geometry.coordinates.length;
        const inicio = geoJsonArr[i].geometry.coordinates[0];
        const fin = geoJsonArr[i].geometry.coordinates[numPts - 1];
        const inicioMarkerOpts = {
          icon: L.icon({
            iconUrl: window.location.origin + '/img/markers/inicio.png',
            iconSize: [48, 48],
            iconAnchor: [24, 48]
          }),
          title: 'Inicio de la ruta'
        };
        const finMarkerOpts = {
          icon: L.icon({
            iconUrl: window.location.origin + '/img/markers/final.png',
            iconSize: [48, 48],
            iconAnchor: [24, 48]
          }),
          title: 'Fin de la ruta'
        };
        L.marker([inicio[1], inicio[0]], inicioMarkerOpts).addTo(map);
        L.marker([fin[1], fin[0]], finMarkerOpts).addTo(map);
        L.geoJSON(geoJsonArr[i].geometry, drawingOpts).addTo(map);
      }
    });
  } catch (error) {
    console.error('Error al cargar shapefile al mapa:', error);
  }
}

function loadPointsShpToMap(filename, map, markerStyle = null) {
  try {
    ajaxGetRequest(`${window.location.origin}/get-geojson/${filename}`, (geoJsonArr) => {
      for (i = 0; i < geoJsonArr.length; i++) {
        L.geoJSON(geoJsonArr[i].geometry, drawingOpts).addTo(mapInstance);
      }
    });
  } catch (error) {
    console.error('Error al cargar shapefile al mapa:', error);
  }
}

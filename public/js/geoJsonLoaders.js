/**
 * Realizar una solicitud AJAX y devolver el objeto XMLHttpRequest
 * 
 * @param {string} route La ruta del recurso a cargar (ej: "/ruta/1")
 * @param {function} callback La función que maneja el cambio de estado (evento "onreadystatechanged")
 * @returns {XMLHttpRequest} El objeto XHR para realizar otras operaciones
 */
function ajaxGetRequest(route, callback) {
    ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onreadystatechange = callback(ajaxRequest);
    ajaxRequest.open('GET', route, true);
    ajaxRequest.send(null);
    return ajaxRequest;
}

function handleGeoJson(ajaxRequest) {
    let geoJsonFeature = null;
    if (ajaxRequest.readyState == 4) {
        console.log("Great! AJAX Request finished!");
        if (ajaxRequest.status == 200) {
            console.log("Response from server:\n" + ajaxRequest.responseText);
            geoJsonFeature = JSON.parse(ajaxRequest.responseText);
        } else {
            console.log("AJAX Request status: " + ajaxRequest.status);
        }
    } else {
        console.log("Hold on, AJAX ReadyState is: " + ajaxRequest.readyState);
    }
    return geoJsonFeature;
}

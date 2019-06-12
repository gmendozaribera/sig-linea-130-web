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
        console.log(`Request status: readystate=${ajaxRequest.readyState}; http status=${ajaxRequest.status}`);
    };
    ajaxRequest.open('GET', route, true);
    ajaxRequest.send(null);
}

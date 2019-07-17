const fs = require('fs');
const shapefile = require('shapefile');

module.exports.shpToGeoJsonArr = shpToGeoJsonArr;
module.exports.shpPathsArr = shpPathsArr;

/**
 * Obtiene los shapefiles del directorio especificado y los devuelve como un
 * array de rutas absolutas. En caso de no especificarse un directorio, busca
 * en la carpeta "./shapefiles/" del directorio actual.
 * 
 * @param {string} dir El directorio en donde buscar shapefiles.
 * @returns {string[]} Array de strings que representan las rutas de los archivos
 */
function shpPathsArr(dir = null) {
  let arr = [];
  const shapefilesDir = dir || __dirname + '\\shapefiles\\';
  const allFiles = fs.readdirSync(shapefilesDir);

  // poner en el resultado solamente los archivos con extension ".shp"
  allFiles.forEach((fileName) => {
    const splitArr = fileName.split('.');
    const fileExt = splitArr[splitArr.length - 1];
    // si tiene extensión shapefile, agregar al resultado
    if (fileExt === 'shp') arr.push(shapefilesDir + fileName);
  });
  return arr;
}

/**
 * Obtiene todos los shapefiles contenidos en un directorio dado y los devuelve en un array
 * de GeoJSON. De no especificarse el directorio, se trabaja con "./shapefiles/"
 *  
 * @param {String} dir El directorio del cual obtener los shapefiles
 */
function getAllShpAsGeoJsonArr(dir = null) {
  let shapefiles = shpPathsArr(dir);
  let result = [];
  for (i = 0; i < shapefiles.length; i++) {
    try {
      shpToGeoJsonArr(shapefiles[i], (geoJsonArr) => { result.push(geoJsonArr) });
    } catch (error) {
      console.error('[SHP] Error al leer shapefile como GeoJSON:', error.message);
      break;
    }
  }
  return result;
}


/**
 * @return {array} Devuelve un array de todas las caracteristicas (convertidas a GeoJSON)
 * del shapefile especificado mediante el parametro 'filename'.
 * Esta funcion trabaja con Promises y de forma recursiva (ver: "function log(...)" ).
 * 
 * @param {string} filename El nombre del archivo a ser cargado, relativo al directorio './shapefiles/'
 * @param {function} callback Callback a ser invocada cuando finalice el cargado del shapefile.
 */
function shpToGeoJsonArr(filename, callback) {
  try {
    const fileroute = './shapefiles/' + filename;
    let shpFeatures = [];
    shapefile.open(fileroute)
      .then((source) => source.read()
        .then(function log(result) {
          if (result.done) {
            // si ya no quedan más características cortar la ejecución y retornar
            console.log(`[SHP] Se terminó de convertir ${filename} a GeoJSON.`);
            //console.log('[SHP] Resultado:', shpFeatures); // TO DO: deshabilitar esto en producción!
            return callback(shpFeatures);
          } else {
            // aun quedan caracteristicas que procesar, continuar
            console.log('[SHP] Característica convertida a GeoJSON.');
            // console.log('[SHP] Resultado:', result.value);  // TO DO: deshabilitar esto en producción!
            shpFeatures.push(result.value);
            return source.read().then(log); // continuar leyendo características
          }
        }).catch((error) => console.error('[SHP] Error al leer la fuente especificada:', error))
      ).catch((error) => console.error('[SHP] Error al abrir el shapefile especificado:', error));
  } catch (error) {
    console.error('[SHP] Se ha producido un error. Detalles:', error);
  }
}


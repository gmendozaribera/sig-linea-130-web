const fs = require('fs');
const shapefile = require('shapefile');

module.exports.shpToGeoJsonArr = shpToGeoJsonArr;
module.exports.shpPathsArr = shpPathsArr;

/**
 * Obtiene los shapefiles del directorio especificado y los devuelve como un
 * array de rutas absolutas. En caso de no especificarse un directorio, busca
 * en la carpeta "/shapefiles/" del directorio actual.
 * 
 * @param {string} dir El directorio en donde buscar shapefiles.
 * @returns {string[]} arreglo de cadenas
 */
function shpPathsArr(dir = null) {
  let arr = [];
  const shapefilesDir = dir || __dirname + '\\shapefiles\\';
  const allFiles = fs.readdirSync(shapefilesDir);

  // poner en el resultado solamente los archivos con extension ".shp"
  allFiles.forEach((fileName) => {
    const splitArr = fileName.split('.');
    const fileExt = splitArr[splitArr.length - 1];
    if (fileExt === 'shp') arr.push(shapefilesDir + fileName);
  });
  return arr;
}


function getAllShpAsGeoJsonArr(dir = null) {
  let shapefiles = shpPathsArr(dir);
  let result = [];
  for (i = 0; i < shapefiles.length; i++) {
    try {
      shpToGeoJsonArr(shapefiles[i], (geoJsonArr) => {result.push(geoJsonArr)});
    } catch (error) {
      console.error('Se ha producido un error: \n' + error);
      return result;
    }
  }
  return result;
}


/**
 * @return {array} Devuelve un array de las caracteristicas (convertidas a GeoJSON)
 * del shapefile especificado mediante el parametro 'filename'.
 * Esta funcion trabaja con Promises y de forma recursiva.
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
            console.log(shpFeatures);
            return callback(shpFeatures);
          }
          // aun quedan caracteristicas que procesar, continuar
          console.log('Feature converted!');
          console.log(result.value);
          shpFeatures.push(result.value);
          return source.read().then(log); // continuar leyendo (un shapefile puede tener N características)
        }).catch((error) => console.error('Error al leer desde la fuente especificada: \n' + error))
      ).catch((error) => console.error('Error al abrir el archivo especificado: \n' + error));
  } catch (error) {
    console.error('Error capturado: \n' + error);
  }
}


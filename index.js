const {json, send} = require('micro')
const addElevation = require('geojson-elevation').addElevation
const TileSet = require('node-hgt').TileSet
const ImagicoElevationDownloader = require('node-hgt').ImagicoElevationDownloader
const tileDirectory = process.env.TILE_DIRECTORY || './data'
const noData = process.env.NO_DATA ? parseInt(process.env.NO_DATA) : null
const tileDownloader = process.env.TILE_DOWNLOADER === 'none'
  ? tileDownloader = undefined
  : new ImagicoElevationDownloader(tileDirectory)
const maxPostSize = process.env.MAX_POST_SIZE || "500kb";
const tiles = new TileSet(tileDirectory, {downloader:tileDownloader});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', [
    'X-Requested-With',
    'Access-Control-Allow-Origin',
    'X-HTTP-Method-Override',
    'Content-Type',
    'Authorization',
    'Accept'
  ].join(','))
  res.setHeader('Access-Control-Max-Age', '' + (60 * 60 * 24))
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS') {
    return send(res, 200)
  }

  if (req.method !== 'POST') {
    return send(res, 405, {error: 'Only POST allowed'})
  }

  const geojson = await json(req, {limit: maxPostSize})
  if (!geojson || Object.keys(geojson).length === 0) {
    return send(res, 400, {error: 'invalid GeoJSON'})
  }

  return new Promise((resolve, reject) => {
    addElevation(geojson, tiles, function(err, geojson) {
      if (err) {
        return send(res, 500, err)
      }

      resolve(geojson)
    }, noData)
  })
}

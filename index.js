import fetch from 'node-fetch'

const SULGAS_PEAD_JSON_URL = 'https://digital.sulgas.rs.gov.br/maps/assets/pead.json'


const convertToGeoJson = (sourceData) => {
  const featureGroups = sourceData.reduce((acc, curr) => {
    acc[curr.id] = acc[curr.id] || { 
      properties: {
        tipo: curr.tipo,
        cidade: curr.cidade,
        distancia: curr.distancia
      },
      sequences: []
    }
    acc[curr.id].sequences.push({
      order: curr.sequence,
      lat: curr.latitude,
      lng: curr.longitude
    })
    return acc
  },{})


  const features = Object.entries(featureGroups).map(([id,group]) => ({ 
      type : 'Feature', 
      id,
      properties : group.properties, 
      geometry : { 
        type : 'LineString', 
        coordinates : group.sequences
          .sort((a,b) => (a.order - b.order))
          .map(({lat,lng}) => ([lng,lat]))
      }
    })
  )

  return {
    type : "FeatureCollection",
    features,
  }
}

async function run() {

  const response = await fetch(SULGAS_PEAD_JSON_URL)
  if (!response.ok) {
    throw new Error('Error fetching source data')
  }
  

  const output = convertToGeoJson(await response.json())
  console.log(JSON.stringify(output))

}

run()
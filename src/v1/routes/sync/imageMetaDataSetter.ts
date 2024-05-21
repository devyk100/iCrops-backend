const { ExifTool } = require('exiftool-vendored');
import path from "node:path"

export async function setGPSMetadata(imagePath: string, latitude: number | undefined, longitude: number | undefined) {
  const exiftool = new ExifTool();
  if(latitude == undefined || longitude == undefined ) throw Error();
  console.log(latitude, "IS THE LAT FOR GPS", longitude, "IS THE LONG")
  // imagePath = path.join(__dirname, "..", "..", "..", "savedImages", imagePath)
  
  try {
    // Convert latitude and longitude to the format required by ExifTool
    const latRef = latitude >= 0 ? 'N' : 'S';
    const lonRef = longitude >= 0 ? 'E' : 'W';
    const absLat = Math.abs(latitude);
    const absLon = Math.abs(longitude);
    
    const latDeg = Math.floor(absLat);
    const latMin = Math.floor((absLat - latDeg) * 60);
    const latSec = ((absLat - latDeg) * 60 - latMin) * 60;

    const lonDeg = Math.floor(absLon);
    const lonMin = Math.floor((absLon - lonDeg) * 60);
    const lonSec = ((absLon - lonDeg) * 60 - lonMin) * 60;

    // Set GPS metadata
    await exiftool.write(imagePath, {
      GPSLatitudeRef: latRef,
      GPSLatitude: `${latDeg} ${latMin} ${latSec.toFixed(2)}`,
      GPSLongitudeRef: lonRef,
      GPSLongitude: `${lonDeg} ${lonMin} ${lonSec.toFixed(2)}`,
    });

    console.log(`GPS metadata set to Latitude: ${latitude}, Longitude: ${longitude}`);
  } catch (error) {
    console.error('Error setting GPS metadata:', error);
  } finally {
    // Ensure the ExifTool process is closed to prevent hanging
    await exiftool.end();
  }
}

// Usage example
// const imagePath = 'path/to/your/image.jpg';
// const latitude = 40.748817;  // Example latitude
// const longitude = -73.985428; // Example longitude

// setGPSMetadata(imagePath, latitude, longitude);

import sys
import os
import geopandas as gpd
from shapely.geometry import Point
import pandas as pd

def convert_csv_to_shapefile(csv_filename, target_folder):
    # Read CSV file into a pandas DataFrame
    df = pd.read_csv(csv_filename)

    # Convert DataFrame to a GeoDataFrame
    geometry = [Point(lon, lat) for lat, lon in zip(df['Latitude'], df['Longitude'])]
    gdf = gpd.GeoDataFrame(df, geometry=geometry)

    # Manually specify the CRS (coordinate reference system)
    # Adjust the EPSG code according to your data's spatial reference
    crs = {'init': 'epsg:4326'}  # WGS84

    # Set the CRS for the GeoDataFrame
    gdf.crs = crs

    # Save the GeoDataFrame to a Shapefile in the target folder
    output_shapefile = os.path.join(target_folder, 'output.shp')
    gdf.to_file(output_shapefile)

if __name__ == "__main__":
    # Ensure both CSV filename and target folder name are provided
    if len(sys.argv) != 3:
        print("Usage: python convert_csv_to_shapefile.py <csv_filename> <target_folder>")
        sys.exit(1)

    # Extract command line arguments
    csv_filename = sys.argv[1]
    target_folder = sys.argv[2]

    # Create the target folder if it doesn't exist
    if not os.path.exists(target_folder):
        os.makedirs(target_folder)

    # Convert CSV to Shapefile
    convert_csv_to_shapefile(csv_filename, target_folder)

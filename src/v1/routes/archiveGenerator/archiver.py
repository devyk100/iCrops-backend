import os
import sys
import shutil

def zip_folder(folder_path, output_path):
    """
    Zip the contents of an entire folder (with that folder included
    in the archive). Empty sub-folders will be included in the archive
    as well.
    
    :param folder_path: The folder to zip.
    :param output_path: The path to the output zip file.
    """
    shutil.make_archive(output_path,'zip', folder_path)


if __name__ == "__main__":
    # Ensure both CSV filename and target folder name are provided
    if len(sys.argv) != 3:
        print("Usage: python archiver.py <folder_path> <output_file>")
        sys.exit(1)

    # Extract command line arguments
    folder_path = sys.argv[1]
    output_file = sys.argv[2]

    # Create the target folder if it doesn't exist
    # if not os.path.exists(target_folder):
    #     os.makedirs(target_folder)

    # Convert CSV to Shapefile
    zip_folder(folder_path, output_file)

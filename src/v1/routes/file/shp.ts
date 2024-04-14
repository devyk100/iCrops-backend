import { Router } from "express";
import { requestForFullData } from "../data/fetcher";
// import { csvGenerator } from "../archiveGenerator";
import fs from "node:fs"
import {exec} from "node:child_process"
import { stringify } from "csv-stringify";
const { spawn } = require('child_process');
const path = require('path');

const csvGenerator = async (newResponse: any, zipFolderName: string) => {
    const filename = crypto.randomUUID();
    const columns: string[] = [
      "data-id",
      "Latitude",
      "Longitude",
      "Accuracy",
      "Land Cover",
      "Description",
      "Email",
      "Water Source",
      "Crop Intensity",
      "Primary Season",
      "Primary Crop",
      "Secondary Season",
      "Secondary Crop",
      "Livestock",
      "Cropping Pattern",
      "Crop Growth Stage",
      "Remarks",
      "Sample Size 1",
      "Sample Size 2",
      "Biomass Weight",
      "Cultivar",
      "Sow Date",
      "Harvest Date",
    ];
    const writableStream = fs.createWriteStream(
      path.join(__dirname, zipFolderName, filename + ".csv")
    );
    const stringifier = stringify({ header: true, columns: columns });
  //   let newResponse = await requestForData(req);
    for (let a of newResponse.data) {
      let row = {
        "data-id":a.id.toString(),
        Latitude: a.latitude.toString(),
        Longitude: a.longitude.toString(),
        Accuracy: a.accuracy.toString(),
        "Land Cover": a.landCover,
        Description: a.description,
        Email: a.user.email,
        "Sample Size 1": a.CCEdata[0]?.sampleSize_1,
        "Sample Size 2": a.CCEdata[0]?.sampleSize_1,
        "Biomass Weight": a.CCEdata[0]?.biomassWeight,
        Cultivar: a.CCEdata[0]?.cultivar,
        "Sow Date": a.CCEdata[0]?.sowDate.toDateString(),
        "Harvest Date": a.CCEdata[0]?.harvestDate.toDateString(),
        "Water Source": a.cropInformation[0]?.waterSource,
        "Crop Intensity": a.cropInformation[0]?.cropIntensity,
        "Primary Season": a.cropInformation[0]?.primarySeason,
        "Primary Crop": a.cropInformation[0]?.primaryCrop,
        "Secondary Season": a.cropInformation[0]?.secondarySeason,
        "Secondary Crop": a.cropInformation[0]?.secondaryCrop,
        Livestock: a.cropInformation[0]?.livestock,
        "Cropping Pattern": a.cropInformation[0]?.croppingPattern,
        "Crop Growth Stage": a.cropInformation[0]?.cropGrowthStage,
        Remarks: a.cropInformation[0]?.remarks,
      };
      stringifier.write(row);
    }
    await stringifier.pipe(writableStream);
    return filename + ".csv";
  };
  
function convertCsvToShapefile(csvFilename:string, targetFolder:string) {
    return new Promise((resolve, reject) => {
        const pythonScriptPath = path.join(__dirname, 'main.py');
        const pythonProcess = spawn('python3', [pythonScriptPath, csvFilename, targetFolder]);
        pythonProcess.stdout.on('data', (data:string) => {
            console.log(`stdout: ${data}`);
        });

        pythonProcess.stderr.on('data', (data:string) => {
            console.error(`stderr: ${data}`);
        });
        pythonProcess.on('close', (code:number) => {
            if (code === 0) {
                resolve('Conversion successful');
            } else {
                reject(`Conversion failed with code ${code}`);
            }
        });
    });
}
// const csvFilename = 'your_csv_file.csv';
// const targetFolder = 'target_folder';

// convertCsvToShapefile(csvFilename, targetFolder)
//     .then((result) => {
//         console.log(result);
//     })
//     .catch((error) => {
//         console.error(error);
//     });


const shpFileRouter = Router();


shpFileRouter.post("", async (req, res) => {
    try{

        const newResponse = await requestForFullData(req)
        const zipFolderName = crypto.randomUUID();
        const zipFileName = zipFolderName+".zip"
        fs.mkdirSync(path.join(__dirname, zipFolderName));
        const csv = await csvGenerator(newResponse, zipFolderName);
        const csvFileName = path.join(__dirname,zipFolderName , csv);
        await convertCsvToShapefile(csvFileName, path.join(__dirname,zipFolderName));
        exec(
            `cd ${path.join(
                __dirname,
                zipFolderName
                )} && zip -r ${zipFileName} . && cd ..`,
                function (err, stdout, stderr) {
                    console.log(err, stdout, stderr);
                    const filePath = path.join(__dirname, zipFolderName, zipFileName);
                    const fileStream = fs.createReadStream(filePath);
                    fileStream.pipe(res);
                    if(err) res.send("Failed to convert to zip")
                    setTimeout(() => {
                console.log("deleted "+zipFolderName)
                fs.rmSync(path.join(__dirname, zipFolderName), {
                    recursive: true,
                    force: true
                });
            }, 200000);
        }
        );
    }
    catch(e){
        res.send("something")
        console.log(e)
    }
    })
    
    export default shpFileRouter;
    
    
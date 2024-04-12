"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adm_zip_1 = __importDefault(require("adm-zip"));
// var AdmZip = require("adm-zip");
const node_path_1 = __importDefault(require("node:path"));
const filter_1 = require("../data/filter");
const client_1 = require("@prisma/client");
const node_fs_1 = __importDefault(require("node:fs"));
const csv_stringify_1 = require("csv-stringify");
const node_child_process_1 = require("node:child_process");
const archiveRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const csvGenerator = (req, zipFolderName) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    const filename = crypto.randomUUID();
    const columns = [
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
    const writableStream = node_fs_1.default.createWriteStream(node_path_1.default.join(__dirname, zipFolderName, filename + ".csv"));
    const stringifier = (0, csv_stringify_1.stringify)({ header: true, columns: columns });
    let newResponse = yield requestForData(req);
    for (let a of newResponse.data) {
        let row = {
            Latitude: a.latitude.toString(),
            Longitude: a.longitude.toString(),
            Accuracy: a.accuracy.toString(),
            "Land Cover": a.landCover,
            Description: a.description,
            Email: a.user.email,
            "Sample Size 1": (_a = a.CCEdata[0]) === null || _a === void 0 ? void 0 : _a.sampleSize_1,
            "Sample Size 2": (_b = a.CCEdata[0]) === null || _b === void 0 ? void 0 : _b.sampleSize_1,
            "Biomass Weight": (_c = a.CCEdata[0]) === null || _c === void 0 ? void 0 : _c.biomassWeight,
            Cultivar: (_d = a.CCEdata[0]) === null || _d === void 0 ? void 0 : _d.cultivar,
            "Sow Date": (_e = a.CCEdata[0]) === null || _e === void 0 ? void 0 : _e.sowDate.toDateString(),
            "Harvest Date": (_f = a.CCEdata[0]) === null || _f === void 0 ? void 0 : _f.harvestDate.toDateString(),
            "Water Source": (_g = a.cropInformation[0]) === null || _g === void 0 ? void 0 : _g.waterSource,
            "Crop Intensity": (_h = a.cropInformation[0]) === null || _h === void 0 ? void 0 : _h.cropIntensity,
            "Primary Season": (_j = a.cropInformation[0]) === null || _j === void 0 ? void 0 : _j.primarySeason,
            "Primary Crop": (_k = a.cropInformation[0]) === null || _k === void 0 ? void 0 : _k.primaryCrop,
            "Secondary Season": (_l = a.cropInformation[0]) === null || _l === void 0 ? void 0 : _l.secondarySeason,
            "Secondary Crop": (_m = a.cropInformation[0]) === null || _m === void 0 ? void 0 : _m.secondaryCrop,
            Livestock: (_o = a.cropInformation[0]) === null || _o === void 0 ? void 0 : _o.livestock,
            "Cropping Pattern": (_p = a.cropInformation[0]) === null || _p === void 0 ? void 0 : _p.croppingPattern,
            "Crop Growth Stage": (_q = a.cropInformation[0]) === null || _q === void 0 ? void 0 : _q.cropGrowthStage,
            Remarks: (_r = a.cropInformation[0]) === null || _r === void 0 ? void 0 : _r.remarks,
        };
        stringifier.write(row);
    }
    yield stringifier.pipe(writableStream);
    return filename + ".csv";
});
const requestForData = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const pageNo = body.pageNo;
    const entries = body.entries;
    console.log("Latitude was sent as ", body.latitude);
    try {
        const response = yield prisma.data.findMany({
            include: {
                cropInformation: {
                    take: 10,
                },
                CCEdata: {
                    take: 10,
                },
                images: {
                    take: 10,
                },
                user: {
                    include: {
                        _count: true,
                    },
                },
            },
        });
        const newResponse = response.filter((value) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
            return ((0, filter_1.filterAndSearch)(body.latitude, value.latitude) &&
                (0, filter_1.filterAndSearch)(body.longitude, value.longitude) &&
                (0, filter_1.filterAndSearch)(body.accuracy, value.accuracy) &&
                (0, filter_1.filterAndSearch)(body.landCover, value.landCover) &&
                (0, filter_1.filterAndSearch)(body.description, value.description) &&
                (0, filter_1.filterAndSearch)(body.email, value.user.email) &&
                (0, filter_1.filterAndSearch)(body.sampleSize_1, (_a = value.CCEdata[0]) === null || _a === void 0 ? void 0 : _a.sampleSize_1) &&
                (0, filter_1.filterAndSearch)(body.sampleSize_2, (_b = value.CCEdata[0]) === null || _b === void 0 ? void 0 : _b.sampleSize_2) &&
                (0, filter_1.filterAndSearch)(body.biomassWeight, (_c = value.CCEdata[0]) === null || _c === void 0 ? void 0 : _c.biomassWeight) &&
                (0, filter_1.filterAndSearch)(body.cultivar, (_d = value.CCEdata[0]) === null || _d === void 0 ? void 0 : _d.cultivar) &&
                (0, filter_1.filterAndSearch)(body.sowDate, (_e = value.CCEdata[0]) === null || _e === void 0 ? void 0 : _e.sowDate) &&
                (0, filter_1.filterAndSearch)(body.harvestDate, (_f = value.CCEdata[0]) === null || _f === void 0 ? void 0 : _f.harvestDate) &&
                (0, filter_1.filterAndSearch)(body.waterSource, (_g = value.cropInformation[0]) === null || _g === void 0 ? void 0 : _g.waterSource) &&
                (0, filter_1.filterAndSearch)(body.cropIntensity, (_h = value.cropInformation[0]) === null || _h === void 0 ? void 0 : _h.cropIntensity) &&
                (0, filter_1.filterAndSearch)(body.primarySeason, (_j = value.cropInformation[0]) === null || _j === void 0 ? void 0 : _j.primarySeason) &&
                (0, filter_1.filterAndSearch)(body.primaryCrop, (_k = value.cropInformation[0]) === null || _k === void 0 ? void 0 : _k.primaryCrop) &&
                (0, filter_1.filterAndSearch)(body.secondarySeason, (_l = value.cropInformation[0]) === null || _l === void 0 ? void 0 : _l.secondarySeason) &&
                (0, filter_1.filterAndSearch)(body.secondaryCrop, (_m = value.cropInformation[0]) === null || _m === void 0 ? void 0 : _m.secondaryCrop) &&
                (0, filter_1.filterAndSearch)(body.livestock, (_o = value.cropInformation[0]) === null || _o === void 0 ? void 0 : _o.livestock) &&
                (0, filter_1.filterAndSearch)(body.croppingPattern, (_p = value.cropInformation[0]) === null || _p === void 0 ? void 0 : _p.croppingPattern) &&
                (0, filter_1.filterAndSearch)(body.cropGrowthStage, (_q = value.cropInformation[0]) === null || _q === void 0 ? void 0 : _q.cropGrowthStage) &&
                (0, filter_1.filterAndSearch)(body.remarks, (_r = value.cropInformation[0]) === null || _r === void 0 ? void 0 : _r.remarks));
        });
        const count = yield prisma.data.count();
        console.log(count, "is the count");
        return {
            data: newResponse,
            count: count,
        };
    }
    catch (e) {
        console.log(e);
        return {
            data: [],
        };
    }
});
archiveRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newResponse = yield requestForData(req);
    const zipFolderName = crypto.randomUUID();
    const zipFileName = zipFolderName + ".zip";
    node_fs_1.default.mkdirSync(node_path_1.default.join(__dirname, zipFolderName));
    var zip = new adm_zip_1.default("", {
        readEntries: true,
    });
    const csvfilename = yield csvGenerator(req, zipFolderName);
    // fs.copyFileSync(path.join(__dirname, csvfilename), path.join(__dirname, zipFolderName, csvfilename));
    for (let value of newResponse.data) {
        if (value.images.length > 0)
            node_fs_1.default.mkdirSync(node_path_1.default.join(__dirname, zipFolderName, `data-entry-${value.id}`));
        for (let imageFileName of value.images) {
            node_fs_1.default.copyFileSync(node_path_1.default.join(__dirname, "..", "..", "..", "..", "savedImages", imageFileName.fileName), node_path_1.default.join(__dirname, zipFolderName, `data-entry-${imageFileName.dataId}`, `data-${imageFileName.dataId}-image-${imageFileName.id}.jpg`));
        }
    }
    // //   const bufferData = fs.readFileSync(path.join(__dirname, csvfilename))
    //   zip.addLocalFolder(path.join(__dirname, zipFolderName));
    //   zip.writeZip(path.join(__dirname, zipFileName));
    (0, node_child_process_1.exec)(`cd ${node_path_1.default.join(__dirname, zipFolderName)} && zip -r ${zipFileName} . && cd ..`, function (err, stdout, stderr) {
        console.log(err, stdout, stderr);
        const filePath = node_path_1.default.join(__dirname, zipFolderName, zipFileName); // Provide the path to your file
        const fileStream = node_fs_1.default.createReadStream(filePath);
        fileStream.pipe(res);
        setTimeout(() => {
            node_fs_1.default.rmdirSync(node_path_1.default.join(__dirname, zipFolderName));
        }, 200000);
    });
}));
exports.default = archiveRouter;

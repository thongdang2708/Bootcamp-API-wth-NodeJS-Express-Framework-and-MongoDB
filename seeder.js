
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config({path: "./config/config.env"});

let Bootcamp = require("./models/bootcamp");
let Course = require("./models/course");

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8"));
let courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`,"utf-8"));

const importData = async () => {

    try {

        await Bootcamp.create(bootcamps);
        // await Course.create(courses);

        console.log("Data imported".green.inverse);

        process.exit();

    } catch (err) {
        console.error(err);
    }


};

const deleteData = async () => {

    try {

        await Bootcamp.deleteMany();
        // await Course.deleteMany();

        console.log("Data deleted".red.inverse);

        process.exit();


    } catch (err) {
        console.error(err);
    }
};

if (process.argv[2] === "-i") {
    importData();
} else if (process.argv[2] === "-d") {
    deleteData();
}
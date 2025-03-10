require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB-Verbindung
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB verbunden"))
    .catch(err => console.log(err));

// Mongoose Schema für Bilder
const ImageSchema = new mongoose.Schema({
    name: String,
    data: Buffer,
    contentType: String
});

const Image = mongoose.model("Image", ImageSchema);

// Multer Speicher-Setup (Speicherung im Speicher, später in MongoDB)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route für den Upload
app.post("/upload", upload.single("image"), async (req, res) => {
    try {
        const newImage = new Image({
            name: req.file.originalname,
            data: req.file.buffer,
            contentType: req.file.mimetype
        });

        await newImage.save();
        res.json({ message: "Bild hochgeladen!", imageId: newImage._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route zum Abrufen eines Bildes
app.get("/image/:id", async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) return res.status(404).json({ error: "Bild nicht gefunden" });

        res.set("Content-Type", image.contentType);
        res.send(image.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));

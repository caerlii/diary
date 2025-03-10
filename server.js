require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Cloudinary Konfiguration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Speicher (temporär auf Server speichern)
const upload = multer({ dest: "uploads/" });

// Bild-Upload Route
app.post("/upload", upload.single("image"), async (req, res) => {
    try {
        console.log("Datei empfangen:", req.file);

        if (!req.file) {
            return res.status(400).json({ error: "Keine Datei hochgeladen" });
        }

        const result = await cloudinary.uploader.upload(req.file.path);
        console.log("Cloudinary Response:", result);

        fs.unlinkSync(req.file.path); // Temporäre Datei löschen

        res.json({ imageUrl: result.secure_url });
    } catch (err) {
        console.error("Fehler beim Hochladen:", err);
        res.status(500).json({ error: err.message });
    }
});

// Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));

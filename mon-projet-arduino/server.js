const express = require("express");
const bodyParser = require("body-parser");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Configuration du port série
const serialPort = new SerialPort({
  path: "COM4", // Remplacez par le port série de votre Arduino
  baudRate: 9600,
});

const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\n" }));

// Stockage des données en temps réel
let lastCardData = null;

// Écoute des données envoyées par l'Arduino
parser.on("data", (data) => {
  try {
    console.log("Données reçues de l'Arduino :", data);

    // Analyse et stockage des données (si au format JSON)
    if (data.includes("{") && data.includes("}")) {
      lastCardData = JSON.parse(data);
    }
  } catch (error) {
    console.error("Erreur lors de la réception des données :", error);
  }
});

// Route pour récupérer les données en temps réel
app.get("/api/data", (req, res) => {
  if (lastCardData) {
    res.json(lastCardData);
  } else {
    res.status(404).json({ message: "Aucune donnée reçue pour le moment." });
  }
});

// Route pour envoyer des commandes à l'Arduino
app.post("/api/command", (req, res) => {
  const { command } = req.body;

  if (command === "OPEN" || command === "CLOSE") {
    serialPort.write(`${command}\n`, (err) => {
      if (err) {
        return res.status(500).json({ message: "Erreur lors de l'envoi de la commande." });
      }
      res.json({ message: `Commande "${command}" envoyée à l'Arduino.` });
    });
  } else {
    res.status(400).json({ message: "Commande non valide." });
  }
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Serveur API Node.js démarré sur http://localhost:${PORT}`);
});

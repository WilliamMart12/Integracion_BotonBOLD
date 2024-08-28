const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS para permitir solicitudes desde tu frontend en Render
app.use(cors({
    origin: 'https://integracion-botonbold-front.onrender.com', // URL de tu frontend
    methods: 'GET,POST,PUT,DELETE', // Métodos HTTP permitidos
    allowedHeaders: 'Content-Type,Authorization', // Encabezados permitidos
}));

app.use(express.json());

const SECRET_KEY = ''; // Añade la secret key de tu cuenta BOLD

// Ruta para crear el pago
app.post('/create-payment', (req, res) => {
    const { orderId, amount, currency } = req.body;

    if (!orderId || !amount || !currency) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const dataToSign = `${orderId}${amount}${currency}${SECRET_KEY}`;
    const hash = crypto.createHmac('sha256', SECRET_KEY)
                       .update(dataToSign)
                       .digest('hex');

    res.json({ integritySignature: hash });
});

// Ruta para redireccionar después del pago
app.get('*', (req, res) => {
    const { 'bold-order-id': orderId, 'bold-tx-status': status } = req.query;
    const liveServerUrl = `https://integracion-botonbold-front.onrender.com`; // Cambia la URL a la de tu frontend en Render
    const redirectUrl = `${liveServerUrl}?bold-order-id=${orderId}&bold-tx-status=${status}`;
    res.redirect(redirectUrl);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

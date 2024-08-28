const apiUrl = 'https://dummyjson.com/products';
const limit = 6;
let skip = 0;
const productsContainer = document.getElementById('products');
const cart = [];

async function fetchProducts() {
    const response = await fetch(`${apiUrl}?limit=${limit}&skip=${skip}`);
    const data = await response.json();
    displayProducts(data.products);
}

function displayProducts(products) {
    productsContainer.innerHTML = products.map(product => `
        <div class="product">
            <img src="${product.thumbnail}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>$${product.price}</p>
            <button onclick="addToCart(${product.id}, '${product.title}', ${product.price})">Add to Cart</button>
        </div>
    `).join('');
}

function addToCart(id, title, price) {
    cart.push({ id, title, price: Math.round(price * 100) });
    updateCartCount();
    displayCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    displayCart();
}

function updateCartCount() {
    document.getElementById('cart-count').textContent = cart.length;
}

function displayCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartDetailsContainer = document.getElementById('cart-details');

    if (cart.length === 0) {
        cartDetailsContainer.classList.remove('active');
        cartDetailsContainer.style.display = 'none';
    } else {
        cartDetailsContainer.style.display = 'block';
        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div>
                ${item.title} - $${(item.price / 100).toFixed(2)}
                <button onclick="removeFromCart(${index})">Remove</button>
            </div>
        `).join('');
    }
}

document.getElementById('cart-icon').addEventListener('click', () => {
    const cartDetailsContainer = document.getElementById('cart-details');
    if (cart.length > 0) {
        cartDetailsContainer.classList.toggle('active');
    }
});

document.getElementById('pay-button').addEventListener('click', async () => {
    const orderId = "ABCD3018";
    const currency = "COP";
    const amount = cart.reduce((total, product) => total + product.price, 0);
    const apiKey = ""; // Añade la Api key de tu cuenta BOLD
    const redirectionUrl = "https://integracion-botonbold-front.onrender.com"; // URL de tu frontend en Render
    const integritySignature = await generateIntegritySignature(orderId, amount, currency, ""); // Añade la secret key de tu cuenta BOLD
    const description = "Compra en mi tienda";

    const response = await fetch('https://integracion-botonbold-back.onrender.com/create-payment', {  // URL de tu backend en Render
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount, currency })
    });

    const checkout = new BoldCheckout({
        orderId: orderId,
        currency: currency,
        amount: amount,
        apiKey: apiKey,
        redirectionUrl: redirectionUrl,
        integritySignature: integritySignature,
        description: description,
        tax: "vat-19",
    });

    checkout.open();
});

async function generateIntegritySignature(orderId, amount, currency, secretKey) {
    const dataToSign = `${orderId}${amount}${currency}${secretKey}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(dataToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function nextPage() {
    skip += limit;
    fetchProducts();
}

function previousPage() {
    if (skip >= limit) {
        skip -= limit;
        fetchProducts();
    }
}

fetchProducts();

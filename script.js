class CakeStore {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('cakes')) || [
            {
                id: 1,
                name: "Шоколадний торт",
                price: 350,
                image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
                category: "chocolate",
                description: "Ніжний шоколадний торт з кремом та горіхами"
            },
            {
                id: 2,
                name: "Полуничний рай",
                price: 420,
                image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop",
                category: "fruit",
                description: "Легкий торт зі свіжими полуницями та вершками"
            },
            {
                id: 3,
                name: "Медовик",
                price: 300,
                image: "https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400&h=300&fit=crop",
                category: "classic",
                description: "Традиційний медовий торт з заварним кремом"
            },
            {
                id: 4,
                name: "Наполеон",
                price: 370,
                image: "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=400&h=300&fit=crop",
                category: "classic",
                description: "Класичний торт з листкового тіста та заварним кремом"
            },
            {
                id: 5,
                name: "Чізкейк Нью-Йорк",
                price: 450,
                image: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400&h=300&fit=crop",
                category: "cheesecake",
                description: "Класичний чізкейк з ніжним крем-сиром"
            },
            {
                id: 6,
                name: "Тірамісу",
                price: 400,
                image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop",
                category: "cheesecake",
                description: "Італійський десерт з маскарпоне та кавою"
            }
        ];
        
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.displayProducts();
        this.updateCart();
        this.bindEvents();
        this.setupTheme();
        this.setCurrentYear();
    }

    bindEvents() {
        // Пошук і фільтрація
        document.getElementById('search').addEventListener('input', (e) => this.filterProducts());
        document.getElementById('filter').addEventListener('change', () => this.filterProducts());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearFilters());

        // Кошик
        document.getElementById('openCartBtn').addEventListener('click', () => this.openCart());
        document.getElementById('openCartBtnFloat').addEventListener('click', () => this.openCart());
        document.getElementById('closeCart').addEventListener('click', () => this.closeCart());
        document.getElementById('continueShopping').addEventListener('click', () => this.closeCart());
        document.getElementById('checkoutBtn').addEventListener('click', () => this.checkout());

        // Адмін-панель
        document.addEventListener('keydown', (e) => this.adminLogin(e));
        document.getElementById('adminBtn').addEventListener('click', () => this.openAdmin());
        document.getElementById('closeAdmin').addEventListener('click', () => this.closeAdmin());
        document.getElementById('cancelAdmin').addEventListener('click', () => this.closeAdmin());
        document.getElementById('saveCake').addEventListener('click', () => this.saveCake());

        // Тема
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Закриття модальних вікон
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('show');
            }
        });
    }

    displayProducts(productsToShow = this.products) {
        const grid = document.getElementById('productsGrid');
        grid.innerHTML = '';

        if (productsToShow.length === 0) {
            grid.innerHTML = `
                <div class="no-products" style="grid-column: 1/-1; text-align: center; padding: 60px;">
                    <i class="fas fa-search" style="font-size: 3em; color: var(--primary-pink); margin-bottom: 20px;"></i>
                    <h3 style="color: var(--text-dark); margin-bottom: 10px;">Тортів не знайдено</h3>
                    <p style="color: var(--text-light);">Спробуйте змінити параметри пошуку</p>
                </div>
            `;
            return;
        }

        productsToShow.forEach(product => {
            const productCard = this.createProductCard(product);
            grid.appendChild(productCard);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">${product.price} грн</div>
                <p class="product-description">${product.description}</p>
                <button class="add-to-cart" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i>
                    Додати до кошика
                </button>
            </div>
        `;

        card.querySelector('.add-to-cart').addEventListener('click', () => this.addToCart(product));
        return card;
    }

    filterProducts() {
        const searchTerm = document.getElementById('search').value.toLowerCase();
        const filterValue = document.getElementById('filter').value;

        const filtered = this.products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                product.description.toLowerCase().includes(searchTerm);
            const matchesFilter = filterValue === 'all' || product.category === filterValue;
            
            return matchesSearch && matchesFilter;
        });

        this.displayProducts(filtered);
    }

    clearFilters() {
        document.getElementById('search').value = '';
        document.getElementById('filter').value = 'all';
        this.displayProducts();
    }

    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }
        
        this.updateCart();
        this.showNotification(`${product.name} додано до кошика!`);
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCart();
        this.showNotification('Торт видалено з кошика');
    }

    updateCartQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                this.updateCart();
            }
        }
    }

    updateCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        
        // Оновлення лічильників
        const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
        document.getElementById('cartCount').textContent = totalItems;
        document.getElementById('cartCountFloat').textContent = totalItems;
        
        // Оновлення вмісту кошика
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        cartItems.innerHTML = '';
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-light);">
                    <i class="fas fa-shopping-cart" style="font-size: 3em; margin-bottom: 15px;"></i>
                    <p>Кошик порожній</p>
                </div>
            `;
            cartTotal.textContent = '0';
            return;
        }
        
        let totalPrice = 0;
        
        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">${item.price} грн</div>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn" data-id="${item.id}" data-change="-1">-</button>
                    <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                    <button class="quantity-btn" data-id="${item.id}" data-change="1">+</button>
                    <button class="remove-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            cartItems.appendChild(cartItem);
        });
        
        // Додаємо обробники подій для кнопок кошика
        cartItems.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('button').dataset.id);
                const change = parseInt(e.target.closest('button').dataset.change);
                this.updateCartQuantity(productId, change);
            });
        });
        
        cartItems.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('button').dataset.id);
                this.removeFromCart(productId);
            });
        });
        
        cartTotal.textContent = totalPrice;
    }

    openCart() {
        document.getElementById('cartModal').classList.add('show');
    }

    closeCart() {
        document.getElementById('cartModal').classList.remove('show');
    }

    checkout() {
        if (this.cart.length === 0) {
            this.showNotification('Кошик порожній!');
            return;
        }
        
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.showNotification(`Замовлення оформлено! Сума: ${total} грн. Дякуємо!`);
        
        this.cart = [];
        this.updateCart();
        this.closeCart();
    }

    adminLogin(e) {
        if (e.ctrlKey && e.key === 'a') {
            e.preventDefault();
            const password = prompt('Введіть пароль адміністратора:');
            if (password === 'admin123') {
                this.openAdmin();
            } else {
                this.showNotification('Невірний пароль!', 'error');
            }
        }
    }

    openAdmin() {
        document.getElementById('adminModal').classList.add('show');
    }

    closeAdmin() {
        document.getElementById('adminModal').classList.remove('show');
        document.getElementById('adminForm').reset();
    }

    saveCake() {
        const name = document.getElementById('cakeName').value;
        const price = parseInt(document.getElementById('cakePrice').value);
        const image = document.getElementById('cakeImage').value;
        const category = document.getElementById('cakeCategory').value;
        const description = document.getElementById('cakeDescription').value;
        
        if (!name || !price) {
            this.showNotification('Будь ласка, заповніть назву та ціну!', 'error');
            return;
        }
        
        const newCake = {
            id: Date.now(),
            name,
            price,
            image: image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
            category,
            description: description || 'Смачний торт від Солодкої Крамниці'
        };
        
        this.products.push(newCake);
        localStorage.setItem('cakes', JSON.stringify(this.products));
        this.displayProducts();
        this.closeAdmin();
        this.showNotification('Торт успішно додано!');
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    setCurrentYear() {
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.background = type === 'error' ? '#ff4757' : 'var(--primary-pink)';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Ініціалізація додатку
document.addEventListener('DOMContentLoaded', () => {
    new CakeStore();
});
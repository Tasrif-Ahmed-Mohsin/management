// Product Management System JavaScript

class ProductManager {
    constructor() {
        this.products = [];
        this.currentEditId = null;
        this.deleteProductId = null;
        this.apiUrl = '/api/products';
        this.isLoading = false;
        
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.init();
            });
        } else {
            this.init();
        }
    }

    // Initialize the application
    async init() {
        await this.fetchProducts();
        this.initializeEventListeners();
        this.initializePage();
    }

    // Fetch products from API
    async fetchProducts() {
        try {
            this.setLoading(true);
            const response = await fetch(this.apiUrl);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            this.products = await response.json();
            this.setLoading(false);
            return this.products;
        } catch (error) {
            console.error('Error fetching products:', error);
            this.showToast('Failed to load products. Please try again later.', 'error');
            this.setLoading(false);
            return [];
        }
    }

    // Set loading state
    setLoading(isLoading) {
        this.isLoading = isLoading;
        const elements = document.querySelectorAll('.products-grid, .products-table');
        elements.forEach(el => {
            if (isLoading) {
                el.classList.add('loading');
            } else {
                el.classList.remove('loading');
            }
        });
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            // Remove any existing listeners
            link.removeEventListener('click', this.handleNavClick);
            // Add proper click handler
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const page = link.getAttribute('data-page');
                console.log('Nav clicked:', page);
                this.switchPage(page);
            });
        });

        // Product form
        const productForm = document.getElementById('product-form');
        if (productForm) {
            productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));
        }

        // Search and filter
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                e.stopPropagation();
                this.filterProducts();
            });
            searchInput.addEventListener('focus', (e) => e.stopPropagation());
        }

        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                e.stopPropagation();
                this.filterProducts();
            });
        }

        // Modal handling
        const deleteModal = document.getElementById('delete-modal');
        const confirmDelete = document.getElementById('confirm-delete');
        const cancelDelete = document.getElementById('cancel-delete');
        
        if (confirmDelete) {
            confirmDelete.addEventListener('click', () => this.confirmDelete());
        }
        if (cancelDelete) {
            cancelDelete.addEventListener('click', () => this.hideModal());
        }
        
        if (deleteModal) {
            deleteModal.addEventListener('click', (e) => {
                if (e.target === deleteModal) this.hideModal();
            });
        }

        // Cancel edit button
        const cancelEdit = document.getElementById('cancel-edit');
        if (cancelEdit) {
            cancelEdit.addEventListener('click', () => this.cancelEdit());
        }

        // Seed database button
        const seedButton = document.getElementById('seed-database');
        if (seedButton) {
            seedButton.addEventListener('click', () => this.seedDatabase());
        }
    }

    // Initialize page display
    initializePage() {
        this.renderProducts();
        this.renderTable();
        this.updateProductCount();
    }

    // Seed database with sample products
    async seedDatabase() {
        try {
            this.setLoading(true);
            const response = await fetch('/api/seed');
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const result = await response.json();
            await this.fetchProducts();
            this.renderProducts();
            this.renderTable();
            this.updateProductCount();
            this.showToast(result.message, 'success');
            this.setLoading(false);
        } catch (error) {
            console.error('Error seeding database:', error);
            this.showToast('Failed to seed database. Please try again later.', 'error');
            this.setLoading(false);
        }
    }

    // Switch between pages
    switchPage(pageName) {
        console.log('Switching to page:', pageName);
        
        try {
            // Update nav links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            const activeLink = document.querySelector(`[data-page="${pageName}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }

            // Update page display
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            const targetPage = document.getElementById(`${pageName}-page`);
            if (targetPage) {
                targetPage.classList.add('active');
                console.log('Page switched successfully to:', pageName);
            } else {
                console.error('Target page not found:', `${pageName}-page`);
            }

            // Refresh data when switching
            if (pageName === 'management') {
                setTimeout(() => this.renderTable(), 100);
            } else if (pageName === 'display') {
                setTimeout(() => {
                    this.renderProducts();
                    this.updateProductCount();
                }, 100);
            }
        } catch (error) {
            console.error('Error switching pages:', error);
        }
    }

    // Handle product form submission
    handleProductSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('product-name').value.trim(),
            category: document.getElementById('product-category').value,
            price: parseFloat(document.getElementById('product-price').value),
            stock: parseInt(document.getElementById('product-stock').value),
            description: document.getElementById('product-description').value.trim(),
            imageUrl: document.getElementById('product-image').value.trim() || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop'
        };

        // Validation
        if (!formData.name || !formData.category || !formData.description) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (isNaN(formData.price) || formData.price <= 0) {
            this.showToast('Please enter a valid price', 'error');
            return;
        }

        if (isNaN(formData.stock) || formData.stock < 0) {
            this.showToast('Please enter a valid stock quantity', 'error');
            return;
        }

        if (this.currentEditId) {
            this.updateProduct(this.currentEditId, formData);
        } else {
            this.addProduct(formData);
        }
    }

    // Add new product
    async addProduct(productData) {
        try {
            this.setLoading(true);
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const newProduct = await response.json();
            this.products.push(newProduct);
            this.renderProducts();
            this.renderTable();
            this.updateProductCount();
            
            document.getElementById('product-form').reset();
            this.showToast('Product added successfully!', 'success');
            this.setLoading(false);
        } catch (error) {
            console.error('Error adding product:', error);
            this.showToast('Failed to add product. Please try again.', 'error');
            this.setLoading(false);
        }
    }

    // Update existing product
    async updateProduct(id, productData) {
        try {
            this.setLoading(true);
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const updatedProduct = await response.json();
            const productIndex = this.products.findIndex(p => p._id === id);
            if (productIndex !== -1) {
                this.products[productIndex] = updatedProduct;
            }
            
            this.renderProducts();
            this.renderTable();
            
            document.getElementById('product-form').reset();
            const cancelEditBtn = document.getElementById('cancel-edit');
            if (cancelEditBtn) {
                cancelEditBtn.classList.add('hidden');
            }
            this.currentEditId = null;
            
            this.showToast('Product updated successfully!', 'success');
            this.setLoading(false);
        } catch (error) {
            console.error('Error updating product:', error);
            this.showToast('Failed to update product. Please try again.', 'error');
            this.setLoading(false);
        }
    }

    // Delete product
    deleteProduct(id) {
        this.deleteProductId = id;
        this.showModal();
    }

    // Confirm delete
    async confirmDelete() {
        if (this.deleteProductId) {
            try {
                this.setLoading(true);
                const response = await fetch(`${this.apiUrl}/${this.deleteProductId}`, {
                    method: 'DELETE',
                });
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                this.products = this.products.filter(p => p._id !== this.deleteProductId);
                this.renderProducts();
                this.renderTable();
                this.updateProductCount();
                
                this.showToast('Product deleted successfully!', 'success');
                this.hideModal();
                this.deleteProductId = null;
                this.setLoading(false);
            } catch (error) {
                console.error('Error deleting product:', error);
                this.showToast('Failed to delete product. Please try again.', 'error');
                this.setLoading(false);
                this.hideModal();
            }
        }
    }

    // Edit product (populate form)
    editProduct(id) {
        const product = this.products.find(p => p._id === id);
        if (product) {
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-stock').value = product.stock;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-image').value = product.imageUrl || '';
            
            this.currentEditId = id;
            const cancelEditBtn = document.getElementById('cancel-edit');
            if (cancelEditBtn) {
                cancelEditBtn.classList.remove('hidden');
            }
            
            // Scroll to form smoothly
            setTimeout(() => {
                document.getElementById('product-form').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    }

    // Cancel edit
    cancelEdit() {
        document.getElementById('product-form').reset();
        const cancelEditBtn = document.getElementById('cancel-edit');
        if (cancelEditBtn) {
            cancelEditBtn.classList.add('hidden');
        }
        this.currentEditId = null;
    }

    // Inline edit cell
    async editCell(element, productId, field) {
        if (element.classList.contains('editing')) return;
        
        // Get current value, clean it up
        let currentValue = element.textContent || element.innerText || '';
        currentValue = currentValue.replace('$', '').replace('Stock: ', '').trim();
        
        console.log('Editing cell:', field, 'Current value:', currentValue);
        
        element.classList.add('editing');
        const originalContent = element.innerHTML;
        
        const input = document.createElement('input');
        input.type = (field === 'price' || field === 'stock') ? 'number' : 'text';
        input.value = currentValue;
        input.style.cssText = `
            width: 100%;
            background: transparent;
            border: 2px solid var(--color-primary);
            outline: none;
            color: inherit;
            font-size: inherit;
            font-family: inherit;
            padding: 4px 8px;
            border-radius: 4px;
        `;
        
        if (field === 'price') {
            input.step = '0.01';
            input.min = '0';
        } else if (field === 'stock') {
            input.min = '0';
        }
        
        element.innerHTML = '';
        element.appendChild(input);
        
        // Focus and select
        setTimeout(() => {
            input.focus();
            input.select();
        }, 50);
        
        const saveEdit = async () => {
            const newValue = input.value.trim();
            element.classList.remove('editing');
            
            if (newValue && newValue !== currentValue) {
                try {
                    const product = this.products.find(p => p._id === productId);
                    if (product) {
                        const updateData = { ...product };
                        
                        // Update the specific field
                        if (field === 'price') {
                            const numValue = parseFloat(newValue);
                            if (!isNaN(numValue) && numValue >= 0) {
                                updateData[field] = numValue;
                            } else {
                                element.innerHTML = originalContent;
                                return;
                            }
                        } else if (field === 'stock') {
                            const numValue = parseInt(newValue);
                            if (!isNaN(numValue) && numValue >= 0) {
                                updateData[field] = numValue;
                            } else {
                                element.innerHTML = originalContent;
                                return;
                            }
                        } else {
                            updateData[field] = newValue;
                        }
                        
                        // Send update to API
                        this.setLoading(true);
                        const response = await fetch(`${this.apiUrl}/${productId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ [field]: updateData[field] }),
                        });
                        
                        if (!response.ok) {
                            throw new Error(`API error: ${response.status}`);
                        }
                        
                        const updatedProduct = await response.json();
                        const productIndex = this.products.findIndex(p => p._id === productId);
                        if (productIndex !== -1) {
                            this.products[productIndex] = updatedProduct;
                        }
                        
                        this.renderProducts();
                        this.renderTable();
                        this.showToast(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`, 'success');
                        this.setLoading(false);
                    } else {
                        element.innerHTML = originalContent;
                    }
                } catch (error) {
                    console.error('Error updating product:', error);
                    this.showToast('Failed to update product. Please try again.', 'error');
                    element.innerHTML = originalContent;
                    this.setLoading(false);
                }
            } else {
                element.innerHTML = originalContent;
            }
        };
        
        const cancelEdit = () => {
            element.classList.remove('editing');
            element.innerHTML = originalContent;
        };
        
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });
    }

    // Render products grid
    renderProducts() {
        const grid = document.getElementById('products-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (!grid || !emptyState) return;
        
        const filteredProducts = this.getFilteredProducts();
        
        if (filteredProducts.length === 0) {
            grid.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        grid.innerHTML = filteredProducts.map(product => `
            <div class="product-card">
                <img src="${product.imageUrl}" alt="${product.name}" class="product-card__image" 
                     onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop'">
                <div class="product-card__content">
                    <h3 class="product-card__name">${product.name}</h3>
                    <p class="product-card__description">${product.description}</p>
                    <div class="product-card__details">
                        <div class="product-card__info">
                            <div class="product-card__price">$${product.price.toFixed(2)}</div>
                            <div class="product-card__category">${product.category}</div>
                        </div>
                        <div class="product-card__stock">
                            <span class="status ${product.stock < 5 ? 'stock-low' : 'status--success'}">
                                Stock: ${product.stock}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Render products table
    renderTable() {
        const tbody = document.getElementById('products-table-body');
        
        if (!tbody) return;
        
        if (this.products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--color-text-secondary);">No products found</td></tr>';
            return;
        }
        
        tbody.innerHTML = this.products.map(product => `
            <tr>
                <td>
                    <div class="editable-cell" data-product-id="${product._id}" data-field="name">
                        ${product.name}
                    </div>
                </td>
                <td>
                    <div class="editable-cell" data-product-id="${product._id}" data-field="category">
                        ${product.category}
                    </div>
                </td>
                <td>
                    <div class="editable-cell" data-product-id="${product._id}" data-field="price">
                        $${product.price.toFixed(2)}
                    </div>
                </td>
                <td>
                    <div class="editable-cell" data-product-id="${product._id}" data-field="stock">
                        <span class="status ${product.stock < 5 ? 'stock-low' : 'status--success'}">
                            ${product.stock}
                        </span>
                    </div>
                </td>
                <td>
                    <div class="editable-cell cell-description" data-product-id="${product._id}" data-field="description" 
                         title="${product.description}">
                        ${product.description}
                    </div>
                </td>
                <td>
                    <div class="cell-actions">
                        <button class="btn-icon btn-delete" data-product-id="${product._id}" 
                                title="Delete Product">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Add click handlers to editable cells
        tbody.querySelectorAll('.editable-cell').forEach(cell => {
            cell.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = cell.getAttribute('data-product-id');
                const field = cell.getAttribute('data-field');
                this.editCell(cell, productId, field);
            });
        });

        // Add click handlers to delete buttons
        tbody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = btn.getAttribute('data-product-id');
                this.deleteProduct(productId);
            });
        });
    }

    // Filter and sort products
    getFilteredProducts() {
        const searchInput = document.getElementById('search-input');
        const sortSelect = document.getElementById('sort-select');
        
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const sortBy = sortSelect ? sortSelect.value : 'name';
        
        let filtered = this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
        
        // Sort products
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price':
                    return a.price - b.price;
                case 'dateAdded':
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
                default:
                    return 0;
            }
        });
        
        return filtered;
    }

    // Apply filters
    filterProducts() {
        this.renderProducts();
    }

    // Update product count
    updateProductCount() {
        const countElement = document.getElementById('product-count');
        if (countElement) {
            const count = this.products.length;
            countElement.textContent = count;
        }
    }

    // Show modal
    showModal() {
        const modal = document.getElementById('delete-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    // Hide modal
    hideModal() {
        const modal = document.getElementById('delete-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Show toast notification
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application when DOM is ready
let productManager;

function initializeApp() {
    productManager = new ProductManager();
    window.productManager = productManager;
    console.log('Product Manager initialized');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
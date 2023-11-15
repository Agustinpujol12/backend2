const fs = require('fs/promises');

class ProductManager {
  constructor(path) {
    this.path = path;
  }

  async getProducts() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async getProductById(id) {
    try {
      const products = await this.getProducts();
      return products.find((product) => product.id === id);
    } catch (error) {
      throw new Error('Error fetching product: ' + error.message);
    }
  }

  async addProduct(product) {
    try {
      const products = await this.getProducts();
      const newProduct = {
        ...product,
        id: products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1,
      };
      products.push(newProduct);
      await fs.writeFile(this.path, JSON.stringify(products, null, 2));
      return newProduct;
    } catch (error) {
      throw new Error('Error adding product: ' + error.message);
    }
  }

  async updateProduct(id, updatedFields) {
    try {
      const products = await this.getProducts();
      const index = products.findIndex((product) => product.id === id);

      if (index !== -1) {
        // Actualizar solo los campos proporcionados, manteniendo el ID
        products[index] = {
          ...products[index],
          ...updatedFields,
          id: products[index].id,
        };

        // Guardar la lista actualizada en el archivo
        await fs.writeFile(this.path, JSON.stringify(products, null, 2));

        return products[index];
      } else {
        throw new Error('Product not found with id: ' + id);
      }
    } catch (error) {
      throw new Error('Error updating product: ' + error.message);
    }
  }

  async deleteProduct(id) {
    try {
      const products = await this.getProducts();
      const index = products.findIndex((product) => product.id === id);

      if (index !== -1) {
        // Eliminar el producto con el ID proporcionado
        products.splice(index, 1);

        // Guardar la lista actualizada en el archivo
        await fs.writeFile(this.path, JSON.stringify(products, null, 2));

        return { success: true, message: 'Producto eliminado' };
      } else {
        throw new Error('Product not found with id: ' + id);
      }
    } catch (error) {
      throw new Error('Error deleting product: ' + error.message);
    }
  }
}

// Ejemplo de uso
(async () => {
  const productManager = new ProductManager('products.json');
  try {
    // Agregar un producto
    await productManager.addProduct({
      title: 'Zapatilla',
      description: 'Con cordones fluor',
      price: 10000,
      thumbnail: 'nike.jpg',
      code: 'za-001',
      stock: 50,
    });

    // Obtener y mostrar todos los productos
    const productsBeforeDelete = await productManager.getProducts();
    console.log('Productos antes de la eliminación:', productsBeforeDelete);

    // Eliminar un producto por ID
    const deleteResult = await productManager.deleteProduct(1);
    console.log(deleteResult);

    // Obtener y mostrar todos los productos después de la eliminación
    const productsAfterDelete = await productManager.getProducts();
    console.log('Productos después de la eliminación:', productsAfterDelete);
  } catch (error) {
    console.error('Error: ', error.message);
  }
})();

import requests
import sys
import json
from datetime import datetime

class EletroVendasAPITester:
    def __init__(self, base_url="https://eletrovendas.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.sample_product_id = None
        self.sample_cart_item_id = None
        self.sample_order_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, list) and len(response_data) > 0:
                        print(f"   Response: {len(response_data)} items returned")
                    elif isinstance(response_data, dict):
                        print(f"   Response keys: {list(response_data.keys())}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_init_data(self):
        """Initialize sample data"""
        success, response = self.run_test(
            "Initialize Sample Data",
            "POST",
            "init-data",
            200
        )
        return success

    def test_get_products(self):
        """Test getting all products"""
        success, response = self.run_test(
            "Get All Products",
            "GET",
            "products",
            200
        )
        if success and response and len(response) > 0:
            self.sample_product_id = response[0]['id']
            print(f"   Found {len(response)} products")
            print(f"   Sample product: {response[0]['name']}")
        return success

    def test_get_product_by_id(self):
        """Test getting a specific product"""
        if not self.sample_product_id:
            print("❌ Skipped - No sample product ID available")
            return False
            
        success, response = self.run_test(
            "Get Product by ID",
            "GET",
            f"products/{self.sample_product_id}",
            200
        )
        if success and response:
            print(f"   Product: {response.get('name', 'Unknown')}")
        return success

    def test_get_products_by_category(self):
        """Test getting products by category"""
        success, response = self.run_test(
            "Get Products by Category",
            "GET",
            "products/category/geladeira",
            200
        )
        if success and response:
            print(f"   Found {len(response)} refrigerators")
        return success

    def test_create_product(self):
        """Test creating a new product"""
        test_product = {
            "name": "Teste Microondas LG",
            "description": "Microondas de teste com 30 litros",
            "price": 599.99,
            "category": "microondas",
            "brand": "LG",
            "image_url": "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078",
            "in_stock": True,
            "specifications": {
                "capacidade": "30L",
                "potencia": "900W",
                "cor": "Branco"
            }
        }
        
        success, response = self.run_test(
            "Create New Product",
            "POST",
            "products",
            200,
            data=test_product
        )
        if success and response:
            print(f"   Created product: {response.get('name', 'Unknown')}")
        return success

    def test_get_cart(self):
        """Test getting cart items"""
        success, response = self.run_test(
            "Get Cart Items",
            "GET",
            "cart",
            200
        )
        if success:
            print(f"   Cart has {len(response) if response else 0} items")
        return success

    def test_add_to_cart(self):
        """Test adding item to cart"""
        if not self.sample_product_id:
            print("❌ Skipped - No sample product ID available")
            return False
            
        cart_item = {
            "product_id": self.sample_product_id,
            "quantity": 2
        }
        
        success, response = self.run_test(
            "Add Item to Cart",
            "POST",
            "cart",
            200,
            data=cart_item
        )
        if success and response:
            self.sample_cart_item_id = response.get('id')
            print(f"   Added item with ID: {self.sample_cart_item_id}")
        return success

    def test_update_cart_item(self):
        """Test updating cart item quantity"""
        if not self.sample_cart_item_id:
            print("❌ Skipped - No sample cart item ID available")
            return False
            
        success, response = self.run_test(
            "Update Cart Item",
            "PUT",
            f"cart/{self.sample_cart_item_id}?quantity=3",
            200
        )
        return success

    def test_create_order(self):
        """Test creating an order"""
        if not self.sample_product_id:
            print("❌ Skipped - No sample product ID available")
            return False
            
        order_data = {
            "customer_name": "João Silva",
            "customer_email": "joao@teste.com",
            "customer_phone": "(11) 99999-9999",
            "items": [
                {
                    "product_id": self.sample_product_id,
                    "product_name": "Geladeira Teste",
                    "quantity": 1,
                    "price": 2299.99
                }
            ],
            "total_amount": 2299.99
        }
        
        success, response = self.run_test(
            "Create Order",
            "POST",
            "orders",
            200,
            data=order_data
        )
        if success and response:
            self.sample_order_id = response.get('id')
            print(f"   Created order: {self.sample_order_id}")
        return success

    def test_get_order(self):
        """Test getting an order by ID"""
        if not self.sample_order_id:
            print("❌ Skipped - No sample order ID available")
            return False
            
        success, response = self.run_test(
            "Get Order by ID",
            "GET",
            f"orders/{self.sample_order_id}",
            200
        )
        if success and response:
            print(f"   Order customer: {response.get('customer_name', 'Unknown')}")
        return success

    def test_paypal_create_order(self):
        """Test PayPal order creation (demo)"""
        paypal_data = {
            "amount": 2299.99,
            "currency": "BRL"
        }
        
        success, response = self.run_test(
            "Create PayPal Order (Demo)",
            "POST",
            "paypal/create-order",
            200,
            data=paypal_data
        )
        if success and response:
            print(f"   PayPal Order ID: {response.get('id', 'Unknown')}")
        return success

    def test_paypal_capture_order(self):
        """Test PayPal order capture (demo)"""
        success, response = self.run_test(
            "Capture PayPal Order (Demo)",
            "POST",
            "paypal/capture-order/DEMO_ORDER_ID",
            200
        )
        if success and response:
            print(f"   PayPal Status: {response.get('status', 'Unknown')}")
        return success

    def test_remove_cart_item(self):
        """Test removing item from cart"""
        if not self.sample_cart_item_id:
            print("❌ Skipped - No sample cart item ID available")
            return False
            
        success, response = self.run_test(
            "Remove Cart Item",
            "DELETE",
            f"cart/{self.sample_cart_item_id}",
            200
        )
        return success

    def test_clear_cart(self):
        """Test clearing entire cart"""
        success, response = self.run_test(
            "Clear Cart",
            "DELETE",
            "cart",
            200
        )
        return success

def main():
    print("🚀 Starting EletroVendas API Tests")
    print("=" * 50)
    
    tester = EletroVendasAPITester()
    
    # Test sequence
    tests = [
        tester.test_init_data,
        tester.test_get_products,
        tester.test_get_product_by_id,
        tester.test_get_products_by_category,
        tester.test_create_product,
        tester.test_get_cart,
        tester.test_add_to_cart,
        tester.test_update_cart_item,
        tester.test_create_order,
        tester.test_get_order,
        tester.test_paypal_create_order,
        tester.test_paypal_capture_order,
        tester.test_remove_cart_item,
        tester.test_clear_cart
    ]
    
    # Run all tests
    for test in tests:
        test()
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"❌ {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
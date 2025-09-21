from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str
    brand: str
    image_url: str
    in_stock: bool = True
    specifications: dict = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    brand: str
    image_url: str
    in_stock: bool = True
    specifications: dict = {}

class CartItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    quantity: int
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CartItemCreate(BaseModel):
    product_id: str
    quantity: int

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_email: str
    customer_phone: str
    items: List[dict]
    total_amount: float
    status: str = "pending"
    paypal_order_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    items: List[dict]
    total_amount: float

# Product endpoints
@api_router.get("/products", response_model=List[Product])
async def get_products():
    products = await db.products.find().to_list(1000)
    return [Product(**product) for product in products]

@api_router.get("/products/category/{category}", response_model=List[Product])
async def get_products_by_category(category: str):
    products = await db.products.find({"category": category}).to_list(1000)
    return [Product(**product) for product in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    product_dict = product.dict()
    product_obj = Product(**product_dict)
    await db.products.insert_one(product_obj.dict())
    return product_obj

# Cart endpoints
@api_router.get("/cart", response_model=List[CartItem])
async def get_cart():
    cart_items = await db.cart.find().to_list(1000)
    return [CartItem(**item) for item in cart_items]

@api_router.post("/cart", response_model=CartItem)
async def add_to_cart(item: CartItemCreate):
    # Check if item already exists in cart
    existing_item = await db.cart.find_one({"product_id": item.product_id})
    if existing_item:
        # Update quantity
        new_quantity = existing_item["quantity"] + item.quantity
        await db.cart.update_one(
            {"product_id": item.product_id},
            {"$set": {"quantity": new_quantity}}
        )
        updated_item = await db.cart.find_one({"product_id": item.product_id})
        return CartItem(**updated_item)
    else:
        # Add new item
        cart_item_dict = item.dict()
        cart_item_obj = CartItem(**cart_item_dict)
        await db.cart.insert_one(cart_item_obj.dict())
        return cart_item_obj

@api_router.put("/cart/{item_id}")
async def update_cart_item(item_id: str, quantity: int):
    await db.cart.update_one(
        {"id": item_id},
        {"$set": {"quantity": quantity}}
    )
    return {"message": "Cart updated"}

@api_router.delete("/cart/{item_id}")
async def remove_from_cart(item_id: str):
    await db.cart.delete_one({"id": item_id})
    return {"message": "Item removed from cart"}

@api_router.delete("/cart")
async def clear_cart():
    await db.cart.delete_many({})
    return {"message": "Cart cleared"}

# Order endpoints
@api_router.post("/orders", response_model=Order)
async def create_order(order: OrderCreate):
    order_dict = order.dict()
    order_obj = Order(**order_dict)
    await db.orders.insert_one(order_obj.dict())
    return order_obj

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return Order(**order)

# PayPal integration endpoints (placeholder for demo)
@api_router.post("/paypal/create-order")
async def create_paypal_order(order_data: dict):
    # This would integrate with PayPal SDK in production
    # For demo, we'll just return a mock response
    return {
        "id": f"PAYPAL_{uuid.uuid4()}",
        "status": "CREATED",
        "links": [
            {
                "href": "https://www.sandbox.paypal.com/checkoutnow?token=DEMO_TOKEN",
                "rel": "approve",
                "method": "GET"
            }
        ]
    }

@api_router.post("/paypal/capture-order/{order_id}")
async def capture_paypal_order(order_id: str):
    # This would capture the PayPal payment in production
    # For demo, we'll just return success
    return {
        "id": order_id,
        "status": "COMPLETED",
        "payment_source": {
            "paypal": {}
        }
    }

# Initialize sample data
@api_router.post("/init-data")
async def initialize_sample_data():
    # Check if data already exists
    existing_products = await db.products.count_documents({})
    if existing_products > 0:
        return {"message": "Sample data already exists"}
    
    sample_products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Geladeira Brastemp Frost Free",
            "description": "Geladeira duplex com tecnologia frost free, 400 litros, eficiência energética A+",
            "price": 2299.99,
            "category": "geladeira",
            "brand": "Brastemp",
            "image_url": "https://images.unsplash.com/photo-1484154218962-a197022b5858",
            "in_stock": True,
            "specifications": {
                "capacidade": "400L",
                "cor": "Inox",
                "dimensoes": "70x60x175cm",
                "consumo": "45kWh/mês"
            },
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Máquina de Lavar Electrolux",
            "description": "Lavadora de roupas 12kg, com 16 programas de lavagem e função eco",
            "price": 1599.99,
            "category": "lavadora",
            "brand": "Electrolux",
            "image_url": "https://images.unsplash.com/photo-1597418048367-7dd01e4404ee",
            "in_stock": True,
            "specifications": {
                "capacidade": "12kg",
                "programas": "16",
                "cor": "Branca",
                "dimensoes": "60x65x95cm"
            },
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fogão Consul 5 Bocas",
            "description": "Fogão a gás com 5 bocas, forno com grill e mesa de vidro temperado",
            "price": 899.99,
            "category": "fogao",
            "brand": "Consul",
            "image_url": "https://images.unsplash.com/photo-1586208958839-06c17cacdf08",
            "in_stock": True,
            "specifications": {
                "bocas": "5",
                "forno": "Sim com Grill",
                "mesa": "Vidro temperado",
                "cor": "Inox"
            },
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Geladeira Consul Frost Free",
            "description": "Refrigerador de 2 portas com compartimento para frutas e verduras",
            "price": 1899.99,
            "category": "geladeira",
            "brand": "Consul",
            "image_url": "https://images.pexels.com/photos/2343467/pexels-photo-2343467.jpeg",
            "in_stock": True,
            "specifications": {
                "capacidade": "350L",
                "portas": "2",
                "cor": "Branca",
                "consumo": "40kWh/mês"
            },
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Lava e Seca Samsung",
            "description": "Máquina lava e seca com capacidade para 11kg de lavagem e 7kg de secagem",
            "price": 3299.99,
            "category": "lavadora",
            "brand": "Samsung",
            "image_url": "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c",
            "in_stock": True,
            "specifications": {
                "capacidade_lavagem": "11kg",
                "capacidade_secagem": "7kg",
                "cor": "Inox",
                "funcoes": "15 programas"
            },
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Cooktop Electrolux Indução",
            "description": "Cooktop por indução com 4 zonas de aquecimento e controle touch",
            "price": 1299.99,
            "category": "fogao",
            "brand": "Electrolux",
            "image_url": "https://images.unsplash.com/photo-1721613877687-c9099b698faa",
            "in_stock": True,
            "specifications": {
                "tipo": "Indução",
                "zonas": "4",
                "controle": "Touch",
                "potencia": "7000W"
            },
            "created_at": datetime.now(timezone.utc)
        }
    ]
    
    await db.products.insert_many(sample_products)
    return {"message": "Sample data initialized"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
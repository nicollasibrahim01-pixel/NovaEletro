import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import { ShoppingCart, Star, Filter, Search, Phone, Mail, MapPin, Heart, Plus, Minus, Check } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Textarea } from './components/ui/textarea';
import { Separator } from './components/ui/separator';
import { useToast } from './hooks/use-toast';
import { Toaster } from './components/ui/toaster';

// import de dados locais de exemplo (fallback)
import sampleProducts from './data/sampleProducts.json';

// Se houver variável de ambiente REACT_APP_BACKEND_URL ela será usada.
// Caso contrário API ficará vazia e o fallback será usado.
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = BACKEND_URL ? `${BACKEND_URL}/api` : '';

/* ---------- Cabeçalho, componentes visuais (sem alterações importantes) ---------- */

const Header = ({ cartCount, onCartClick }) => (
  <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white sticky top-0 z-50 shadow-lg">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold">EletroVendas</div>
          <Badge variant="secondary" className="bg-yellow-400 text-blue-900">
            Melhores Preços
          </Badge>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          <a href="#home" className="hover:text-blue-200 transition-colors">Início</a>
          <a href="#products" className="hover:text-blue-200 transition-colors">Produtos</a>
          <a href="#about" className="hover:text-blue-200 transition-colors">Sobre</a>
          <a href="#contact" className="hover:text-blue-200 transition-colors">Contato</a>
        </nav>

        <Button 
          onClick={onCartClick}
          variant="outline" 
          className="bg-white text-blue-600 hover:bg-blue-50 relative"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Carrinho
          {cartCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1">
              {cartCount}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  </header>
);

const HeroSection = () => (
  <section id="home" className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
    <div className="container mx-auto px-4 text-center">
      <h1 className="text-5xl font-bold text-gray-900 mb-6">
        Os Melhores Eletrodomésticos
        <span className="text-blue-600 block">Para Sua Casa</span>
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        Encontre geladeiras, máquinas de lavar, fogões e muito mais com os melhores preços e qualidade garantida. 
        Entrega rápida para todo o Brasil!
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
          Ver Produtos
        </Button>
        <Button size="lg" variant="outline" className="text-lg px-8 py-4">
          Ofertas Especiais
        </Button>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-blue-600 text-3xl mb-4">🚚</div>
          <h3 className="font-semibold text-lg mb-2">Entrega Rápida</h3>
          <p className="text-gray-600">Entregamos em todo Brasil com garantia de prazo</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-blue-600 text-3xl mb-4">💳</div>
          <h3 className="font-semibold text-lg mb-2">Pagamento Seguro</h3>
          <p className="text-gray-600">PayPal e principais cartões aceitos</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-blue-600 text-3xl mb-4">🛡️</div>
          <h3 className="font-semibold text-lg mb-2">Garantia Total</h3>
          <p className="text-gray-600">Produtos com garantia oficial do fabricante</p>
        </div>
      </div>
    </div>
  </section>
);

/* ---------- ProductCard, ProductFilter, ProductsSection (mantidos) ---------- */

const ProductCard = ({ product, onAddToCart, onViewDetails }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
      <div className="relative">
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
          onClick={() => setIsWishlisted(!isWishlisted)}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </Button>
        <Badge className="absolute top-2 left-2 bg-green-500">
          Em Estoque
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center mb-3">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">(4.8)</span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-500">
              ou 12x de R$ {(product.price / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <Badge variant="secondary">{product.brand}</Badge>
        </div>
        
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={() => onAddToCart(product)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Comprar
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onViewDetails(product)}
          >
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ProductFilter = ({ categories, selectedCategory, onCategoryChange, searchTerm, onSearchChange }) => (
  <div className="bg-white p-6 rounded-lg shadow-md mb-8">
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-gray-600" />
        <span className="font-semibold">Filtros:</span>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
);

const ProductsSection = ({ products, onAddToCart, onViewDetails }) => {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const categories = [...new Set(products.map(p => p.category))];
  
  useEffect(() => {
    let filtered = products;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm]);
  
  return (
    <section id="products" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Nossos Produtos</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Confira nossa seleção completa de eletrodomésticos das melhores marcas
          </p>
        </div>
        
        <ProductFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </section>
  );
};

/* ---------- Carrinho e Checkout (mantidos, com chamadas para API se existir) ---------- */

const CartModal = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Carrinho de Compras</DialogTitle>
        </DialogHeader>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">Seu carrinho está vazio</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <img 
                  src={item.product.image_url} 
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">{item.product.name}</h4>
                  <p className="text-blue-600 font-bold">
                    R$ {item.product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ))}
            
            <Separator />
            
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-blue-600">
                R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-lg py-4"
              onClick={onCheckout}
            >
              <Check className="w-5 h-5 mr-2" />
              Finalizar Compra
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const CheckoutModal = ({ isOpen, onClose, cartItems, onOrderComplete }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const orderData = {
        ...formData,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        total_amount: total
      };
      
      // se API configurada, envia; caso contrário, simula sucesso localmente
      if (API) {
        const response = await axios.post(`${API}/orders`, orderData);
        toast({
          title: "Pedido realizado com sucesso!",
          description: `Seu pedido #${response.data.id.slice(-8)} foi criado.`,
        });
        onOrderComplete(response.data);
      } else {
        // simula resposta
        const fakeOrder = { id: `local-${Date.now()}`, ...orderData };
        toast({
          title: "Pedido (simulado) realizado com sucesso!",
          description: `Pedido #${String(fakeOrder.id).slice(-8)} criado.`,
        });
        onOrderComplete(fakeOrder);
      }
    } catch (error) {
      toast({
        title: "Erro ao processar pedido",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Finalizar Compra</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nome Completo</label>
            <Input 
              required
              value={formData.customer_name}
              onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input 
              type="email"
              required
              value={formData.customer_email}
              onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Telefone</label>
            <Input 
              required
              value={formData.customer_phone}
              onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
            />
          </div>
          
          <Separator />
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Resumo do Pedido</h4>
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between text-sm mb-1">
                <span>{item.product.name} x{item.quantity}</span>
                <span>R$ {(item.product.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 font-bold">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="text-blue-600">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processando...' : 'Confirmar Pedido'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/* ---------- Contato e Footer (mantidos) ---------- */

const ContactSection = () => (
  <section id="contact" className="py-16 bg-blue-600 text-white">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Entre em Contato</h2>
        <p className="text-xl text-blue-100">
          Tem dúvidas? Nossa equipe está pronta para ajudar!
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <Phone className="w-12 h-12 mx-auto mb-4 text-blue-200" />
          <h3 className="text-xl font-semibold mb-2">Telefone</h3>
          <p className="text-blue-100">(11) 99999-9999</p>
          <p className="text-blue-100">Seg-Sex: 8h às 18h</p>
        </div>
        
        <div className="text-center">
          <Mail className="w-12 h-12 mx-auto mb-4 text-blue-200" />
          <h3 className="text-xl font-semibold mb-2">Email</h3>
          <p className="text-blue-100">contato@eletrovendas.com.br</p>
          <p className="text-blue-100">Resposta em até 24h</p>
        </div>
        
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-blue-200" />
          <h3 className="text-xl font-semibold mb-2">Endereço</h3>
          <p className="text-blue-100">Av. Paulista, 1000</p>
          <p className="text-blue-100">São Paulo - SP</p>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-gray-900 text-white py-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">EletroVendas</h3>
          <p className="text-gray-400">
            Os melhores eletrodomésticos com qualidade e preço justo para sua casa.
          </p>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-4">Produtos</h4>
          <ul className="space-y-2 text-gray-400">
            <li>Geladeiras</li>
            <li>Máquinas de Lavar</li>
            <li>Fogões</li>
            <li>Microondas</li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-4">Suporte</h4>
          <ul className="space-y-2 text-gray-400">
            <li>Central de Ajuda</li>
            <li>Garantia</li>
            <li>Entrega</li>
            <li>Devolução</li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-4">Empresa</h4>
          <ul className="space-y-2 text-gray-400">
            <li>Sobre Nós</li>
            <li>Trabalhe Conosco</li>
            <li>Termos de Uso</li>
            <li>Privacidade</li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; 2024 EletroVendas. Todos os direitos reservados.</p>
      </div>
    </div>
  </footer>
);

/* ---------- Home e App (carregamento com fallback) ---------- */

function Home() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeData = async () => {
    if (!API) return; // sem backend, nada para inicializar
    try {
      await axios.post(`${API}/init-data`);
    } catch (error) {
      console.log('Sample data initialization:', error.response?.data?.message || 'Error');
    }
  };

  const loadProducts = async () => {
    try {
      if (!API) {
        // sem backend configurado -> usa dados locais de exemplo
        setProducts(sampleProducts);
        return;
      }

      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
      // fallback local se a requisição falhar
      setProducts(sampleProducts);
      toast({
        title: "Erro ao carregar produtos",
        description: "Mostrando amostra local.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const existingItem = cartItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        id: Date.now().toString(),
        product,
        quantity: 1
      }]);
    }
    
    toast({
      title: "Produto adicionado!",
      description: `${product.name} foi adicionado ao carrinho.`,
    });
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) return;
    setCartItems(cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
    toast({
      title: "Item removido",
      description: "O produto foi removido do carrinho.",
    });
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = (order) => {
    setCartItems([]);
    setIsCheckoutOpen(false);
    toast({
      title: "Pedido confirmado! 🎉",
      description: "Você receberá um email com os detalhes do seu pedido.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <HeroSection />
      
      <ProductsSection 
        products={products}
        onAddToCart={handleAddToCart}
        onViewDetails={setSelectedProduct}
      />
      
      <ContactSection />
      <Footer />
      
      <CartModal 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />
      
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderComplete={handleOrderComplete}
      />
      
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

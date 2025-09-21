import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "./hooks/use-toast";

const API = "http://localhost:5000"; // ajuste se necessário

const CheckoutModal = ({ isOpen, onClose, cartItems, onOrderComplete }) => {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const orderData = {
        ...formData,
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        total_amount: total,
      };

      const response = await axios.post(`${API}/orders`, orderData);

      toast({
        title: "Pedido realizado com sucesso!",
        description: `Seu pedido #${response.data.id.slice(-8)} foi criado.`,
      });

      onOrderComplete(response.data);
    } catch (error) {
      toast({
        title: "Erro ao processar pedido",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
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
              onChange={(e) =>
                setFormData({ ...formData, customer_name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              required
              value={formData.customer_email}
              onChange={(e) =>
                setFormData({ ...formData, customer_email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Telefone</label>
            <Input
              required
              value={formData.customer_phone}
              onChange={(e) =>
                setFormData({ ...formData, customer_phone: e.target.value })
              }
            />
          </div>

          <Separator />

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Resumo do Pedido</h4>
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm mb-1">
                <span>
                  {item.product.name} x{item.quantity}
                </span>
                <span>
                  R${" "}
                  {(item.product.price * item.quantity).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 font-bold">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="text-blue-600">
                  R${" "}
                  {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Botão verde Confirmar Pedido */}
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isProcessing}
          >
            {isProcessing ? "Processando..." : "Confirmar Pedido"}
          </Button>
        </form>

        {/* Botão azul PayPal */}
        <form
          action="https://www.paypal.com/ncp/payment/XXXXXXXX"
          method="post"
          target="_blank"
          className="w-full mt-3"
        >
          <input type="hidden" name="item_name" value="Pedido EletroVendas" />
          <input type="hidden" name="amount" value={total.toFixed(2)} />
          <input type="hidden" name="currency_code" value="BRL" />
          <button
            type="submit"
            className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold py-2 px-4 rounded"
          >
            Pagar com PayPal
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    };
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.product.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleOrderComplete = () => {
    setCart([]);
    setCheckoutOpen(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">NovaEletro</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg"
          >
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-gray-600">
              R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <Button
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => addToCart(product)}
            >
              Adicionar ao Carrinho
            </Button>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4">
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setCheckoutOpen(true)}
          >
            Finalizar Compra ({cart.length})
          </Button>
        </div>
      )}

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartItems={cart}
        onOrderComplete={handleOrderComplete}
      />
    </div>
  );
}

export default App;
import { Link } from 'react-router-dom';
import { X, ShoppingCart, Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../utils/formatPrice';
import Button from '../ui/Button';

const CartDrawer = () => {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getSubtotal,
    getTotalItems,
  } = useCartStore();

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-heading font-semibold text-xl flex items-center gap-2">
            <ShoppingCart size={24} className="text-primary" />
            Your Cart
            {totalItems > 0 && (
              <span className="bg-primary text-white text-sm px-2 py-1 rounded-full">
                {totalItems}
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-cream rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-24 h-24 bg-cream rounded-full flex items-center justify-center mb-6">
              <ShoppingCart size={48} className="text-muted" />
            </div>
            <h3 className="font-heading font-semibold text-xl mb-2">
              Your cart is empty
            </h3>
            <p className="text-muted text-center mb-8">
              Add some delicious Nigerian snacks to get started!
            </p>
            <Button to="/explore" onClick={closeCart}>
              Browse Snacks
            </Button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 bg-cream rounded-xl p-4"
                >
                  {/* Product Image */}
                  <Link
                    to={`/snacks/${item.product.slug}`}
                    onClick={closeCart}
                    className="shrink-0"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <Link
                        to={`/snacks/${item.product.slug}`}
                        onClick={closeCart}
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1 hover:bg-pepper-light rounded-full transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} className="text-pepper" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-primary font-semibold">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-full bg-white">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="p-1.5 hover:bg-cream rounded-l-full transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="p-1.5 hover:bg-cream rounded-r-full transition-colors"
                          aria-label="Increase quantity"
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted">Subtotal</span>
                <span className="font-heading font-bold text-2xl">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-sm text-muted mb-6">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="space-y-3">
                <Button
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full"
                  size="lg"
                >
                  Checkout
                  <ArrowRight size={20} className="ml-2" />
                </Button>
                <Button
                  to="/cart"
                  onClick={closeCart}
                  variant="secondary"
                  className="w-full"
                >
                  View Full Cart
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
import { useEffect, useState } from 'react';

const API = 'http://localhost:8000';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category: string;
};

type CartLine = {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
};

const money = (value: number) => `$${value.toFixed(2)}`;

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    fetch(`${API}/products`)
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((data: Product[]) => {
        setProducts(data);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const visible =
    category === 'all' ? products : products.filter((p) => p.category === category);

  const countInCart = (id: number) =>
    cart.find((line) => line.product_id === id)?.quantity ?? 0;

  const adjust = (product: Product, delta: number) => {
    setPlaced(false);
    setCart((current) => {
      const existing = current.find((line) => line.product_id === product.id);
      if (!existing) {
        if (delta <= 0) return current;
        return [
          ...current,
          { id: Date.now(), product_id: product.id, quantity: delta, product },
        ];
      }
      const next = existing.quantity + delta;
      if (next <= 0) return current.filter((line) => line.product_id !== product.id);
      return current.map((line) =>
        line.product_id === product.id ? { ...line, quantity: next } : line
      );
    });
  };

  const subtotal = cart.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0
  );
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="app">
      <header className="topbar">
        <div className="shell topbar-inner">
          <span className="brand">
            Northwind <em>Supply</em>
          </span>
          <span className="tier">Wholesale &mdash; Tier 1</span>
        </div>
      </header>

      <nav className="filters">
        <div className="shell filters-inner">
          {categories.map((name) => (
            <button
              key={name}
              className={name === category ? 'filter active' : 'filter'}
              onClick={() => setCategory(name)}
            >
              {name === 'all' ? 'All products' : name}
            </button>
          ))}
        </div>
      </nav>

      <main className="shell layout">
        <section className="catalogue">
          <h1 className="h1">Inventory</h1>
          <p className="muted">
            {loading
              ? 'Loading catalogue…'
              : `${visible.length} product${visible.length === 1 ? '' : 's'} available`}
          </p>

          {error && (
            <div className="alert">
              Could not reach the API at <code>{API}</code> &mdash; {error}
            </div>
          )}

          <div className="grid">
            {visible.map((product) => (
              <article className="card" key={product.id}>
                <div className="thumb" data-cat={product.category} />
                <div className="card-body">
                  <h2 className="card-title">{product.name}</h2>
                  <p className="card-desc">{product.description}</p>
                  <div className="card-foot">
                    <span className="price">{money(product.price)}</span>
                    <span
                      className={
                        product.stock_quantity > 0 ? 'stock in' : 'stock out'
                      }
                    >
                      {product.stock_quantity > 0
                        ? `${product.stock_quantity} in stock`
                        : 'Out of stock'}
                    </span>
                  </div>
                  <div className="stepper">
                    <button
                      onClick={() => adjust(product, -1)}
                      disabled={countInCart(product.id) === 0}
                      aria-label={`Remove one ${product.name}`}
                    >
                      &minus;
                    </button>
                    <span className="qty">{countInCart(product.id)}</span>
                    <button
                      onClick={() => adjust(product, 1)}
                      disabled={product.stock_quantity === 0}
                      aria-label={`Add one ${product.name}`}
                    >
                      +
                    </button>
                  </div>
                  {countInCart(product.id) > 0 && (
                    <span className="added">
                      {countInCart(product.id)} in order
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="summary">
          <h2 className="h2">Order summary</h2>

          {itemCount === 0 && <p className="muted">No items selected yet.</p>}

          <ul className="lines">
            {cart.map((line) => (
              <li key={line.id}>
                <span className="line-name">
                  {line.product.name} &times;{line.quantity}
                </span>
                <span className="line-price">
                  {money(line.product.price * line.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="totals">
            <div>
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div>
              <span>Shipping</span>
              <span>{subtotal > 0 ? money(8.5) : money(0)}</span>
            </div>
            <div className="grand">
              <span>Total</span>
              <span>{money(subtotal + (subtotal > 0 ? 8.5 : 0))}</span>
            </div>
          </div>

          <button className="checkout" disabled={itemCount === 0}>
            Place order
          </button>
          {placed && (
            <p className="ok">Order placed &mdash; 3 items reserved.</p>
          )}
        </aside>
      </main>
    </div>
  );
}

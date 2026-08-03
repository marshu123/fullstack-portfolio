from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import Boolean, Integer, String, Float, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column
import os
from datetime import datetime, timedelta
from typing import List, Optional
import jwt
from passlib.context import CryptContext

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ecommerce.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(200), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(String(500))
    price: Mapped[float] = mapped_column(Float, nullable=False)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    category: Mapped[str] = mapped_column(String(100))
    image_url: Mapped[Optional[str]] = mapped_column(String(300))
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

class CartItem(Base):
    __tablename__ = "cart_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    product_id: Mapped[int] = mapped_column(Integer, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1)

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(Integer, nullable=False)
    product_id: Mapped[int] = mapped_column(Integer, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    price: Mapped[float] = mapped_column(Float, nullable=False)

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

Base.metadata.create_all(engine)

app = FastAPI(title="E-commerce API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool

    class Config:
        from_attributes = True

class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    stock_quantity: int
    category: str
    image_url: Optional[str]

    class Config:
        from_attributes = True

class CartItemResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    quantity: int

    class Config:
        from_attributes = True

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    with Session(engine) as session:
        user = session.get(User, username)
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return user

@app.post("/register", response_model=UserResponse)
def register(user: UserCreate):
    with Session(engine) as session:
        existing_user = session.scalar(
            select(User).where((User.email == user.email) | (User.username == user.username))
        )
        if existing_user:
            raise HTTPException(status_code=400, detail="Email or username already registered")

        hashed_password = get_password_hash(user.password)
        db_user = User(email=user.email, username=user.username, hashed_password=hashed_password)
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user

@app.post("/login")
def login(user: UserLogin):
    with Session(engine) as session:
        db_user = session.scalar(select(User).where(User.username == user.username))
        if not db_user or not verify_password(user.password, db_user.hashed_password):
            raise HTTPException(status_code=401, detail="Incorrect username or password")

        if not db_user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")

        access_token = create_access_token(data={"sub": db_user.username})
        return {"access_token": access_token, "token_type": "bearer"}

@app.get("/products", response_model=List[ProductResponse])
def get_products(category: Optional[str] = None):
    with Session(engine) as session:
        query = select(Product)
        if category:
            query = query.where(Product.category == category)
        return session.scalars(query.order_by(Product.id)).all()

@app.post("/products", response_model=ProductResponse)
def create_product(product: dict):
    db_product = Product(**product)
    with Session(engine) as session:
        session.add(db_product)
        session.commit()
        session.refresh(db_product)
        return db_product

@app.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int):
    with Session(engine) as session:
        product = session.get(Product, product_id)
        if product is None:
            raise HTTPException(status_code=404, detail="Product not found")
        return product

@app.patch("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, updates: dict):
    with Session(engine) as session:
        product = session.get(Product, product_id)
        if product is None:
            raise HTTPException(status_code=404, detail="Product not found")

        for key, value in updates.items():
            setattr(product, key, value)
        session.commit()
        session.refresh(product)
        return product

@app.delete("/products/{product_id}")
def delete_product(product_id: int):
    with Session(engine) as session:
        product = session.get(Product, product_id)
        if product is None:
            raise HTTPException(status_code=404, detail="Product not found")

        session.delete(product)
        session.commit()
        return {"message": "Product deleted"}

@app.get("/cart", response_model=List[CartItemResponse])
def get_cart(current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        return session.scalars(
            select(CartItem).where(CartItem.user_id == current_user.id)
        ).all()

@app.post("/cart", response_model=CartItemResponse)
def add_to_cart(user_id: int, product_id: int, quantity: int = 1):
    with Session(engine) as session:
        product = session.get(Product, product_id)
        if product is None:
            raise HTTPException(status_code=404, detail="Product not found")
        if product.stock_quantity < quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")

        cart_item = session.scalar(
            select(CartItem).where((CartItem.user_id == user_id) & (CartItem.product_id == product_id))
        )
        if cart_item:
            cart_item.quantity += quantity
            session.commit()
            session.refresh(cart_item)
            return cart_item

        new_item = CartItem(user_id=user_id, product_id=product_id, quantity=quantity)
        session.add(new_item)
        session.commit()
        session.refresh(new_item)
        return new_item

@app.delete("/cart/{cart_item_id}")
def remove_from_cart(cart_item_id: int, current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        cart_item = session.get(CartItem, cart_item_id)
        if cart_item is None:
            raise HTTPException(status_code=404, detail="Cart item not found")
        if cart_item.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")

        session.delete(cart_item)
        session.commit()
        return {"message": "Item removed from cart"}

@app.post("/orders")
def create_order(current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        cart_items = session.scalars(
            select(CartItem).where(CartItem.user_id == current_user.id)
        ).all()
        if not cart_items:
            raise HTTPException(status_code=400, detail="Cart is empty")

        total_amount = 0.0
        order_items = []
        for cart_item in cart_items:
            product = session.get(Product, cart_item.product_id)
            if product is None:
                raise HTTPException(status_code=404, detail=f"Product {cart_item.product_id} not found")
            if product.stock_quantity < cart_item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for product {product.name}")

            item_total = product.price * cart_item.quantity
            total_amount += item_total
            order_items.append(OrderItem(
                product_id=product.id,
                quantity=cart_item.quantity,
                price=product.price
            ))

            product.stock_quantity -= cart_item.quantity

        order = Order(user_id=current_user.id, total_amount=total_amount)
        session.add(order)
        for order_item in order_items:
            order_item.order_id = order.id
            session.add(order_item)

        for cart_item in cart_items:
            session.delete(cart_item)

        session.commit()
        session.refresh(order)
        return {"message": "Order created successfully", "order_id": order.id}

@app.get("/users/me", response_model=UserResponse)
def get_user(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/")
def home():
    return {"message": "E-commerce API is running"}
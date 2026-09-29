"""Seed the development catalogue with sample products.

Usage:
    python seed_products.py

Requires the API to be running on http://localhost:8000
"""

import json
import urllib.request

API = "http://localhost:8000"

PRODUCTS = [
    {
        "name": "Cordless Impact Driver",
        "description": "18V brushless impact driver, 180Nm torque. Two-speed gearbox with electronic brake.",
        "price": 129.0,
        "stock_quantity": 34,
        "category": "Tools",
    },
    {
        "name": "Pneumatic Stapler 18GA",
        "description": "Professional grade stapler for upholstery and cabinetry. 10mm staple capacity.",
        "price": 86.5,
        "stock_quantity": 21,
        "category": "Tools",
    },
    {
        "name": "Stainless Hex Bolt M10",
        "description": "A2-70 stainless hex bolt, DIN 933. Sold in boxes of 100.",
        "price": 42.0,
        "stock_quantity": 156,
        "category": "Hardware",
    },
    {
        "name": "Wall-Mount Shelf Bracket",
        "description": "Heavy duty powder-coated bracket, 250kg rated. Sold as a pair.",
        "price": 14.75,
        "stock_quantity": 288,
        "category": "Hardware",
    },
    {
        "name": "Cut-Resistant Gloves L",
        "description": "Level A4 cut protection with nitrile palm. Machine washable.",
        "price": 11.2,
        "stock_quantity": 412,
        "category": "Safety",
    },
    {
        "name": "High-Vis Safety Vest",
        "description": "Class 2 hi-vis vest, EN ISO 20471 compliant. Adjustable velcro closure.",
        "price": 8.9,
        "stock_quantity": 197,
        "category": "Safety",
    },
    {
        "name": "A4 Copy Paper 80gsm",
        "description": "Ream of 500 sheets. Bright white, jam-resistant for laser and inkjet.",
        "price": 6.4,
        "stock_quantity": 540,
        "category": "Office",
    },
    {
        "name": "Desk Cable Tray",
        "description": "Under-desk steel cable management tray. Clamp and screw mount.",
        "price": 23.4,
        "stock_quantity": 63,
        "category": "Office",
    },
]


def main() -> None:
    created = 0
    for product in PRODUCTS:
        request = urllib.request.Request(
            f"{API}/products",
            data=json.dumps(product).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request) as response:
                if response.status == 200:
                    created += 1
        except Exception as error:  # noqa: BLE001
            print(f"  failed: {product['name']} -> {error}")

    print(f"seeded {created}/{len(PRODUCTS)} products")


if __name__ == "__main__":
    main()

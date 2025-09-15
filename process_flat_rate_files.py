#!/usr/bin/env python3
"""
Process all 61 flat rate pricing files and import into ServiceBook Pros database
"""

import os
import re
import sys
sys.path.append('/home/ubuntu/flat_rate_project/servicebook-pricing-backend')

from src.main import app
from src.models.pricing import db, Category, PricingItem, Customer

def parse_flat_rate_file(file_path):
    """Parse a single flat rate file and extract pricing items"""
    items = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the category from the file structure
    lines = content.split('\n')
    category = "General"
    subcategory = ""
    
    # Find category information
    for i, line in enumerate(lines):
        if "Profit Rhino - Electrical" in line:
            # Look for category info in next few lines
            for j in range(i+1, min(i+5, len(lines))):
                if lines[j].strip() and not lines[j].startswith('Services') and not lines[j].startswith('1-'):
                    if not category or category == "General":
                        category = lines[j].strip()
                    elif not subcategory:
                        subcategory = lines[j].strip()
                    break
    
    # Parse individual service items
    current_item = {}
    in_service_section = False
    
    for line in lines:
        line = line.strip()
        
        if line == "service":
            if current_item:
                items.append(current_item)
            current_item = {"type": "service"}
            in_service_section = True
        elif in_service_section and line and not line.startswith("Profit Rhino") and not line.startswith("T") and not line.startswith("$"):
            # This is likely the description
            if "description" not in current_item:
                current_item["description"] = line
            else:
                current_item["description"] += " " + line
        elif line.startswith("T") and len(line) > 5:
            # Task code
            current_item["task_code"] = line
        elif line.startswith("$") and "." in line:
            # Price
            try:
                price_str = line.replace("$", "").replace(",", "")
                current_item["price"] = float(price_str)
            except:
                pass
    
    # Add the last item
    if current_item:
        items.append(current_item)
    
    # Clean up items and add category info
    cleaned_items = []
    for item in items:
        if "description" in item and "price" in item:
            item["category"] = category
            item["subcategory"] = subcategory
            cleaned_items.append(item)
    
    return cleaned_items, category, subcategory

def process_all_files():
    """Process all flat rate files"""
    upload_dir = "/home/ubuntu/upload"
    all_items = []
    categories = set()
    
    # Get all fr*.txt files
    fr_files = [f for f in os.listdir(upload_dir) if f.startswith('fr') and f.endswith('.txt')]
    fr_files.sort(key=lambda x: int(x[2:-4]))  # Sort by number
    
    print(f"Processing {len(fr_files)} flat rate files...")
    
    for filename in fr_files:
        file_path = os.path.join(upload_dir, filename)
        try:
            items, category, subcategory = parse_flat_rate_file(file_path)
            all_items.extend(items)
            categories.add(category)
            print(f"Processed {filename}: {len(items)} items, category: {category}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")
    
    return all_items, categories

def import_to_database(items, categories):
    """Import parsed items into ServiceBook Pros database"""
    
    with app.app_context():
        # Clear existing data
        PricingItem.query.delete()
        Category.query.delete()
        db.session.commit()
        
        # Create categories
        category_map = {}
        for i, cat_name in enumerate(sorted(categories), 1):
            category = Category(
                id=i,
                name=cat_name,
                description=f"Professional {cat_name.lower()} services"
            )
            db.session.add(category)
            category_map[cat_name] = i
        
        db.session.commit()
        
        # Create pricing items
        for i, item in enumerate(items, 1):
            if "description" in item and "price" in item:
                # Generate service code
                category_code = item["category"][:3].upper() if item["category"] else "GEN"
                service_code = f"{category_code}{i:03d}"
                
                # Extract title from description (first part)
                title = item["description"].split('.')[0][:100]
                if len(title) < 10:
                    title = item["description"][:100]
                
                # Estimate labor hours based on price
                labor_hours = max(0.5, item["price"] / 150)  # Rough estimate
                material_cost = item["price"] * 0.3  # Rough estimate
                
                pricing_item = PricingItem(
                    code=service_code,
                    title=title,
                    description=item["description"][:500],
                    category_id=category_map.get(item["category"], 1),
                    base_price=item["price"],
                    labor_hours=round(labor_hours, 1),
                    material_cost=round(material_cost, 2)
                )
                
                db.session.add(pricing_item)
        
        db.session.commit()
        print(f"Imported {len(items)} pricing items into database")

if __name__ == "__main__":
    print("Starting flat rate file processing...")
    items, categories = process_all_files()
    print(f"\nTotal items parsed: {len(items)}")
    print(f"Categories found: {list(categories)}")
    
    print("\nImporting to database...")
    import_to_database(items, categories)
    print("Import complete!")


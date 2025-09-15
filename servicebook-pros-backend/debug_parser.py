#!/usr/bin/env python3
"""
Debug script to test flat rate file parsing
"""

import re

def parse_flat_rate_file(file_path):
    """
    Parse a flat rate file and extract service information
    Returns a list of service dictionaries
    """
    services = []
    
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Split into lines and process
        lines = content.split('\n')
        i = 0
        
        print(f"Total lines in file: {len(lines)}")
        
        while i < len(lines):
            line = lines[i].strip()
            
            # Skip empty lines and headers
            if not line or line in ['Price book', 'Services', 'Electrical', 'Profit Rhino - Electrical', 'service', 'Description', 'Managed by', 'Task code', 'Base pricing']:
                i += 1
                continue
            
            # Look for service name (usually a descriptive line)
            if line and not line.startswith('$') and not line.startswith('T') and line != 'Profit Rhino':
                print(f"Found potential service name at line {i}: {line}")
                service_name = line
                description_parts = []
                
                # Collect description lines until we hit "Profit Rhino"
                i += 1
                while i < len(lines) and lines[i].strip() != 'Profit Rhino':
                    desc_line = lines[i].strip()
                    if desc_line and desc_line != 'service':
                        description_parts.append(desc_line)
                        print(f"  Description part: {desc_line}")
                    i += 1
                
                # Skip "Profit Rhino" line
                if i < len(lines) and lines[i].strip() == 'Profit Rhino':
                    print(f"  Found 'Profit Rhino' at line {i}")
                    i += 1
                
                # Skip empty line after "Profit Rhino"
                while i < len(lines) and not lines[i].strip():
                    i += 1
                
                # Get service code (like T811271)
                service_code = ''
                if i < len(lines):
                    service_code = lines[i].strip()
                    print(f"  Service code: {service_code}")
                    i += 1
                
                # Skip empty line after service code
                while i < len(lines) and not lines[i].strip():
                    i += 1
                
                # Get price (like $323.00)
                price = 0.0
                if i < len(lines):
                    price_line = lines[i].strip()
                    price_match = re.search(r'\$(\d+\.?\d*)', price_line)
                    if price_match:
                        price = float(price_match.group(1))
                        print(f"  Price: ${price}")
                    i += 1
                
                # Skip "service" line
                if i < len(lines) and lines[i].strip() == 'service':
                    print(f"  Found 'service' at line {i}")
                    i += 1
                
                # Create service entry
                if service_name and service_code:
                    service = {
                        'name': service_name,
                        'description': ' '.join(description_parts),
                        'original_code': service_code,
                        'price': price,
                        'labor_hours': 1.0  # Default labor hours
                    }
                    services.append(service)
                    print(f"  Added service: {service_name} ({service_code}) - ${price}")
                else:
                    print(f"  Skipped - missing name or code")
            else:
                i += 1
    
    except Exception as e:
        print(f"Error parsing file {file_path}: {e}")
    
    return services

# Test with one file
services = parse_flat_rate_file('/home/ubuntu/upload/fr1.txt')
print(f"\nTotal services found: {len(services)}")
for service in services[:5]:  # Show first 5
    print(f"- {service['name']} ({service['original_code']}) - ${service['price']}")


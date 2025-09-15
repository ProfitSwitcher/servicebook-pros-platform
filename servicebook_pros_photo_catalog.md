# ServiceBook Pros Professional Photo Catalog

## Electrical Service Category Images

This catalog contains professional, high-quality images for each electrical service category in the ServiceBook Pros platform. These images will be used in the visual interface to help contractors quickly identify and navigate to the services they need.

### Category Image Mapping

**EL-01: Troubleshooting & Code Repair**
- Image: `servicebook_pros_images/categories/troubleshooting_repair.jpg`
- Description: Professional electrician using testing equipment on electrical panel
- Usage: Main category card for troubleshooting services

**EL-02: Service Entrances & Upgrades**
- Image: `servicebook_pros_images/categories/panel_upgrade.jpg`
- Description: Electrical panel upgrade installation work
- Usage: Service entrance and upgrade category

**EL-03: Panels & Sub Panels**
- Image: `servicebook_pros_images/categories/panel_upgrade.jpg`
- Description: Professional electrical panel installation
- Usage: Panel and sub-panel services category

**EL-04: Breakers & Fuses**
- Image: `servicebook_pros_images/categories/panel_upgrade.jpg`
- Description: Electrical panel with breakers visible
- Usage: Breaker and fuse services category

**EL-05: Switches & Outlets**
- Image: `servicebook_pros_images/categories/outlets_switches.jpg`
- Description: Electrical outlet and switch wiring installation
- Usage: Switch and outlet installation services

**EL-06: Wiring & Circuits**
- Image: `servicebook_pros_images/categories/appliance_wiring.jpg`
- Description: Professional electrical wiring installation
- Usage: Wiring and circuit installation services

**EL-07: Interior Lighting**
- Image: `servicebook_pros_images/categories/interior_lighting.jpg`
- Description: Professional lighting installation work
- Usage: Interior lighting services category

**EL-08: Exterior Lighting**
- Image: `servicebook_pros_images/categories/interior_lighting.jpg`
- Description: Professional lighting installation (can be used for exterior)
- Usage: Exterior lighting services category

**EL-09: Ceiling Fans**
- Image: `servicebook_pros_images/categories/ceiling_fans.jpg`
- Description: Ceiling fan installation process
- Usage: Ceiling fan installation and repair services

**EL-10: Home Automation**
- Image: `servicebook_pros_images/categories/home_automation.jpg`
- Description: Smart home automation system installation
- Usage: Home automation and smart device services

**EL-11: Fire & Safety**
- Image: `servicebook_pros_images/categories/fire_safety.jpg`
- Description: Smoke detector installation by professional
- Usage: Fire safety and security system services

**EL-12: Generators**
- Image: `servicebook_pros_images/categories/generators.jpg`
- Description: Professional generator installation
- Usage: Generator installation and maintenance services

**EL-13: Appliance Wiring**
- Image: `servicebook_pros_images/categories/appliance_wiring.jpg`
- Description: Professional appliance electrical wiring
- Usage: Appliance wiring and connection services

**EL-14: Data & Security**
- Image: `servicebook_pros_images/categories/data_security.jpg`
- Description: Data and security system wiring installation
- Usage: Data, networking, and security system services

**EL-15: HVAC Electrical**
- Image: `servicebook_pros_images/categories/hvac_electrical.jpg`
- Description: HVAC electrical system installation
- Usage: HVAC electrical services and connections

**EL-16: Water Heater Electrical**
- Image: `servicebook_pros_images/categories/appliance_wiring.jpg`
- Description: Electrical appliance wiring (suitable for water heater)
- Usage: Water heater electrical services

**EL-17: EV Charging Stations**
- Image: `servicebook_pros_images/categories/ev_charging.jpg`
- Description: EV charging station installation
- Usage: Electric vehicle charging station services

**EL-18: Specialty Services**
- Image: `servicebook_pros_images/categories/troubleshooting_repair.jpg`
- Description: Professional electrical work (general specialty)
- Usage: Specialty and custom electrical services

## Image Quality Standards

All images in this catalog meet the following professional standards:

### Technical Requirements
- **Resolution**: Minimum 800x600 pixels for web display
- **Format**: JPEG for photographs, PNG for graphics with transparency
- **Quality**: High-resolution, professional photography
- **Aspect Ratio**: Consistent sizing for category cards

### Content Standards
- **Professional Work**: All images show actual electrical work being performed
- **Safety Focus**: Proper safety equipment and procedures visible
- **Clean Presentation**: Well-lit, clear, and professional appearance
- **Brand Neutral**: No competing brand logos or company names visible

### Usage Guidelines
- **Category Cards**: Use as background images for main category navigation
- **Service Details**: Can be used in service detail views
- **Mobile Optimization**: All images are suitable for mobile display
- **Accessibility**: Alt text should describe the electrical work being performed

## Implementation Notes

### Frontend Integration
```javascript
// Example category card component
const CategoryCard = ({ category, image, title, description }) => (
  <div className="category-card" style={{backgroundImage: `url(${image})`}}>
    <div className="category-overlay">
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="category-code">{category}</span>
    </div>
  </div>
);
```

### Image Optimization
- Compress images for web delivery while maintaining quality
- Create multiple sizes for responsive design (thumbnail, medium, large)
- Implement lazy loading for better performance
- Use WebP format where supported for better compression

### Accessibility Considerations
- Provide descriptive alt text for all images
- Ensure sufficient contrast for text overlays
- Support screen readers with proper ARIA labels
- Maintain usability without images (text fallbacks)

## Future Enhancements

### Additional Image Types
- **Service Process**: Step-by-step installation photos
- **Before/After**: Comparison images for upgrade services
- **Tools & Equipment**: Professional electrical tools and equipment
- **Safety Procedures**: Proper safety equipment and procedures

### Video Integration
- **Service Demonstrations**: Short video clips of common procedures
- **Safety Training**: Video content for proper electrical safety
- **Installation Guides**: Video tutorials for complex installations

This professional photo catalog ensures ServiceBook Pros presents a clean, professional image that builds trust with electrical contractors and helps them quickly find the services they need.


from src.models.user import db
from datetime import datetime

class ServiceSubcategory(db.Model):
    __tablename__ = 'service_subcategories'
    
    id = db.Column(db.Integer, primary_key=True)
    subcategory_code = db.Column(db.String(20), unique=True, nullable=False)  # e.g., EL-01-A
    subcategory_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    parent_category_code = db.Column(db.String(10), db.ForeignKey('service_categories.category_code'), nullable=False)
    image_url = db.Column(db.String(255))
    sort_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to parent category
    parent_category = db.relationship('ServiceCategory', backref='subcategories')
    
    def to_dict(self):
        from src.models.pricing import ElectricalService
        service_count = ElectricalService.query.filter_by(
            subcategory_code=self.subcategory_code,
            is_active=True
        ).count()
        
        return {
            'id': self.id,
            'subcategory_code': self.subcategory_code,
            'subcategory_name': self.subcategory_name,
            'description': self.description,
            'parent_category_code': self.parent_category_code,
            'image_url': self.image_url,
            'sort_order': self.sort_order,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'service_count': service_count
        }
    
    def __repr__(self):
        return f'<ServiceSubcategory {self.subcategory_code}: {self.subcategory_name}>'


// Email Setup & Templates JavaScript
class EmailSetupManager {
    constructor() {
        this.currentTemplate = 'appointment';
        this.templates = {
            appointment: {
                subject: 'Appointment Reminder',
                content: '<p>Hi {customer_name},</p><p>This is a reminder for your appointment on {appointment_time}. Please let us know if you need to reschedule.</p><p>Thank you!</p>'
            },
            job: {
                subject: 'Job Completion Notice',
                content: '<p>Hi {customer_name},</p><p>We have completed the work at {job_address}. Thank you for choosing our services!</p><p>If you have any questions, please don\'t hesitate to contact us.</p>'
            },
            payment: {
                subject: 'Payment Reminder',
                content: '<p>Hi {customer_name},</p><p>This is a friendly reminder that your invoice #{invoice_number} for ${amount} is due on {due_date}.</p><p>You can pay online or contact us to arrange payment.</p>'
            }
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTemplate(this.currentTemplate);
        this.updatePreview();
    }

    bindEvents() {
        // Template tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const template = e.target.dataset.template;
                this.switchTemplate(template);
            });
        });

        // Rich text editor toolbar
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = e.target.closest('.toolbar-btn').dataset.command;
                this.executeCommand(command);
            });
        });

        // Merge fields dropdown
        document.getElementById('mergeFields').addEventListener('change', (e) => {
            if (e.target.value) {
                this.insertMergeField(e.target.value);
                e.target.value = '';
            }
        });

        // Template editor content changes
        document.getElementById('templateEditor').addEventListener('input', () => {
            this.updatePreview();
        });

        // Copy buttons
        document.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const textToCopy = e.target.closest('.btn-copy').dataset.copy;
                this.copyToClipboard(textToCopy, e.target.closest('.btn-copy'));
            });
        });

        // Domain verification
        document.getElementById('verifyDomainBtn').addEventListener('click', () => {
            this.verifyDomain();
        });

        // API key editing
        document.getElementById('editApiKey').addEventListener('click', () => {
            this.editApiKey();
        });

        // Color picker
        document.getElementById('primaryColor').addEventListener('change', (e) => {
            this.updateBrandColor(e.target.value);
        });

        // Signature changes
        document.getElementById('emailSignature').addEventListener('input', () => {
            this.updatePreview();
        });

        // Test email modal
        document.getElementById('testEmailBtn').addEventListener('click', () => {
            this.showTestEmailModal();
        });

        document.getElementById('closeTestModal').addEventListener('click', () => {
            this.hideTestEmailModal();
        });

        document.getElementById('cancelTestEmail').addEventListener('click', () => {
            this.hideTestEmailModal();
        });

        document.getElementById('sendTestEmail').addEventListener('click', () => {
            this.sendTestEmail();
        });

        // Save settings
        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            this.saveSettings();
        });

        // Logo upload
        document.getElementById('logoUpload').addEventListener('click', () => {
            this.uploadLogo();
        });

        // Reset colors
        document.getElementById('resetColors').addEventListener('click', () => {
            this.resetColors();
        });

        // Modal background click
        document.getElementById('testEmailModal').addEventListener('click', (e) => {
            if (e.target.id === 'testEmailModal') {
                this.hideTestEmailModal();
            }
        });
    }

    switchTemplate(templateName) {
        // Save current template content
        this.saveCurrentTemplate();
        
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-template="${templateName}"]`).classList.add('active');
        
        // Load new template
        this.currentTemplate = templateName;
        this.loadTemplate(templateName);
        this.updatePreview();
    }

    loadTemplate(templateName) {
        const template = this.templates[templateName];
        if (template) {
            document.getElementById('templateEditor').innerHTML = template.content;
        }
    }

    saveCurrentTemplate() {
        const content = document.getElementById('templateEditor').innerHTML;
        if (this.templates[this.currentTemplate]) {
            this.templates[this.currentTemplate].content = content;
        }
    }

    executeCommand(command) {
        document.execCommand(command, false, null);
        this.updateToolbarState();
        this.updatePreview();
    }

    updateToolbarState() {
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            const command = btn.dataset.command;
            if (document.queryCommandState(command)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    insertMergeField(field) {
        const editor = document.getElementById('templateEditor');
        const selection = window.getSelection();
        
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            
            const fieldSpan = document.createElement('span');
            fieldSpan.textContent = field;
            fieldSpan.style.backgroundColor = '#e0f2fe';
            fieldSpan.style.padding = '2px 4px';
            fieldSpan.style.borderRadius = '3px';
            fieldSpan.style.color = '#0369a1';
            
            range.insertNode(fieldSpan);
            range.setStartAfter(fieldSpan);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        
        this.updatePreview();
    }

    updatePreview() {
        const content = document.getElementById('templateEditor').innerHTML;
        const signature = document.getElementById('emailSignature').value;
        
        // Replace merge fields with sample data
        let previewContent = content
            .replace(/{customer_name}/g, 'John Smith')
            .replace(/{appointment_time}/g, 'March 15, 2024 at 2:00 PM')
            .replace(/{job_address}/g, '123 Main St, Anytown, ST 12345')
            .replace(/{technician_name}/g, 'Mike Johnson')
            .replace(/{amount}/g, '250.00')
            .replace(/{invoice_number}/g, 'INV-001')
            .replace(/{due_date}/g, 'March 30, 2024')
            .replace(/{company_name}/g, 'Your Business');

        // Update preview
        const previewElement = document.getElementById('emailPreview');
        const contentElement = previewElement.querySelector('.email-content');
        
        contentElement.innerHTML = previewContent;
        
        // Add signature
        if (signature.trim()) {
            const signatureElement = contentElement.querySelector('.email-signature') || 
                                   document.createElement('div');
            signatureElement.className = 'email-signature';
            signatureElement.innerHTML = `<p>${signature}</p>`;
            
            if (!contentElement.querySelector('.email-signature')) {
                contentElement.appendChild(signatureElement);
            }
        }
    }

    async copyToClipboard(text, button) {
        try {
            await navigator.clipboard.writeText(text);
            
            // Visual feedback
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.style.backgroundColor = '#10b981';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.backgroundColor = '#3b82f6';
            }, 2000);
            
        } catch (err) {
            console.error('Failed to copy text: ', err);
            
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            // Visual feedback
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.style.backgroundColor = '#10b981';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.backgroundColor = '#3b82f6';
            }, 2000);
        }
    }

    async verifyDomain() {
        const domain = document.getElementById('customDomain').value;
        const button = document.getElementById('verifyDomainBtn');
        const statusElement = document.getElementById('domainStatus');
        
        if (!domain) {
            alert('Please enter a domain name');
            return;
        }
        
        // Show loading state
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        button.disabled = true;
        
        try {
            // Simulate API call
            await this.simulateApiCall(2000);
            
            // Update status
            statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Verified';
            statusElement.className = 'status verified';
            
            // Show success message
            this.showNotification('Domain verified successfully!', 'success');
            
        } catch (error) {
            statusElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed';
            statusElement.className = 'status error';
            
            this.showNotification('Domain verification failed. Please check your DNS records.', 'error');
        } finally {
            button.innerHTML = 'Verify Domain';
            button.disabled = false;
        }
    }

    editApiKey() {
        const input = document.getElementById('sendgridApiKey');
        const button = document.getElementById('editApiKey');
        
        if (input.readOnly) {
            input.readOnly = false;
            input.type = 'text';
            input.focus();
            input.select();
            button.innerHTML = '<i class="fas fa-save"></i> Save';
        } else {
            input.readOnly = true;
            input.type = 'password';
            button.innerHTML = '<i class="fas fa-edit"></i> Edit';
            
            this.showNotification('API key updated successfully!', 'success');
        }
    }

    updateBrandColor(color) {
        document.querySelector('.color-input span').textContent = color;
        
        // Update preview styling
        const previewElement = document.getElementById('emailPreview');
        previewElement.style.setProperty('--brand-color', color);
        
        this.showNotification('Brand color updated!', 'success');
    }

    showTestEmailModal() {
        document.getElementById('testEmailModal').classList.add('show');
        document.getElementById('testEmailAddress').focus();
    }

    hideTestEmailModal() {
        document.getElementById('testEmailModal').classList.remove('show');
        document.getElementById('testEmailAddress').value = '';
    }

    async sendTestEmail() {
        const email = document.getElementById('testEmailAddress').value;
        const template = document.getElementById('testEmailTemplate').value;
        const button = document.getElementById('sendTestEmail');
        
        if (!email) {
            alert('Please enter an email address');
            return;
        }
        
        if (!this.isValidEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Show loading state
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        button.disabled = true;
        
        try {
            // Simulate API call
            await this.simulateApiCall(1500);
            
            this.showNotification(`Test email sent to ${email}!`, 'success');
            this.hideTestEmailModal();
            
        } catch (error) {
            this.showNotification('Failed to send test email. Please try again.', 'error');
        } finally {
            button.innerHTML = '<i class="fas fa-paper-plane"></i> Send Test Email';
            button.disabled = false;
        }
    }

    async saveSettings() {
        const button = document.getElementById('saveSettingsBtn');
        
        // Save current template
        this.saveCurrentTemplate();
        
        // Show loading state
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        button.disabled = true;
        
        try {
            // Simulate API call
            await this.simulateApiCall(1000);
            
            this.showNotification('Settings saved successfully!', 'success');
            
        } catch (error) {
            this.showNotification('Failed to save settings. Please try again.', 'error');
        } finally {
            button.innerHTML = '<i class="fas fa-save"></i> Save Settings';
            button.disabled = false;
        }
    }

    uploadLogo() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const logoPlaceholder = document.querySelector('.logo-placeholder');
                    logoPlaceholder.innerHTML = `<img src="${e.target.result}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;">`;
                    
                    // Update preview logo
                    const previewLogo = document.querySelector('.logo-placeholder-small');
                    previewLogo.innerHTML = `<img src="${e.target.result}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;">`;
                    
                    this.showNotification('Logo uploaded successfully!', 'success');
                };
                reader.readAsDataURL(file);
            }
        };
        
        input.click();
    }

    resetColors() {
        const colorInput = document.getElementById('primaryColor');
        colorInput.value = '#3b82f6';
        this.updateBrandColor('#3b82f6');
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    simulateApiCall(delay) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 90% success rate
                if (Math.random() > 0.1) {
                    resolve();
                } else {
                    reject(new Error('API call failed'));
                }
            }, delay);
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 8px;
            }
        `;
        document.head.appendChild(style);
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmailSetupManager();
});

// Additional utility functions
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
}

function validateDomain(domain) {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


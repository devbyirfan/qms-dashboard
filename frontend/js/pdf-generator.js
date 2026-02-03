document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadPdfBtn');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadPDFReport);
    }
});

function downloadPDFReport() {
    // Show loading state
    const btn = document.getElementById('downloadPdfBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    btn.disabled = true;
    
    // Create a new window/tab for the PDF
    const pdfWindow = window.open('', '_blank');
    pdfWindow.document.write('<html><head><title>Generating Report...</title></head><body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f5f6fa;"><div style="text-align:center;"><div style="width:50px;height:50px;border:5px solid rgba(102,126,234,0.1);border-top-color:#667eea;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 20px;"></div><p style="color:#667eea;font-size:18px;font-weight:600;">Generating PDF Report...</p></div><style>@keyframes spin{to{transform:rotate(360deg);}}</style></body></html>');
    
    // Fetch PDF
    fetch('http://localhost:5000/api/checkers/report/pdf', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(response => {
        if (response.ok) {
            return response.blob();
        } else {
            throw new Error('Failed to generate PDF');
        }
    })
    .then(blob => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        
        // Close loading window and open PDF
        pdfWindow.close();
        window.open(url, '_blank');
        
        // Reset button
        btn.innerHTML = originalText;
        btn.disabled = false;
        
        // Show success message
        if (typeof showToast === 'function') {
            showToast('PDF report downloaded successfully!', 'success');
        }
    })
    .catch(error => {
        console.error('PDF download error:', error);
        
        // Close loading window
        pdfWindow.close();
        
        // Reset button
        btn.innerHTML = originalText;
        btn.disabled = false;
        
        // Show error in new window
        const errorWindow = window.open('', '_blank');
        errorWindow.document.write('<html><head><title>Error</title></head><body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f8d7da;"><div style="text-align:center;color:#721c24;"><i class="fas fa-exclamation-triangle" style="font-size:60px;margin-bottom:20px;"></i><h2 style="margin-bottom:10px;">Error Generating PDF</h2><p style="font-size:16px;">Please try again later.</p><button onclick="window.close()" style="margin-top:20px;padding:10px 20px;background:#dc3545;color:white;border:none;border-radius:5px;cursor:pointer;">Close</button></div><script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script></body></html>');
        
        if (typeof showToast === 'function') {
            showToast('Failed to generate PDF report', 'error');
        }
    });
}
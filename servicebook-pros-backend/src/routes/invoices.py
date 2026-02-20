from flask import Blueprint, jsonify, request, Response
from datetime import datetime
import io

invoices_bp = Blueprint('invoices', __name__)

def _enrich(inv):
    """Add frontend-expected aliases to an invoice dict."""
    parts = inv['customer_name'].split(' ', 1)
    return {
        **inv,
        # InvoiceManagement expects total_amount
        'total_amount': inv['amount'],
        # InvoiceManagement expects date_issued
        'date_issued': inv['created_at'],
        # InvoiceManagement expects customer as object
        'customer': {
            'id': inv['customer_id'],
            'first_name': parts[0],
            'last_name': parts[1] if len(parts) > 1 else '',
            'name': inv['customer_name'],
        },
    }

_invoices = [
    {'id': 1, 'invoice_number': 'INV-001', 'customer_id': 1, 'customer_name': 'John Smith',   'status': 'paid',    'amount': 1850.00, 'due_date': '2024-12-30', 'created_at': '2024-12-15', 'line_items': []},
    {'id': 2, 'invoice_number': 'INV-002', 'customer_id': 2, 'customer_name': 'Sarah Johnson', 'status': 'pending', 'amount': 423.70,  'due_date': '2025-01-05', 'created_at': '2024-12-18', 'line_items': []},
    {'id': 3, 'invoice_number': 'INV-003', 'customer_id': 3, 'customer_name': 'Mike Davis',    'status': 'overdue', 'amount': 675.00,  'due_date': '2024-12-10', 'created_at': '2024-12-01', 'line_items': []},
]
_next_id = 4


# ---------------------------------------------------------------------------
# Minimal PDF generator - no third-party libraries required.
# Produces a valid PDF 1.4 document using only the Python standard library.
# ---------------------------------------------------------------------------

def _escape_pdf_string(s: str) -> str:
    """Escape a string for use inside PDF literal string parentheses."""
    return s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _build_invoice_pdf(inv: dict) -> bytes:
    """
    Build a minimal but valid PDF (1.4) for the given invoice dict.
    Uses only standard library modules (io).  Returns raw PDF bytes.

    Page size: US Letter  612 x 792 pt
    Fonts:     Helvetica (regular) and Helvetica-Bold (bold) - both built-in Type1
    """
    invoice_number = inv.get("invoice_number", f"INV-{inv['id']:03d}")
    customer_name  = inv.get("customer_name", "")
    status         = inv.get("status", "")
    amount         = float(inv.get("amount", 0))
    due_date       = inv.get("due_date", "")
    created_at     = inv.get("created_at", "")
    line_items     = inv.get("line_items", [])

    # Build the PDF content stream (PDF drawing operators).
    # Coordinate origin: lower-left corner; y increases upward.
    ops = []

    def txt(x, y, size, bold, content):
        font_alias = "FB" if bold else "FR"
        escaped = _escape_pdf_string(str(content))
        ops.append(f"BT /{font_alias} {size} Tf {x} {y} Td ({escaped}) Tj ET")

    def hline(y):
        ops.append(f"0.4 w 50 {y} m 562 {y} l S")

    y = 740

    # --- Company header ---
    txt(50, y, 20, True,  "ServiceBook Pros")
    y -= 22
    txt(50, y, 10, False, "Professional Service Management")
    y -= 24
    hline(y)
    y -= 18

    # --- Invoice title ---
    txt(50, y, 16, True, f"INVOICE  {invoice_number}")
    y -= 28

    # --- Key fields ---
    for label, value in [
        ("Customer:",    customer_name),
        ("Status:",      status.upper()),
        ("Amount Due:",  f"${amount:,.2f}"),
        ("Date Issued:", created_at),
        ("Due Date:",    due_date),
    ]:
        txt(50,  y, 10, True,  label)
        txt(175, y, 10, False, value)
        y -= 17

    y -= 8
    hline(y)
    y -= 18

    # --- Line items ---
    if line_items:
        txt(50, y, 11, True, "Line Items")
        y -= 16
        # Table header
        txt(50,  y, 9, True, "Description")
        txt(370, y, 9, True, "Qty")
        txt(410, y, 9, True, "Unit Price")
        txt(480, y, 9, True, "Total")
        y -= 4
        hline(y)
        y -= 14
        for item in line_items:
            desc       = str(item.get("description", ""))
            qty        = item.get("quantity", 1)
            unit_price = float(item.get("unit_price", item.get("price", 0)))
            total      = float(item.get("total", qty * unit_price))
            if len(desc) > 44:
                desc = desc[:41] + "..."
            txt(50,  y, 9, False, desc)
            txt(370, y, 9, False, str(qty))
            txt(410, y, 9, False, f"${unit_price:,.2f}")
            txt(480, y, 9, False, f"${total:,.2f}")
            y -= 14
            if y < 100:
                break
        y -= 6
        hline(y)
        y -= 14
    else:
        txt(50, y, 10, False, "No line items recorded.")
        y -= 20

    # --- Total row ---
    txt(410, y, 11, True, "TOTAL:")
    txt(480, y, 11, True, f"${amount:,.2f}")
    y -= 30

    # --- Footer ---
    hline(y)
    y -= 14
    txt(50, y, 8, False,
        f"Generated {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}  |  ServiceBook Pros")

    # Build the raw byte stream
    stream_bytes = "\n".join(ops).encode("latin-1", errors="replace")

    # -------------------------------------------------------------------
    # Assemble PDF binary structure
    # -------------------------------------------------------------------
    buf = io.BytesIO()
    offsets: dict = {}

    def w(data: bytes):
        buf.write(data)

    def pdf_obj(n: int, body: bytes):
        offsets[n] = buf.tell()
        w(f"{n} 0 obj\n".encode())
        w(body)
        w(b"\nendobj\n")

    # File header (% + 4 bytes > 127 marks binary file)
    w(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")

    # 1: Catalog
    pdf_obj(1, b"<< /Type /Catalog /Pages 2 0 R >>")

    # 2: Pages tree
    pdf_obj(2, b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>")

    # 3: Page (Letter, references content stream and font resources)
    pdf_obj(3,
        b"<< /Type /Page /Parent 2 0 R "
        b"/MediaBox [0 0 612 792] "
        b"/Contents 4 0 R "
        b"/Resources << /Font << /FR 5 0 R /FB 6 0 R >> >> >>"
    )

    # 4: Content stream
    pdf_obj(4,
        f"<< /Length {len(stream_bytes)} >>\nstream\n".encode() +
        stream_bytes +
        b"\nendstream"
    )

    # 5: Regular font - Helvetica
    pdf_obj(5,
        b"<< /Type /Font /Subtype /Type1 "
        b"/BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"
    )

    # 6: Bold font - Helvetica-Bold
    pdf_obj(6,
        b"<< /Type /Font /Subtype /Type1 "
        b"/BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"
    )

    # Cross-reference table
    xref_offset = buf.tell()
    num_objs = 7  # objects 0 through 6
    w(b"xref\n")
    w(f"0 {num_objs}\n".encode())
    w(b"0000000000 65535 f \n")  # object 0 (free)
    for i in range(1, num_objs):
        w(f"{offsets[i]:010d} 00000 n \n".encode())

    # Trailer
    w(b"trailer\n")
    w(f"<< /Size {num_objs} /Root 1 0 R >>\n".encode())
    w(b"startxref\n")
    w(f"{xref_offset}\n".encode())
    w(b"%%EOF\n")

    return buf.getvalue()


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@invoices_bp.route("/", methods=["GET"])
def get_invoices():
    return jsonify([_enrich(i) for i in _invoices])


@invoices_bp.route("/<int:invoice_id>", methods=["GET"])
def get_invoice(invoice_id):
    inv = next((i for i in _invoices if i["id"] == invoice_id), None)
    if not inv:
        return jsonify({"error": "Not found"}), 404
    return jsonify(_enrich(inv))


@invoices_bp.route("/", methods=["POST"])
def create_invoice():
    global _next_id
    data = request.get_json() or {}
    invoice = {
        "id": _next_id,
        "invoice_number": f"INV-{str(_next_id).zfill(3)}",
        "customer_id": data.get("customer_id"),
        "customer_name": data.get("customer_name", ""),
        "status": data.get("status", "pending"),
        "amount": float(data.get("amount", data.get("total_amount", 0))),
        "due_date": data.get("due_date", ""),
        "created_at": datetime.utcnow().strftime("%Y-%m-%d"),
        "line_items": data.get("line_items", []),
    }
    _invoices.append(invoice)
    _next_id += 1
    return jsonify(_enrich(invoice)), 201


@invoices_bp.route("/<int:invoice_id>", methods=["PUT"])
def update_invoice(invoice_id):
    inv = next((i for i in _invoices if i["id"] == invoice_id), None)
    if not inv:
        return jsonify({"error": "Not found"}), 404
    data = request.get_json() or {}
    inv.update({k: v for k, v in data.items() if k not in ("id",)})
    return jsonify(_enrich(inv))


@invoices_bp.route("/<int:invoice_id>/pdf", methods=["GET"], strict_slashes=False)
def download_invoice_pdf(invoice_id):
    """
    GET /api/invoices/{id}/pdf
    Returns the invoice as a downloadable PDF file (Content-Disposition: attachment).
    """
    inv = next((i for i in _invoices if i["id"] == invoice_id), None)
    if not inv:
        return jsonify({"error": "Invoice not found"}), 404

    pdf_bytes = _build_invoice_pdf(inv)
    filename  = inv.get("invoice_number", f"INV-{invoice_id:03d}") + ".pdf"

    return Response(
        pdf_bytes,
        status=200,
        headers={
            "Content-Type":        "application/pdf",
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length":      str(len(pdf_bytes)),
        },
    )


@invoices_bp.route("/<int:invoice_id>/pdf/preview", methods=["GET"], strict_slashes=False)
def preview_invoice_pdf(invoice_id):
    """
    GET /api/invoices/{id}/pdf/preview
    Returns the invoice PDF for inline browser viewing (Content-Disposition: inline).
    """
    inv = next((i for i in _invoices if i["id"] == invoice_id), None)
    if not inv:
        return jsonify({"error": "Invoice not found"}), 404

    pdf_bytes = _build_invoice_pdf(inv)
    filename  = inv.get("invoice_number", f"INV-{invoice_id:03d}") + ".pdf"

    return Response(
        pdf_bytes,
        status=200,
        headers={
            "Content-Type":        "application/pdf",
            "Content-Disposition": f'inline; filename="{filename}"',
            "Content-Length":      str(len(pdf_bytes)),
        },
    )


@invoices_bp.route("/<int:invoice_id>/send", methods=["POST"], strict_slashes=False)
def send_invoice(invoice_id):
    """
    POST /api/invoices/{id}/send
    Stub: marks the invoice as 'sent' and returns a success response.
    Connect to SendGrid / AWS SES / similar to send a real email.
    """
    inv = next((i for i in _invoices if i["id"] == invoice_id), None)
    if not inv:
        return jsonify({"error": "Invoice not found"}), 404

    data            = request.get_json(silent=True) or {}
    recipient_email = data.get("email", "")

    if inv.get("status") == "pending":
        inv["status"] = "sent"

    return jsonify({
        "success":   True,
        "message":   f"Invoice {inv['invoice_number']} sent successfully.",
        "recipient": recipient_email,
        "invoice":   _enrich(inv),
    })

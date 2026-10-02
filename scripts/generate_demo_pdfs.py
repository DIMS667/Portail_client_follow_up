from pathlib import Path
import shutil

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf"
PUBLIC = ROOT / "public" / "documents-demo"
OUTPUT.mkdir(parents=True, exist_ok=True)
PUBLIC.mkdir(parents=True, exist_ok=True)


def create_document(filename: str, label: str, reference: str, rows: list[tuple[str, str]]) -> None:
    path = OUTPUT / filename
    width, height = A4
    pdf = canvas.Canvas(str(path), pagesize=A4)
    pdf.setTitle(f"{label} - Demonstration")

    navy = HexColor("#0B3568")
    blue = HexColor("#1769E0")
    pale = HexColor("#E9F3FF")
    ink = HexColor("#11233D")
    muted = HexColor("#5D6C80")
    green = HexColor("#0C9A67")

    pdf.setFillColor(navy)
    pdf.rect(0, height - 118, width, 118, fill=1, stroke=0)
    pdf.setFillColor(HexColor("#FFFFFF"))
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(48, height - 48, "ESPACE CLIENT")
    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawString(48, height - 82, label)
    pdf.setFont("Helvetica", 9)
    pdf.drawRightString(width - 48, height - 48, "DOCUMENT FICTIF")

    pdf.setFillColor(pale)
    pdf.roundRect(48, height - 177, width - 96, 37, 8, fill=1, stroke=0)
    pdf.setFillColor(blue)
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(62, height - 163, f"Reference : {reference}")

    y = height - 220
    for key, value in rows:
        pdf.setFillColor(muted)
        pdf.setFont("Helvetica", 9)
        pdf.drawString(52, y, key.upper())
        pdf.setFillColor(ink)
        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawString(210, y, value)
        pdf.setStrokeColor(HexColor("#DCE6F0"))
        pdf.line(52, y - 13, width - 52, y - 13)
        y -= 43

    pdf.setFillColor(HexColor("#E7F8F0"))
    pdf.roundRect(48, 132, width - 96, 58, 9, fill=1, stroke=0)
    pdf.setFillColor(green)
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(62, 167, "DEMONSTRATION INTERACTIVE")
    pdf.setFillColor(ink)
    pdf.setFont("Helvetica", 9)
    pdf.drawString(62, 150, "Ce document ne constitue ni un contrat, ni une preuve d'assurance, ni un recu reel.")

    pdf.setFillColor(muted)
    pdf.setFont("Helvetica", 8)
    pdf.drawString(48, 54, "Genere pour la presentation du futur portail client.")
    pdf.drawRightString(width - 48, 54, "Espace Client - Donnees fictives")
    pdf.save()
    shutil.copy2(path, PUBLIC / filename)


create_document(
    "police-auto-demo.pdf",
    "Police d'assurance automobile",
    "POL-2026-00325",
    [
        ("Assure", "Jean Dupont"),
        ("Produit", "Assurance automobile"),
        ("Compagnie", "Compagnie A"),
        ("Date d'effet", "12 octobre 2026"),
        ("Date d'expiration", "12 octobre 2027"),
        ("Prime annuelle", "105 000 FCFA"),
        ("Statut", "Active"),
    ],
)

create_document(
    "attestation-auto-demo.pdf",
    "Attestation d'assurance",
    "ATT-2026-00325",
    [
        ("Assure", "Jean Dupont"),
        ("Police", "POL-2026-00325"),
        ("Vehicule", "Toyota RAV4 - LT 458 AA"),
        ("Usage", "Personnel"),
        ("Validite", "12/10/2026 au 12/10/2027"),
        ("Compagnie", "Compagnie A"),
    ],
)

create_document(
    "recu-paiement-demo.pdf",
    "Recu de paiement",
    "PAY-2026-00045",
    [
        ("Client", "Jean Dupont"),
        ("Contrat", "POL-2026-00325"),
        ("Montant", "105 000 FCFA"),
        ("Date", "14 aout 2026"),
        ("Mode", "Mobile Money"),
        ("Statut", "Confirme"),
    ],
)

print(f"Created 3 PDFs in {OUTPUT} and copied them to {PUBLIC}")

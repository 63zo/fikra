import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls
import convert_to_docx

def create_unified_all_in_one():
    docs_dir = r"c:\Users\ezzoa\OneDrive\Documents\Desktop\Projects\bsha\docs"
    unified_md_path = os.path.join(docs_dir, "00_FIKRA_COMPLETE_MANUAL_SUITE.md")
    unified_docx_path = os.path.join(docs_dir, "00_FIKRA_COMPLETE_SYSTEM_DOCUMENTATION_ALL_IN_ONE.docx")
    
    files = [
        "README.md",
        "01_USER_MANUAL.md",
        "02_SYSTEM_ADMINISTRATION_GUIDE.md",
        "03_SOFTWARE_ARCHITECTURE_DOCUMENT.md",
        "04_API_AND_INTEGRATION_DOCUMENTATION.md",
        "05_DATABASE_DESIGN_DOCUMENT.md"
    ]
    
    combined_content = []
    combined_content.append("# حزمة التوثيق الشاملة والكاملة لمنصة فكرة (Fikra Master Documentation Suite)\n")
    combined_content.append("### جامعة بيشة | University of Bisha\n")
    combined_content.append("**الإصدار:** 2.0 | **التاريخ:** سبتمبر 2026 | **حالة الاعتماد:** معتمد رسمياً\n\n---\n\n")
    
    for fname in files:
        fpath = os.path.join(docs_dir, fname)
        if os.path.exists(fpath):
            with open(fpath, 'r', encoding='utf-8') as f:
                combined_content.append(f"\n\n---\n\n# ====================================================\n")
                combined_content.append(f.read())
                combined_content.append("\n\n")
                
    with open(unified_md_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(combined_content))
        
    convert_to_docx.convert_md_to_docx(unified_md_path, unified_docx_path)
    print(f"Master All-in-One document saved: {unified_docx_path}")

if __name__ == "__main__":
    create_unified_all_in_one()

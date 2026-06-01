from openpyxl import Workbook
from openpyxl.styles import (Font, PatternFill, Alignment, Border, Side,
                              GradientFill)
from openpyxl.styles.differential import DifferentialStyle
from openpyxl.formatting.rule import ColorScaleRule, CellIsRule, FormulaRule
from openpyxl.utils import get_column_letter

wb = Workbook()

# ── Sheet 1: Lab Results ──────────────────────────────────────────────────────
ws = wb.active
ws.title = "Lab Results"

# Colors
HEADER_BG   = "1F4E79"
PANEL_BG    = "D6E4F0"
ALT_ROW     = "F2F7FB"
WHITE       = "FFFFFF"
GREEN_FILL  = "C6EFCE"
RED_FILL    = "FFC7CE"
YELLOW_FILL = "FFEB9C"
GREEN_FONT  = "276221"
RED_FONT    = "9C0006"
YELLOW_FONT = "9C6500"

thin = Side(style="thin", color="BFBFBF")
med  = Side(style="medium", color="1F4E79")
border_thin = Border(left=thin, right=thin, top=thin, bottom=thin)

def hdr_fill(hex_color):
    return PatternFill("solid", fgColor=hex_color)

def hdr_font(bold=True, color=WHITE, size=10, italic=False):
    return Font(name="Arial", bold=bold, color=color, size=size, italic=italic)

def cell_font(bold=False, color="000000", size=10):
    return Font(name="Arial", bold=bold, color=color, size=size)

def center():
    return Alignment(horizontal="center", vertical="center", wrap_text=True)

def left():
    return Alignment(horizontal="left", vertical="center", wrap_text=True)

# ── Column headers ────────────────────────────────────────────────────────────
headers = ["Panel", "Test Name", "Result", "Unit", "Low (Normal)", "High (Normal)", "Status", "Date", "Notes"]
col_widths = [28, 32, 12, 14, 14, 14, 14, 14, 38]

ws.row_dimensions[1].height = 30
for col, (h, w) in enumerate(zip(headers, col_widths), 1):
    c = ws.cell(1, col, h)
    c.font = hdr_font(size=11)
    c.fill = hdr_fill(HEADER_BG)
    c.alignment = center()
    c.border = Border(left=med, right=med, top=med, bottom=med)
    ws.column_dimensions[get_column_letter(col)].width = w

# ── Data ──────────────────────────────────────────────────────────────────────
# (panel, test, result, unit, low, high, date, notes)
data = [
    # CBC
    ("CBC & Differential", "White Blood Cell (WBC)",        7.2,   "K/μL",     4.5,   11.0,  "2026-05-20", ""),
    ("CBC & Differential", "Red Blood Cell (RBC)",          4.8,   "M/μL",     4.7,    6.1,  "2026-05-20", ""),
    ("CBC & Differential", "Hemoglobin (Hgb)",             14.5,   "g/dL",    13.5,   17.5,  "2026-05-20", "Reference range for adult males"),
    ("CBC & Differential", "Hematocrit (Hct)",             43.0,   "%",       41.0,   53.0,  "2026-05-20", "Reference range for adult males"),
    ("CBC & Differential", "Mean Corpuscular Volume (MCV)", 88.0,  "fL",      80.0,  100.0,  "2026-05-20", ""),
    ("CBC & Differential", "MCH",                          29.0,   "pg",      27.0,   33.0,  "2026-05-20", ""),
    ("CBC & Differential", "MCHC",                         33.5,   "g/dL",   32.0,   36.0,  "2026-05-20", ""),
    ("CBC & Differential", "Platelets",                   245.0,   "K/μL",   150.0,  400.0,  "2026-05-20", ""),
    ("CBC & Differential", "Neutrophils",                   58.0,  "%",       45.0,   75.0,  "2026-05-20", ""),
    ("CBC & Differential", "Lymphocytes",                   32.0,  "%",       20.0,   45.0,  "2026-05-20", ""),
    ("CBC & Differential", "Monocytes",                      7.0,  "%",        2.0,   10.0,  "2026-05-20", ""),
    ("CBC & Differential", "Eosinophils",                    2.0,  "%",        0.0,    6.0,  "2026-05-20", ""),
    ("CBC & Differential", "Basophils",                      1.0,  "%",        0.0,    2.0,  "2026-05-20", ""),
    # Lipid
    ("Non-Fasting Lipid Panel", "Total Cholesterol",       195.0,  "mg/dL",    0.0,  200.0,  "2026-05-20", "Desirable: <200"),
    ("Non-Fasting Lipid Panel", "LDL Cholesterol",         118.0,  "mg/dL",    0.0,  100.0,  "2026-05-20", "Optimal <100; Near-optimal 100-129"),
    ("Non-Fasting Lipid Panel", "HDL Cholesterol",          52.0,  "mg/dL",   40.0, 9999.0,  "2026-05-20", "Higher is better; >60 = protective"),
    ("Non-Fasting Lipid Panel", "Triglycerides",           145.0,  "mg/dL",    0.0,  150.0,  "2026-05-20", "Non-fasting; <150 normal"),
    ("Non-Fasting Lipid Panel", "Non-HDL Cholesterol",     143.0,  "mg/dL",    0.0,  130.0,  "2026-05-20", "Optimal <130"),
    # Creatinine / GFR
    ("Creatinine & eGFR",       "Creatinine",                1.0,  "mg/dL",   0.7,    1.3,  "2026-05-20", "Reference range for adult males"),
    ("Creatinine & eGFR",       "eGFR",                     82.0,  "mL/min/1.73m²", 60.0, 9999.0, "2026-05-20", ">60 = normal kidney function"),
    # Electrolytes
    ("Sodium",                  "Sodium (Na⁺)",            140.0,  "mEq/L",  136.0,  145.0,  "2026-05-20", ""),
    ("Potassium",               "Potassium (K⁺)",            4.2,  "mEq/L",    3.5,    5.1,  "2026-05-20", ""),
    # HbA1c
    ("Hemoglobin A1C",          "Hemoglobin A1C",            5.8,  "%",        0.0,    5.7,  "2026-05-20", "Normal <5.7%; Prediabetes 5.7-6.4%"),
    # TSH
    ("TSH",                     "Thyroid Stimulating Hormone (TSH)", 2.1, "mIU/L", 0.4, 4.0, "2026-05-20", ""),
    # ALT
    ("ALT",                     "Alanine Aminotransferase (ALT)", 28.0, "U/L", 7.0, 56.0, "2026-05-20", "Liver enzyme"),
]

row_num = 2
prev_panel = None
panel_colors = {}
color_toggle = False

for i, (panel, test, result, unit, low, high, date, notes) in enumerate(data):
    ws.row_dimensions[row_num].height = 20

    # Alternate shading per panel group
    if panel != prev_panel:
        color_toggle = not color_toggle
        prev_panel = panel

    bg = ALT_ROW if color_toggle else WHITE

    # Status formula: "High" / "Low" / "Normal"
    # Col C=3 (result), E=5 (low), F=6 (high)
    r = row_num
    status_formula = (
        f'=IF(C{r}="","—",'
        f'IF(AND(E{r}=0,F{r}=9999),"—",'
        f'IF(C{r}<E{r},"Low",'
        f'IF(C{r}>F{r},"High","Normal"))))'
    )

    row_data = [panel, test, result, unit, low if low != 0.0 else "—", high if high != 9999.0 else "—", status_formula, date, notes]

    for col, val in enumerate(row_data, 1):
        c = ws.cell(row_num, col, val)
        c.font = cell_font()
        c.fill = hdr_fill(bg)
        c.border = border_thin
        c.alignment = center() if col in (3, 5, 6, 7, 8) else left()
        if col == 3:  # result - bold
            c.font = cell_font(bold=True)

    row_num += 1

# ── Conditional formatting for Status column (G) ─────────────────────────────
from openpyxl.formatting.rule import Rule
from openpyxl.styles.differential import DifferentialStyle

last_row = row_num - 1

# Normal → green
normal_font  = Font(color=GREEN_FONT, bold=True)
normal_fill  = PatternFill("solid", bgColor=GREEN_FILL)
ws.conditional_formatting.add(
    f"G2:G{last_row}",
    Rule(type="containsText", operator="containsText", text="Normal",
         dxf=DifferentialStyle(font=normal_font, fill=normal_fill))
)

# High → red
high_font = Font(color=RED_FONT, bold=True)
high_fill = PatternFill("solid", bgColor=RED_FILL)
ws.conditional_formatting.add(
    f"G2:G{last_row}",
    Rule(type="containsText", operator="containsText", text="High",
         dxf=DifferentialStyle(font=high_font, fill=high_fill))
)

# Low → yellow
low_font = Font(color=YELLOW_FONT, bold=True)
low_fill = PatternFill("solid", bgColor=YELLOW_FILL)
ws.conditional_formatting.add(
    f"G2:G{last_row}",
    Rule(type="containsText", operator="containsText", text="Low",
         dxf=DifferentialStyle(font=low_font, fill=low_fill))
)

# ── Freeze panes ──────────────────────────────────────────────────────────────
ws.freeze_panes = "A2"

# ── Sheet title row above headers ─────────────────────────────────────────────
ws.insert_rows(1)
ws.row_dimensions[1].height = 36
ws.merge_cells("A1:I1")
title_cell = ws["A1"]
title_cell.value = "Lab Results — Shankar  |  Date: May 20, 2026  |  Sample Data"
title_cell.font = Font(name="Arial", bold=True, size=13, color=WHITE)
title_cell.fill = hdr_fill("0D2F4F")
title_cell.alignment = Alignment(horizontal="center", vertical="center")

# ── Sheet 2: Missing Tests ────────────────────────────────────────────────────
ws2 = wb.create_sheet("Recommended Additional Tests")

ws2.column_dimensions["A"].width = 32
ws2.column_dimensions["B"].width = 42
ws2.column_dimensions["C"].width = 38

ws2.row_dimensions[1].height = 36
ws2.merge_cells("A1:C1")
t2 = ws2["A1"]
t2.value = "Recommended Tests to Complete Your Panel"
t2.font = Font(name="Arial", bold=True, size=13, color=WHITE)
t2.fill = hdr_fill("0D2F4F")
t2.alignment = Alignment(horizontal="center", vertical="center")

hdrs2 = ["Test", "Why It Matters", "Normal Range"]
for col, h in enumerate(hdrs2, 1):
    c = ws2.cell(2, col, h)
    c.font = hdr_font(size=10)
    c.fill = hdr_fill(HEADER_BG)
    c.alignment = center()
    c.border = border_thin

missing = [
    ("Fasting Glucose",             "Diagnoses diabetes alongside HbA1c; HbA1c alone can miss acute changes",       "70–99 mg/dL"),
    ("Blood Urea Nitrogen (BUN)",   "Pairs with creatinine to assess kidney function & hydration",                  "7–20 mg/dL"),
    ("BUN/Creatinine Ratio",        "Helps distinguish pre-renal vs. renal cause of kidney impairment",             "10–20"),
    ("AST (Aspartate Aminotransferase)", "Liver enzyme; should always be ordered with ALT for full liver picture",  "10–40 U/L"),
    ("Alkaline Phosphatase (ALP)",  "Liver/bile duct & bone health marker",                                        "44–147 U/L"),
    ("Total Bilirubin",             "Detects liver disease, bile duct obstruction, hemolysis",                     "0.2–1.2 mg/dL"),
    ("Albumin",                     "Nutritional status & liver synthetic function",                                "3.5–5.0 g/dL"),
    ("Calcium",                     "Bone, kidney, and parathyroid health",                                        "8.6–10.3 mg/dL"),
    ("Magnesium",                   "Muscle/nerve function; often low with poor diet or certain meds",              "1.7–2.2 mg/dL"),
    ("Chloride",                    "Electrolyte balance; part of basic metabolic panel",                           "98–107 mEq/L"),
    ("CO₂ / Bicarbonate",           "Acid-base balance; flags metabolic acidosis/alkalosis",                       "22–29 mEq/L"),
    ("Vitamin D (25-OH)",           "Very commonly deficient; affects bone, immune, and cardiovascular health",    "30–100 ng/mL"),
    ("Vitamin B12",                 "Neurological function; deficiency can mimic dementia or neuropathy",           "200–900 pg/mL"),
    ("Ferritin",                    "Best single marker of iron stores; low = iron deficiency, high = inflammation", "30–400 ng/mL (males)"),
    ("Serum Iron + TIBC",           "Complete iron panel to evaluate anemia type",                                  "Varies"),
    ("hs-CRP",                      "High-sensitivity inflammation marker; cardiovascular risk stratification",     "<1.0 mg/L low risk"),
    ("Uric Acid",                   "Gout risk; elevated with high-purine diet or kidney issues",                  "3.5–7.2 mg/dL (males)"),
    ("PSA (if male ≥40–50)",        "Prostate cancer screening; discuss timing with physician",                    "<4.0 ng/mL"),
    ("Urinalysis (UA)",             "Screens kidneys, bladder, UTI, and glucose spill",                            "Varies"),
]

for i, (test, why, rng) in enumerate(missing, 3):
    bg = ALT_ROW if i % 2 == 0 else WHITE
    ws2.row_dimensions[i].height = 22
    for col, val in enumerate([test, why, rng], 1):
        c = ws2.cell(i, col, val)
        c.font = cell_font()
        c.fill = hdr_fill(bg)
        c.border = border_thin
        c.alignment = left()

wb.save("/sessions/zealous-wonderful-bell/mnt/outputs/Lab_Results_Shankar.xlsx")
print("Saved.")

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.formatting.rule import Rule
from openpyxl.styles.differential import DifferentialStyle
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

wb = Workbook()
ws = wb.active
ws.title = "Lab Results"

# ── Colors ────────────────────────────────────────────────────────────────────
HEADER_BG   = "1F4E79"
HEADER2_BG  = "2E75B6"
WHITE       = "FFFFFF"
ALT_ROW     = "F2F7FB"
GREEN_FILL  = "C6EFCE"; GREEN_FONT  = "276221"
RED_FILL    = "FFC7CE"; RED_FONT    = "9C0006"
YELLOW_FILL = "FFEB9C"; YELLOW_FONT = "9C6500"

thin = Side(style="thin",   color="BFBFBF")
med  = Side(style="medium", color="1F4E79")
b_thin = Border(left=thin,  right=thin,  top=thin,  bottom=thin)
b_med  = Border(left=med,   right=med,   top=med,   bottom=med)

def fill(hex): return PatternFill("solid", fgColor=hex)
def font(bold=False, color="000000", size=10, italic=False):
    return Font(name="Arial", bold=bold, color=color, size=size, italic=italic)
def center(): return Alignment(horizontal="center", vertical="center", wrap_text=True)
def left():   return Alignment(horizontal="left",   vertical="center", wrap_text=True)

# ── Row 1: Title ──────────────────────────────────────────────────────────────
ws.merge_cells("A1:K1")
ws.row_dimensions[1].height = 36
c = ws["A1"]
c.value     = "Lab Results — Shankar  |  Date: May 20, 2026  |  Sample Data"
c.font      = Font(name="Arial", bold=True, size=13, color=WHITE)
c.fill      = fill("0D2F4F")
c.alignment = center()

# ── Row 2: Sex selector label + dropdown ─────────────────────────────────────
ws.row_dimensions[2].height = 24
ws.merge_cells("A2:B2")
lbl = ws["A2"]
lbl.value     = "Patient Sex (for Status range):"
lbl.font      = font(bold=True, size=10)
lbl.fill      = fill("D6E4F0")
lbl.alignment = left()
lbl.border    = b_thin

sex_cell = ws["C2"]
sex_cell.value     = "Male"        # default
sex_cell.font      = font(bold=True, size=10, color="1F4E79")
sex_cell.fill      = fill("FFFF00")
sex_cell.alignment = center()
sex_cell.border    = b_thin

# Data validation dropdown
dv = DataValidation(type="list", formula1='"Male,Female"', allow_blank=False)
dv.sqref = "C2"
ws.add_data_validation(dv)

ws["D2"].value     = "← change to Male or Female"
ws["D2"].font      = font(italic=True, size=9, color="595959")
ws["D2"].alignment = left()
ws.merge_cells("D2:K2")

# ── Row 3: blank spacer ───────────────────────────────────────────────────────
ws.row_dimensions[3].height = 6

# ── Row 4: Column headers ─────────────────────────────────────────────────────
headers = [
    "Panel", "Test Name", "Result", "Unit",
    "Low ♂ (Male)", "High ♂ (Male)",
    "Low ♀ (Female)", "High ♀ (Female)",
    "Status", "Date", "Notes"
]
col_widths = [26, 34, 10, 18, 14, 14, 16, 16, 12, 13, 38]

ws.row_dimensions[4].height = 28
for col, (h, w) in enumerate(zip(headers, col_widths), 1):
    c = ws.cell(4, col, h)
    c.font      = Font(name="Arial", bold=True, color=WHITE, size=10)
    c.fill      = fill(HEADER_BG)
    c.alignment = center()
    c.border    = b_med
    ws.column_dimensions[get_column_letter(col)].width = w

# ── Data ─────────────────────────────────────────────────────────────────────
# (panel, test, result, unit, m_lo, m_hi, f_lo, f_hi, date, notes)
# 9999 = no upper bound; -9999 = no lower bound shown as "—"
NONE = 9999
data = [
    # CBC
    ("CBC & Differential", "White Blood Cell (WBC)",           7.2,  "K/μL",     4.5,  11.0,   4.5,  11.0, "2026-05-20", ""),
    ("CBC & Differential", "Red Blood Cell (RBC)",             4.8,  "M/μL",     4.7,   6.1,   4.2,   5.4, "2026-05-20", ""),
    ("CBC & Differential", "Hemoglobin (Hgb)",                14.5,  "g/dL",    13.5,  17.5,  12.0,  15.5, "2026-05-20", ""),
    ("CBC & Differential", "Hematocrit (Hct)",                43.0,  "%",       41.0,  53.0,  36.0,  46.0, "2026-05-20", ""),
    ("CBC & Differential", "Mean Corpuscular Volume (MCV)",   88.0,  "fL",      80.0, 100.0,  80.0, 100.0, "2026-05-20", ""),
    ("CBC & Differential", "MCH",                             29.0,  "pg",      27.0,  33.0,  27.0,  33.0, "2026-05-20", ""),
    ("CBC & Differential", "MCHC",                            33.5,  "g/dL",    32.0,  36.0,  32.0,  36.0, "2026-05-20", ""),
    ("CBC & Differential", "Platelets",                      245.0,  "K/μL",   150.0, 400.0, 150.0, 400.0, "2026-05-20", ""),
    ("CBC & Differential", "Neutrophils",                     58.0,  "%",       45.0,  75.0,  45.0,  75.0, "2026-05-20", ""),
    ("CBC & Differential", "Lymphocytes",                     32.0,  "%",       20.0,  45.0,  20.0,  45.0, "2026-05-20", ""),
    ("CBC & Differential", "Monocytes",                        7.0,  "%",        2.0,  10.0,   2.0,  10.0, "2026-05-20", ""),
    ("CBC & Differential", "Eosinophils",                      2.0,  "%",        0.0,   6.0,   0.0,   6.0, "2026-05-20", ""),
    ("CBC & Differential", "Basophils",                        1.0,  "%",        0.0,   2.0,   0.0,   2.0, "2026-05-20", ""),
    # Lipid
    ("Non-Fasting Lipid Panel", "Total Cholesterol",         195.0, "mg/dL",     0.0, 200.0,   0.0, 200.0, "2026-05-20", "Desirable: <200"),
    ("Non-Fasting Lipid Panel", "LDL Cholesterol",           118.0, "mg/dL",     0.0, 100.0,   0.0, 100.0, "2026-05-20", "Optimal <100; Near-optimal 100–129"),
    ("Non-Fasting Lipid Panel", "HDL Cholesterol",            52.0, "mg/dL",    40.0,  NONE,  50.0,  NONE, "2026-05-20", "Higher is better; ♂>40, ♀>50; >60=protective"),
    ("Non-Fasting Lipid Panel", "Triglycerides",             145.0, "mg/dL",     0.0, 150.0,   0.0, 150.0, "2026-05-20", "Non-fasting; <150 normal"),
    ("Non-Fasting Lipid Panel", "Non-HDL Cholesterol",       143.0, "mg/dL",     0.0, 130.0,   0.0, 130.0, "2026-05-20", "Optimal <130"),
    # Creatinine
    ("Creatinine & eGFR",  "Creatinine",                      1.0, "mg/dL",     0.7,   1.3,   0.6,   1.1, "2026-05-20", ""),
    ("Creatinine & eGFR",  "eGFR",                           82.0, "mL/min/1.73m²", 60.0, NONE, 60.0, NONE, "2026-05-20", ">60 = normal kidney function"),
    # Electrolytes
    ("Sodium",    "Sodium (Na⁺)",                           140.0, "mEq/L",   136.0, 145.0, 136.0, 145.0, "2026-05-20", ""),
    ("Potassium", "Potassium (K⁺)",                           4.2, "mEq/L",     3.5,   5.1,   3.5,   5.1, "2026-05-20", ""),
    # HbA1c
    ("Hemoglobin A1C", "Hemoglobin A1C",                      5.8, "%",          0.0,   5.7,   0.0,   5.7, "2026-05-20", "Normal <5.7%; Prediabetes 5.7–6.4%"),
    # TSH
    ("TSH", "Thyroid Stimulating Hormone (TSH)",              2.1, "mIU/L",      0.4,   4.0,   0.4,   4.0, "2026-05-20", ""),
    # ALT
    ("ALT", "Alanine Aminotransferase (ALT)",                28.0, "U/L",        7.0,  56.0,   7.0,  45.0, "2026-05-20", "Upper limit differs by sex"),
]

START_ROW = 5
prev_panel = None
color_toggle = False

for i, (panel, test, result, unit, m_lo, m_hi, f_lo, f_hi, date, notes) in enumerate(data):
    r = START_ROW + i
    ws.row_dimensions[r].height = 20

    if panel != prev_panel:
        color_toggle = not color_toggle
        prev_panel = panel
    bg = ALT_ROW if color_toggle else WHITE

    # Display values — show "—" where there's no meaningful bound
    m_lo_disp = m_lo if m_lo > 0  else "—"
    m_hi_disp = m_hi if m_hi < NONE else "—"
    f_lo_disp = f_lo if f_lo > 0  else "—"
    f_hi_disp = f_hi if f_hi < NONE else "—"

    # Status formula using $C$2 sex selector
    # Cols: C=result, E=m_lo, F=m_hi, G=f_lo, H=f_hi
    lo_formula = f'IF($C$2="Male",E{r},G{r})'
    hi_formula = f'IF($C$2="Male",F{r},H{r})'

    status = (
        f'=IF(C{r}="","—",'
        f'IF(AND({lo_formula}=0,{hi_formula}={NONE}),"—",'
        f'IF(C{r}<{lo_formula},"Low",'
        f'IF(C{r}>{hi_formula},"High","Normal"))))'
    )

    row_vals = [panel, test, result, unit, m_lo_disp, m_hi_disp, f_lo_disp, f_hi_disp, status, date, notes]

    for col, val in enumerate(row_vals, 1):
        c = ws.cell(r, col, val)
        c.font      = font(bold=(col == 3))
        c.fill      = fill(bg)
        c.border    = b_thin
        c.alignment = center() if col in (3, 5, 6, 7, 8, 9, 10) else left()

# ── Conditional formatting on Status col (I) ──────────────────────────────────
last = START_ROW + len(data) - 1
rng  = f"I{START_ROW}:I{last}"

ws.conditional_formatting.add(rng, Rule(
    type="containsText", operator="containsText", text="Normal",
    dxf=DifferentialStyle(font=Font(color=GREEN_FONT, bold=True),
                          fill=PatternFill("solid", bgColor=GREEN_FILL))))
ws.conditional_formatting.add(rng, Rule(
    type="containsText", operator="containsText", text="High",
    dxf=DifferentialStyle(font=Font(color=RED_FONT, bold=True),
                          fill=PatternFill("solid", bgColor=RED_FILL))))
ws.conditional_formatting.add(rng, Rule(
    type="containsText", operator="containsText", text="Low",
    dxf=DifferentialStyle(font=Font(color=YELLOW_FONT, bold=True),
                          fill=PatternFill("solid", bgColor=YELLOW_FILL))))

ws.freeze_panes = "A5"

# ── Sheet 2: Recommended Tests (unchanged) ────────────────────────────────────
ws2 = wb.create_sheet("Recommended Additional Tests")
ws2.column_dimensions["A"].width = 32
ws2.column_dimensions["B"].width = 42
ws2.column_dimensions["C"].width = 38

ws2.merge_cells("A1:C1")
ws2.row_dimensions[1].height = 36
t = ws2["A1"]
t.value     = "Recommended Tests to Complete Your Panel"
t.font      = Font(name="Arial", bold=True, size=13, color=WHITE)
t.fill      = fill("0D2F4F")
t.alignment = center()

for col, h in enumerate(["Test", "Why It Matters", "Normal Range"], 1):
    c = ws2.cell(2, col, h)
    c.font = Font(name="Arial", bold=True, color=WHITE, size=10)
    c.fill = fill(HEADER_BG)
    c.alignment = center()
    c.border = b_thin

missing = [
    ("Fasting Glucose",                  "Diagnoses diabetes alongside HbA1c; HbA1c alone can miss acute changes",       "70–99 mg/dL"),
    ("Blood Urea Nitrogen (BUN)",        "Pairs with creatinine to assess kidney function & hydration",                  "7–20 mg/dL"),
    ("BUN/Creatinine Ratio",             "Helps distinguish pre-renal vs. renal cause of kidney impairment",             "10–20"),
    ("AST (Aspartate Aminotransferase)", "Liver enzyme; should always be ordered with ALT for full liver picture",       "10–40 U/L (♂); 10–35 U/L (♀)"),
    ("Alkaline Phosphatase (ALP)",       "Liver/bile duct & bone health marker",                                         "44–147 U/L"),
    ("Total Bilirubin",                  "Detects liver disease, bile duct obstruction, hemolysis",                      "0.2–1.2 mg/dL"),
    ("Albumin",                          "Nutritional status & liver synthetic function",                                 "3.5–5.0 g/dL"),
    ("Calcium",                          "Bone, kidney, and parathyroid health",                                         "8.6–10.3 mg/dL"),
    ("Magnesium",                        "Muscle/nerve function; often low with poor diet or certain meds",              "1.7–2.2 mg/dL"),
    ("Chloride",                         "Electrolyte balance; part of basic metabolic panel",                           "98–107 mEq/L"),
    ("CO₂ / Bicarbonate",               "Acid-base balance; flags metabolic acidosis/alkalosis",                        "22–29 mEq/L"),
    ("Vitamin D (25-OH)",               "Very commonly deficient; affects bone, immune, and cardiovascular health",     "30–100 ng/mL"),
    ("Vitamin B12",                      "Neurological function; deficiency can mimic dementia or neuropathy",           "200–900 pg/mL"),
    ("Ferritin",                         "Best single marker of iron stores; low=iron deficiency, high=inflammation",   "30–400 ng/mL (♂); 12–150 ng/mL (♀)"),
    ("Serum Iron + TIBC",               "Complete iron panel to evaluate anemia type",                                   "Varies"),
    ("hs-CRP",                           "High-sensitivity inflammation marker; cardiovascular risk stratification",     "<1.0 mg/L low risk"),
    ("Uric Acid",                        "Gout risk; elevated with high-purine diet or kidney issues",                   "3.5–7.2 mg/dL (♂); 2.6–6.0 mg/dL (♀)"),
    ("PSA (if male ≥40–50)",            "Prostate cancer screening; discuss timing with physician",                     "<4.0 ng/mL"),
    ("Urinalysis (UA)",                  "Screens kidneys, bladder, UTI, and glucose spill",                             "Varies"),
]

for i, (test, why, rng_) in enumerate(missing, 3):
    bg = ALT_ROW if i % 2 == 0 else WHITE
    ws2.row_dimensions[i].height = 22
    for col, val in enumerate([test, why, rng_], 1):
        c = ws2.cell(i, col, val)
        c.font      = font()
        c.fill      = fill(bg)
        c.border    = b_thin
        c.alignment = left()

out = "/sessions/zealous-wonderful-bell/mnt/outputs/Lab_Results_Shankar.xlsx"
wb.save(out)
print("Saved.")

# ── Patch: load saved file, append BP rows ────────────────────────────────────
from openpyxl import load_workbook

wb2 = load_workbook(out)
ws  = wb2["Lab Results"]

# Find last data row
last_data_row = 5 + len(data) - 1   # same len(data) as above = 25 rows → row 29

# BP rows to append
NONE = 9999
bp_rows = [
    ("Blood Pressure", "Systolic BP",  118.0, "mmHg", 90.0, 120.0, 90.0, 120.0, "2026-05-20", "Normal <120; Elevated 120–129; Stage 1 HTN 130–139"),
    ("Blood Pressure", "Diastolic BP",  76.0, "mmHg", 60.0,  80.0, 60.0,  80.0, "2026-05-20", "Normal <80; Stage 1 HTN 80–89; Stage 2 ≥90"),
]

thin = Side(style="thin", color="BFBFBF")
b_thin = Border(left=thin, right=thin, top=thin, bottom=thin)

for i, (panel, test, result, unit, m_lo, m_hi, f_lo, f_hi, date, notes) in enumerate(bp_rows):
    r = last_data_row + 1 + i
    ws.row_dimensions[r].height = 20
    bg = "F2F7FB"   # same alt-row shade (new panel = first toggle)

    m_lo_disp = m_lo if m_lo > 0    else "—"
    m_hi_disp = m_hi if m_hi < NONE else "—"
    f_lo_disp = f_lo if f_lo > 0    else "—"
    f_hi_disp = f_hi if f_hi < NONE else "—"

    lo_formula = f'IF($C$2="Male",E{r},G{r})'
    hi_formula = f'IF($C$2="Male",F{r},H{r})'
    status = (
        f'=IF(C{r}="","—",'
        f'IF(AND({lo_formula}=0,{hi_formula}={NONE}),"—",'
        f'IF(C{r}<{lo_formula},"Low",'
        f'IF(C{r}>{hi_formula},"High","Normal"))))'
    )

    row_vals = [panel, test, result, unit, m_lo_disp, m_hi_disp, f_lo_disp, f_hi_disp, status, date, notes]
    for col, val in enumerate(row_vals, 1):
        c = ws.cell(r, col, val)
        c.font      = Font(name="Arial", bold=(col==3), size=10)
        c.fill      = PatternFill("solid", fgColor=bg)
        c.border    = b_thin
        c.alignment = (Alignment(horizontal="center", vertical="center", wrap_text=True)
                       if col in (3,5,6,7,8,9,10) else
                       Alignment(horizontal="left", vertical="center", wrap_text=True))

# Extend conditional formatting to cover new rows
new_last = last_data_row + len(bp_rows)
rng = f"I5:I{new_last}"
from openpyxl.formatting.rule import Rule
from openpyxl.styles.differential import DifferentialStyle
# clear and re-add (openpyxl appends fine)
ws.conditional_formatting.add(rng, Rule(
    type="containsText", operator="containsText", text="Normal",
    dxf=DifferentialStyle(font=Font(color="276221", bold=True),
                          fill=PatternFill("solid", bgColor="C6EFCE"))))
ws.conditional_formatting.add(rng, Rule(
    type="containsText", operator="containsText", text="High",
    dxf=DifferentialStyle(font=Font(color="9C0006", bold=True),
                          fill=PatternFill("solid", bgColor="FFC7CE"))))
ws.conditional_formatting.add(rng, Rule(
    type="containsText", operator="containsText", text="Low",
    dxf=DifferentialStyle(font=Font(color="9C6500", bold=True),
                          fill=PatternFill("solid", bgColor="FFEB9C"))))

wb2.save(out)
print("BP rows added.")
